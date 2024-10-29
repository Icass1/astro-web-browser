import type { FileStats } from "@/types";
import { Share2 } from "lucide-react";
import { type Dispatch, type SetStateAction } from 'react';
import '@/styles/globals.css'
import BaseFile from "./Base";

export default function DetailsView(
    { file }: { file: FileStats }
) {

    return (
        <>
            <img src={file.iconPath} className="w-6 h-6" />
            <h3 className="font-semibold truncate max-w-full min-w-0">{file.name}</h3>
            <p className="text-sm text-muted-foreground truncate max-w-full min-w-0">
                {file.isDirectory ? ' ' : file.size + ' • '}
                {file.modified}
            </p>
            {
                file.shared ?
                    <Share2 className="w-4 h-4 text-blue-500 inline-block ml-2" />
                    :
                    <label></label>
            }
        </>
    )

    // return (
    //     <BaseFile className="grid grid-cols-[24px_2fr_250px_30px] gap-3 items-center border-0 py-1" file={file} path={path} setOverDirectory={setOverDirectory} href={href} editable={editable}>
    //         <img src={file.iconPath} className="w-6 h-6" />
    //         <h3 className="font-semibold truncate max-w-full min-w-0">{file.name}</h3>
    //         <p className="text-sm text-muted-foreground truncate max-w-full min-w-0">
    //             {file.isDirectory ? ' ' : file.size + ' • '}
    //             {file.modified}
    //         </p>
    //         {
    //             file.shared ?
    //                 <Share2 className="w-4 h-4 text-blue-500 inline-block ml-2" />
    //                 :
    //                 <label></label>
    //         }
    //     </BaseFile>
    // )
}
