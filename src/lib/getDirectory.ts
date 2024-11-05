import type { DatabaseShare, DatabaseUser, FileStats } from "@/types";
import * as fs from 'fs/promises';
import * as path from 'path';
import { getFileIcon, getFolderIcon } from '@/lib/getIcons'
// @ts-ignore
import { fileTypeFromFile } from 'file-type'
import { db } from "@/lib/db";

import * as simpleGit from "simple-git"

function getFileSize(size: number) {

    let units = ["KB", "MB", "GB", "TB"]

    let outUnitIndex = 0
    let outSize = Math.round(size / 1000)

    for (let _ of Array(units.length - 1)) {
        if (outSize > 1000) {
            outSize = Math.round(outSize / 1000)
            outUnitIndex++;
        } else {
            break;
        }
    }
    return outSize.toString() + " " + units[outUnitIndex]
}


export async function getDirectory(directoryPath: string, userId: string | undefined) {


    const git = simpleGit.simpleGit(directoryPath)

    let gitStatus

    try {
        gitStatus = await git.status()
    } catch {
        gitStatus = undefined

    }


    let directoryListing: FileStats[] | undefined = undefined;

    const files: string[] = (await fs.readdir(directoryPath));

    let userShares: string[] = []
    let pinnedFiles: string[] = []
    if (userId) {
        userShares = JSON.parse((db.prepare(`SELECT shares FROM user WHERE id='${(userId as string)}'`).get() as DatabaseUser).shares) as string[]
        pinnedFiles = JSON.parse((db.prepare(`SELECT pinned_files FROM user WHERE id='${(userId as string)}'`).get() as DatabaseUser).pinned_files) as string[]
    } else {
        userShares = []
        pinnedFiles = []
    }

    // Iterate over the files and get stats for each
    directoryListing = await Promise.all(
        files.map(async (file): Promise<FileStats> => {
            const filePath = path.join(directoryPath, file);
            const stats = await fs.stat(filePath);

            let gitStatus

            try {
                gitStatus = await git.status(["--", file])
            } catch {
                gitStatus = undefined
            }

            const pinned = pinnedFiles.includes(filePath)

            let share = db.prepare(`SELECT * FROM share WHERE local_path='${filePath.replace(/'/g, "''")}'`).get() as DatabaseShare | undefined
            if ((share?.expires_at && new Date(share?.expires_at) < new Date()) || (share?.id && !userShares.includes(share?.id))) {
                share = undefined
            }

            // Return file details
            return {
                name: file,
                size: getFileSize(stats.size), // File size in bytes
                // modified: stats.mtime.toString().replace("GMT+0200 (Central European Summer Time)", ""), // Last modified date
                modified: `${stats.mtime.getDate()}/${stats.mtime.getMonth() + 1}/${stats.mtime.getFullYear().toString().padStart(2, "0")} ${stats.mtime.getHours()}:${stats.mtime.getMinutes().toString().padStart(2, "0")}`, // Last modified date
                isDirectory: stats.isDirectory(),
                iconPath: stats.isDirectory() ? getFolderIcon(file) : getFileIcon(file),
                shared: share == undefined ? false : true,
                shareInfo: share,
                mime: undefined,
                pinned: pinned,
                gitStatus: gitStatus
            };
        })
    );

    let directoriesOut = directoryListing.filter(el => el.isDirectory)
    directoriesOut.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    let filesOut = directoryListing.filter(el => !el.isDirectory)
    filesOut.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    let share = db.prepare(`SELECT * FROM share WHERE local_path='${directoryPath}'`).get() as DatabaseShare | undefined
    if ((share?.expires_at && new Date(share?.expires_at) < new Date()) || (share?.id && !userShares.includes(share?.id))) {
        share = undefined
    }

    return {
        files: [...directoriesOut, ...filesOut],
        gitStatus: gitStatus,
        pinned: pinnedFiles.includes(directoryPath),
        shared: share == undefined ? false : true,
    }
}