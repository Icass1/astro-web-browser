import type { FileStats } from "@/types";
import { Share2 } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from 'react';
import '@/styles/globals.css'
import BaseFile from "./Base";
import { Skeleton } from "@/components/ui/skeleton";



export default function Galery(
    { file, path, setOverDirectory, href, editable }: { file: FileStats, path: string | undefined, setOverDirectory: Dispatch<SetStateAction<boolean>>, href: string, editable: boolean }
) {
    const [loaded, setLoaded] = useState<boolean>(false)

    const filePreview = () => {
        if (file.mime.startsWith("image")) {
            return <img
                onLoad={() => { setLoaded(true) }}
                className="top-1/2 relative -translate-y-1/2 select-none"
                src={"/api/file/" + path + "/" + file.name}
            />
        } else if (file.mime.startsWith("video")) {
            return <img
                onLoad={() => { setLoaded(true) }}
                className="top-1/2 relative -translate-y-1/2 select-none"
                src={"/preview/" + path + "/" + file.name}
            />
        } else {
            return <img
                onLoad={() => { setLoaded(true) }}
                className="select-none"
                src={file.iconPath}
            />
        }
    }

    return (
        <BaseFile className="shadow relative p-0 flex flex-col gap-2" file={file} path={path} setOverDirectory={setOverDirectory} href={href} editable={editable}>
            <div className="relative aspect-square overflow-hidden select-none">
                {filePreview()}
            </div>

            <div className="absolute h-auto w-full aspect-square">
                {!loaded &&
                    <Skeleton className="h-full w-full relative"></Skeleton>
                }
            </div>

            <div className="p-2 grid grid-cols-[1fr_min-content] gap-2 w-full items-center justify-between ">

                <div className="min-w-0 max-w-full">
                    <h3 className="font-semibold truncate max-w-full min-w-0">{file.name}</h3>
                    <p className="text-sm text-muted-foreground truncate max-w-full min-w-0">
                        {file.isDirectory ? ' ' : file.size + ' • '}
                        {file.modified}
                    </p>
                </div>
                {file.shared ? <Share2 className="text-blue-500 w-5 h-5 mr-2" />
                    :
                    <label />
                }
            </div>
        </BaseFile>
    )
}