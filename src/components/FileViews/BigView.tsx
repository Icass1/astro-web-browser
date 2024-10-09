import type { FileStats } from "@/types";
import { Share2 } from "lucide-react";
import { type Dispatch, type SetStateAction } from 'react';
import '@/styles/globals.css'
import BaseFile from "./Base";

export default function BigView(
    { file, path, setOverDirectory, href, editable }: { file: FileStats, path: string | undefined, setOverDirectory: Dispatch<SetStateAction<boolean>>, href: string, editable: boolean }
) {

    return (
        <BaseFile className="flex flex-row gap-3 items-center" file={file} path={path} setOverDirectory={setOverDirectory} href={href} editable={editable}>
            <img src={file.iconPath} className="w-6 h-6" />
            <div
                className="flex-grow w-0"
            >
                <h3 className="font-semibold truncate max-w-full min-w-0">{file.name}</h3>
                <p className="text-sm text-muted-foreground truncate max-w-full min-w-0">
                    {file.isDirectory ? ' ' : file.size + ' • '}
                    {file.modified}
                </p>
            </div>
            <div className="flex flex-row items-center">
                {file.shared && <Share2 className="w-4 h-4 text-blue-500 inline-block ml-2" />}
            </div>
        </BaseFile>
    )
}
