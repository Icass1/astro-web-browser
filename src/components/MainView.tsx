import type { FileStats } from "@/types"
import Details from "./FileViews/Details"
import { useEffect, useRef, useState, type DragEvent } from 'react';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";


export default function MainView({ path, directoryListing }: { path: string, directoryListing: FileStats[] | undefined }) {

    const [isDragging, setIsDragging] = useState(false);
    const [overDirectory, setOverDirectory] = useState(false);

    const onDrop = async (files: FileList) => {

        for (let fileToUpload of files) {
            // Create a FormData object
            toast(`Uploading '${fileToUpload.name}'`)

            const formData = new FormData();
            formData.append('file', fileToUpload);
            formData.append('path', path ? (path) : (''));


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
        event.stopPropagation();

        setIsDragging(true);
    };

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        setIsDragging(false);
        if (overDirectory) {
            return
        }

        if (event.dataTransfer.files.length > 0) {
            onDrop(event.dataTransfer.files);
        }
    };

    if (!directoryListing) {
        return <div className="text-accent font-bold text-4xl ml-auto mr-auto mt-32 w-fit">Directory not found</div>
    }

    return (
        <div
            className="relative h-full pb-24"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <ScrollArea className="relative h-full">
                <div
                    className={cn("grid grid-cols-[repeat(auto-fill,_minmax(400px,_1fr))] gap-2 px-1 border border-solid rounded-lg", isDragging && !overDirectory ? ' border-blue-300' : 'border-background')}
                >
                    {
                        directoryListing.map((file) => (
                            <Details setOverDirectory={setOverDirectory} key={file.name} path={path} file={file} />
                        ))
                    }
                </div>
            </ScrollArea>
        </div>

    )

}