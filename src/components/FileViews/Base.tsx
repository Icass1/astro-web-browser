import type { FileStats } from "@/types";
import FileDropdownMenu from "../DropdownMenu";
import { Share2 } from "lucide-react";
import { useRef, useState, type Dispatch, type DragEvent, type ReactElement, type SetStateAction } from 'react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import '@/styles/globals.css'
import { uploadFile } from "@/lib/uploadFile";


export default function BaseFile({ file, path, setOverDirectory, children, className }: { className?: string, file: FileStats, path: string | undefined, setOverDirectory: Dispatch<SetStateAction<boolean>>, children: ReactElement[] }) {

    const [isDragging, setIsDragging] = useState(false);

    const onDrop = async (files: FileList) => {
        for (let fileToUpload of files) {
            // Create a FormData object
            uploadFile((path ? (path + "/") : ('')) + file.name, fileToUpload)
        }
    }

    const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        // event.stopPropagation();
        setIsDragging(true);
        setOverDirectory(true)
    };

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        // event.stopPropagation();

        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setIsDragging(false);
            setOverDirectory(false)
        }
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        // event.stopPropagation();
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        // event.stopPropagation();
        setIsDragging(false);
        setOverDirectory(false)
        // console.log(event.dataTransfer.)


        // Move files insde the application.
        const transferData = event.dataTransfer.getData("file-path")

        if (transferData) {
            const data = JSON.parse(transferData)
            const src = data.path + "/" + data.fileName
            const dest = path + "/" + file.name + "/" + data.fileName

            console.log(src, "->", dest)

        }


        if (event.dataTransfer.files.length > 0) {
            onDrop(event.dataTransfer.files);
        }
    };

    return (
        <div
            onDragEnter={file.isDirectory ? handleDragEnter : undefined}
            onDragLeave={file.isDirectory ? handleDragLeave : undefined}
            onDragOver={file.isDirectory ? handleDragOver : undefined}
            onDrop={file.isDirectory ? handleDrop : undefined}
            onDragStart={(e) => { e.dataTransfer.setData("file-path", JSON.stringify({ path: path, fileName: file.name })) }}
            className={'transition-transform ' + (isDragging ? "scale-[1.01]" : '')}
        >
            <a
                className={cn("border rounded-lg py-2 px-3 cursor-pointer hover:bg-muted", isDragging ? 'border-blue-500' : '', className)}
                href={file.isDirectory ? (path ? ("/files/" + path + "/" + file.name) : ("/files/" + file.name)) : ''}
            >
                {children}
            </a >
        </div>
    )
}
