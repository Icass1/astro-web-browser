import type { DatabaseShare, DatabaseUser, FileStats } from "@/types";
import * as fs from 'fs/promises';
import * as path from 'path';
import { getFileIcon, getFolderIcon } from '@/lib/getIcons'
// @ts-ignore
import { fileTypeFromFile } from 'file-type'
import { db } from "@/lib/db";

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

    console.log(pinnedFiles)

    // Iterate over the files and get stats for each
    directoryListing = await Promise.all(
        files.map(async (file): Promise<FileStats> => {
            const filePath = path.join(directoryPath, file);
            const stats = await fs.stat(filePath);

            let fileType

            if (stats.isFile()) {
                try {
                    fileType = await fileTypeFromFile(filePath) || { mime: "none" }
                } catch {
                    fileType = "none"
                }
            } else {
                fileType = { mime: "dir" }
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
                modified: `${stats.mtime.getDate()}/${stats.mtime.getMonth() + 1}/${stats.mtime.getFullYear()} ${stats.mtime.getHours()}:${stats.mtime.getMinutes()}`, // Last modified date
                isDirectory: stats.isDirectory(),
                iconPath: stats.isDirectory() ? getFolderIcon(file) : getFileIcon(file),
                shared: share == undefined ? false : true,
                shareInfo: share,
                mime: fileType.mime,
                pinned: pinned,
            };
        })
    );

    let directoriesOut = directoryListing.filter(el => el.isDirectory).sort(function (a, b) {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    });

    let filesOut = directoryListing.filter(el => !el.isDirectory).sort(function (a, b) {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    });

    return [...directoriesOut, ...filesOut]
}