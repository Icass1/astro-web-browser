import { getDiskInfo, } from 'node-disk-info'
import * as fs from 'fs/promises';
import * as path from 'path';
import type Drive from 'node-disk-info/dist/classes/drive';

interface DiskInfoStorageInterface {
    totalSize: number,
    used: number,
    available: number

}

export async function getDiskInfoStorage(filePath: string): Promise<DiskInfoStorageInterface> {
    try {
        // Get the absolute path
        const absolutePath = path.resolve(filePath);
        // Get filesystem stats of the given path
        const stats = await fs.stat(absolutePath);

        // Check if it's a directory, otherwise get the directory of the file
        const directory = stats.isDirectory() ? absolutePath : path.dirname(absolutePath);

        // Retrieve disk information
        let disks = await getDiskInfo();

        disks.sort((a, b) => {
            if (a.mounted.length > b.mounted.length) {
                return -1
            }
            return 0
        })

        // Find the disk that matches the path
        const disk = disks.find(disk => directory.startsWith(disk.mounted)) as Drive;

        if (disk) {
            return { totalSize: disk.blocks * 1e-6, used: disk.used * 1e-6, available: disk.available * 1e-6 }
        } else {
            console.log(`No disk information found for path: ${absolutePath}`);
        }

    } catch (error) {
        console.error('Error fetching disk information:', error);
    }
    return { totalSize: 1, used: 1, available: 1 }

}
