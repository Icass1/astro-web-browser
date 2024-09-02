import type { FileStats } from "@/types"
import DetailsView from "./FileViews/DetailsView"
import BigView from "./FileViews/BigView"
import { useState, type DragEvent } from 'react';
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";

import Galery from "./FileViews/Galery";

import { $viewIndex } from "./viewIndex"
import { useStore } from '@nanostores/react';
import { uploadFile } from "@/lib/uploadFile";


export default function MainView({ path, directoryListing }: { path: string, directoryListing: FileStats[] | undefined }) {

    const [isDragging, setIsDragging] = useState(false);
    const [overDirectory, setOverDirectory] = useState(false);

    const view = useStore($viewIndex)

    const onDrop = async (files: FileList) => {

        for (let fileToUpload of files) {
            // Create a FormData object

            uploadFile(path ? (path) : (''), fileToUpload)
            // toast(`Uploading '${fileToUpload.name}'`)

            // const formData = new FormData();
            // formData.append('file', fileToUpload);
            // formData.append('path', path ? (path) : (''));

            // try {
            //     // Send the file to the server
            //     const response = await fetch('/api/upload-file', {
            //         method: 'POST',
            //         body: formData,
            //     });

            //     if (!response.ok) {
            //         throw new Error(`Error uploading file: ${response.statusText}`);
            //     }

            //     const result = await response.json();
            //     console.log('File upload successful:', result);
            //     toast(`'${fileToUpload.name}' uploaded succesfully`)
            // } catch (error) {
            //     toast(`'${fileToUpload.name}' couldn't be uploaded`, { style: { color: '#ed4337' } })
            // }
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

    const getGridCols = () => {
        switch (view) {
            case "details":
                return "grid-cols-1"
            case "big":
                return "grid-cols-[repeat(auto-fill,_minmax(400px,_1fr))]"
            case "galery":
                return "grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))]"
        }
    }

    const getFileView = (file: FileStats) => {
        switch (view) {
            case "details":
                return <DetailsView key={file.name} setOverDirectory={setOverDirectory} path={path} file={file} />
            case "big":
                return <BigView key={file.name} setOverDirectory={setOverDirectory} path={path} file={file} />
            case "galery":
                return <Galery key={file.name} setOverDirectory={setOverDirectory} path={path} file={file} />
        }
    }

    return (

        <ScrollArea
            className={cn("relative h-full border border-solid rounded-lg", isDragging && !overDirectory ? ' border-blue-300' : 'border-background',)}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div
                className={cn("grid gap-2 px-1 ", getGridCols())}
            >
                {
                    directoryListing.map((file) => (
                        getFileView(file)
                        // <DetailsView setOverDirectory={setOverDirectory} key={file.name} path={path} file={file} />
                    ))
                }
            </div>
        </ScrollArea>
    )

}