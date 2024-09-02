import type { FileStats } from "@/types";
import FileDropdownMenu from "../DropdownMenu";
import { Share2 } from "lucide-react";
import { type Dispatch, type SetStateAction } from 'react';
import '@/styles/globals.css'
import BaseFile from "./Base";



export default function Galery({ file, path, setOverDirectory }: { file: FileStats, path: string | undefined, setOverDirectory: Dispatch<SetStateAction<boolean>> }) {

    const filePreview = () => {
        if (file.mime.startsWith("image")) {
            return <img className="top-1/2 relative -translate-y-1/2" src={"/file/" + path + "/" + file.name} />
        } else if (file.mime.startsWith("video")) {
            return <img className="top-1/2 relative -translate-y-1/2" src={"/preview/" + path + "/" + file.name} />
        } else {
            return <img src={file.iconPath} />
        }
    }

    return (
        <BaseFile className="shadow p-0 flex flex-col gap-2" file={file} path={path} setOverDirectory={setOverDirectory}>
            <div className="relative aspect-square overflow-hidden">
                {filePreview()}
            </div>
            <div className="p-2">
                <h3 className="font-semibold truncate max-w-full min-w-0">{file.name}</h3>
                <p className="text-sm text-muted-foreground truncate max-w-full min-w-0">
                    {file.isDirectory ? ' ' : file.size + ' B • '}
                    {file.modified}
                </p>
            </div>
        </BaseFile>
    )
}