import type { FileStats } from "@/types";
import FileDropdownMenu from "../DropdownMenu";
import { Share2 } from "lucide-react";
import { useRef, useState, type Dispatch, type DragEvent, type SetStateAction } from 'react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import '@/styles/globals.css'


export default function Details({ file, path, setOverDirectory }: { file: FileStats, path: string | undefined, setOverDirectory: Dispatch<SetStateAction<boolean>> }) {

    const [isDragging, setIsDragging] = useState(false);

    const onDrop = async (files: FileList) => {

        for (let fileToUpload of files) {
            // Create a FormData object
            toast(`Uploading '${fileToUpload.name}'`)

            const formData = new FormData();
            formData.append('file', fileToUpload);
            formData.append('path', path ? (path + "/") : ('') + file.name);

            try {
                // Send the file to the server
                const response = await fetch('/api/upload-file', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`Error uploading file: ${response.statusText}`);
                }

                const result = await response.json();
                console.log('File upload successful:', result);
                toast(`'${fileToUpload.name}' uploaded succesfully`)
            } catch (error) {
                toast(`'${fileToUpload.name}' couldn't be uploaded`, { style: { color: '#ed4337' } })
            }
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
            className={'transition-transform ' + (isDragging ? "scale-[1.01]" : '')}
        >
            <a
                className={cn("border rounded-lg py-2 px-3 flex flex-row gap-3 items-center cursor-pointer hover:bg-muted", isDragging ? 'border-blue-500' : '')}
                href={file.isDirectory ? (path ? ("/files/" + path + "/" + file.name) : ("/files/" + file.name)) : ''}
            >
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
                    <FileDropdownMenu />
                </div>
            </a >
        </div>
    )
}
