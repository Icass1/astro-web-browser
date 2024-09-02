import type { FileStats } from "@/types";
import * as fs from 'fs/promises';
import * as path from 'path';
import { getFileIcon, getFolderIcon } from '@/lib/getIcons'
// @ts-ignore
import { fileTypeFromFile } from 'file-type'


function getFileSize(size: number) {

    let units = ["KB", "MB", "GB", "TB"]

    let outUnitIndex = 0
    let outSize = Math.round(size / 1000)

    for (let i of Array(units.length - 1)) {
        if (outSize > 1000) {
            outSize = Math.round(outSize / 1000)
            outUnitIndex++;
        } else {
            break;
        }
    }

    return outSize.toString() + " " + units[outUnitIndex]
}


export async function getDirectory(directoryPath: string) {

    let directoryListing: FileStats[] | undefined = undefined;

    const files: string[] = (await fs.readdir(directoryPath));

    // Iterate over the files and get stats for each
    directoryListing = await Promise.all(
        files.map(async (file): Promise<FileStats> => {
            const filePath = path.join(directoryPath, file);
            const stats = await fs.stat(filePath);

            let fileType

            if (stats.isFile()) {
                fileType = await fileTypeFromFile(filePath) || { mime: "none" }
            } else {
                fileType = { mime: "dir" }
            }

            // Return file details
            return {
                name: file,
                size: getFileSize(stats.size), // File size in bytes
                modified: stats.mtime.toString().replace("GMT+0200 (Central European Summer Time)", ""), // Last modified date
                isDirectory: stats.isDirectory(),
                iconPath: stats.isDirectory() ? getFolderIcon(file) : getFileIcon(file),
                shared: false,
                mime: fileType.mime,
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

    return [...directoriesOut, ...filesOut].slice(0, 50)
}