import { getDiskInfo, } from 'node-disk-info'
import * as fs from 'fs/promises';
import * as path from 'path';
import Drive from 'node-disk-info/dist/classes/drive';

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


        // Cache disk info
        // let disks = [
        //     {
        //         filesystem: 'none',
        //         blocks: 6126628,
        //         used: 4,
        //         available: 6126624,
        //         capacity: '1%',
        //         mounted: '/wsl'
        //     },
        //     {
        //         filesystem: 'none',
        //         blocks: 398092400,
        //         used: 249612644,
        //         available: 148479756,
        //         capacity: '63%',
        //         mounted: '/usr/lib/wsl/drivers'
        //     },
        //     {
        //         filesystem: 'none',
        //         blocks: 6126628,
        //         used: 0,
        //         available: 6126628,
        //         capacity: '0%',
        //         mounted: '/usr/lib/modules'
        //     },
        //     {
        //         filesystem: 'none',
        //         blocks: 6126628,
        //         used: 0,
        //         available: 6126628,
        //         capacity: '0%',
        //         mounted: '/usr/lib/modules/5.15.146.1-microsoft-standard-WSL2'
        //     },
        //     {
        //         filesystem: '/dev/sdc',
        //         blocks: 1055762868,
        //         used: 10249976,
        //         available: 991809420,
        //         capacity: '2%',
        //         mounted: '/'
        //     },
        //     {
        //         filesystem: 'none',
        //         blocks: 6126628,
        //         used: 88,
        //         available: 6126540,
        //         capacity: '1%',
        //         mounted: '/wslg'
        //     },
        //     {
        //         filesystem: 'none',
        //         blocks: 6126628,
        //         used: 0,
        //         available: 6126628,
        //         capacity: '0%',
        //         mounted: '/usr/lib/wsl/lib'
        //     },
        //     {
        //         filesystem: 'rootfs',
        //         blocks: 6123372,
        //         used: 1884,
        //         available: 6121488,
        //         capacity: '1%',
        //         mounted: '/init'
        //     },
        //     {
        //         filesystem: 'none',
        //         blocks: 6126628,
        //         used: 2336,
        //         available: 6124292,
        //         capacity: '1%',
        //         mounted: '/run'
        //     },
        //     {
        //         filesystem: 'none',
        //         blocks: 6126628,
        //         used: 0,
        //         available: 6126628,
        //         capacity: '0%',
        //         mounted: '/run/lock'
        //     },
        //     {
        //         filesystem: 'none',
        //         blocks: 6126628,
        //         used: 0,
        //         available: 6126628,
        //         capacity: '0%',
        //         mounted: '/run/shm'
        //     },
        //     {
        //         filesystem: 'tmpfs',
        //         blocks: 4096,
        //         used: 0,
        //         available: 4096,
        //         capacity: '0%',
        //         mounted: '/sys/fs/cgroup'
        //     },
        //     {
        //         filesystem: 'none',
        //         blocks: 6126628,
        //         used: 96,
        //         available: 6126532,
        //         capacity: '1%',
        //         mounted: '/wslg/versions.txt'
        //     },
        //     {
        //         filesystem: 'none',
        //         blocks: 6126628,
        //         used: 96,
        //         available: 6126532,
        //         capacity: '1%',
        //         mounted: '/wslg/doc'
        //     },
        //     {
        //         filesystem: 'C:\\',
        //         blocks: 398092400,
        //         used: 249612644,
        //         available: 148479756,
        //         capacity: '63%',
        //         mounted: '/c'
        //     },
        //     {
        //         filesystem: 'D:\\',
        //         blocks: 976744444,
        //         used: 560344016,
        //         available: 416400428,
        //         capacity: '58%',
        //         mounted: '/d'
        //     },
        //     {
        //         filesystem: 'snapfuse',
        //         blocks: 128,
        //         used: 128,
        //         available: 0,
        //         capacity: '100%',
        //         mounted: '/snap/bare/5'
        //     },
        //     {
        //         filesystem: 'snapfuse',
        //         blocks: 76160,
        //         used: 76160,
        //         available: 0,
        //         capacity: '100%',
        //         mounted: '/snap/core22/1564'
        //     },
        //     {
        //         filesystem: 'snapfuse',
        //         blocks: 76160,
        //         used: 76160,
        //         available: 0,
        //         capacity: '100%',
        //         mounted: '/snap/core22/1586'
        //     },
        //     {
        //         filesystem: 'snapfuse',
        //         blocks: 93952,
        //         used: 93952,
        //         available: 0,
        //         capacity: '100%',
        //         mounted: '/snap/gtk-common-themes/1535'
        //     },
        //     {
        //         filesystem: 'snapfuse',
        //         blocks: 41856,
        //         used: 41856,
        //         available: 0,
        //         capacity: '100%',
        //         mounted: '/snap/snapd/20290'
        //     },
        //     {
        //         filesystem: 'snapfuse',
        //         blocks: 39808,
        //         used: 39808,
        //         available: 0,
        //         capacity: '100%',
        //         mounted: '/snap/snapd/21759'
        //     },
        //     {
        //         filesystem: 'snapfuse',
        //         blocks: 134272,
        //         used: 134272,
        //         available: 0,
        //         capacity: '100%',
        //         mounted: '/snap/ubuntu-desktop-installer/1276'
        //     },
        //     {
        //         filesystem: 'snapfuse',
        //         blocks: 134912,
        //         used: 134912,
        //         available: 0,
        //         capacity: '100%',
        //         mounted: '/snap/ubuntu-desktop-installer/1286'
        //     }
        // ]



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
