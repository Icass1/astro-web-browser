import type { FileStats } from "@/types";
import fs from 'fs/promises';
import path from 'path';
import {getFileIcon, getFolderIcon} from '@/lib/getIcons'


export async  function getDirectory(directoryPath: string) {

    let directoryListing: FileStats[] | undefined = undefined;

    const files: string[] = (await fs.readdir(directoryPath)).slice(0, 100);

    // Iterate over the files and get stats for each
    directoryListing = await Promise.all(
        files.map(async (file): Promise<FileStats> => {
            const filePath = path.join(directoryPath, file);
            const stats = await fs.stat(filePath);

            // console.log(file, stats.isDirectory(), getFileIcon(file))

            // Return file details
            return {
                name: file,
                size: stats.size.toString(), // File size in bytes
                modified: stats.mtime.toString().replace("GMT+0200 (Central European Summer Time)", ""), // Last modified date
                isDirectory: stats.isDirectory(),
                iconPath: stats.isDirectory() ? getFolderIcon(file) : getFileIcon(file),
                shared: false,
            };
        })
    );

    return directoryListing
}