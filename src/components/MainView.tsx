import type { FileStats } from "@/types"
import DetailsView from "./FileViews/DetailsView"
import BigView from "./FileViews/BigView"
import React, { useEffect, useRef, useState, type DragEvent, type SyntheticEvent } from 'react';
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";

import Galery from "./FileViews/Galery";

import { $viewIndex } from "./viewIndex"
import { useStore } from '@nanostores/react';
import { uploadFile } from "@/lib/uploadFile";
import useWindowSize from "@/hooks/useWindowSize";


export default function MainView({ path, directoryListing }: { path: string, directoryListing: FileStats[] | undefined }) {

    const [isDragging, setIsDragging] = useState(false);
    const [overDirectory, setOverDirectory] = useState(false);

    const view = useStore($viewIndex)
    const size = useWindowSize()

    const onDrop = async (files: FileList) => {
        for (let fileToUpload of files) {
            uploadFile(path ? (path) : (''), fileToUpload)
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

    interface GridInfo {
        minWidth: number,
        height: (width: number) => number
    }

    const [gridInfo, setGridInfo] = useState<GridInfo>({ minWidth: 0, height: (width: number) => (1) })

    useEffect(() => {
        switch (view) {
            case "details":
                return setGridInfo({ minWidth: 100000, height: (width: number) => (32) })
            case "big":
                return setGridInfo({ minWidth: 400, height: (width: number) => (62) })
            case "galery":
                return setGridInfo({ minWidth: 300, height: (width: number) => (width + 68) })
        }
    }, [view])

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

    const gap = 10;

    const scrollRef = useRef<HTMLDivElement>(null)
    const [scroll, setScroll] = useState(0)
    const [width, setWidth] = useState(0)
    const [startIndex, setStartIndex] = useState(0)
    const [endIndex, setEndIndex] = useState(0)
    const [totalHeight, setTotalHeight] = useState(0)
    const [columns, setColumns] = useState(0)

    const [height, setHeight] = useState(0)

    useEffect(() => {
        if (!scrollRef.current) { return }

        let newWidth = Math.floor((scrollRef.current.offsetWidth - gap * (columns - 1)) / columns)

        setStartIndex(Math.floor(scroll / (height + gap)) * columns)
        setEndIndex(Math.floor((scrollRef.current.offsetHeight + scroll) / (height + gap) + 2) * columns)

        setWidth(newWidth - 2)

        setTotalHeight((Math.floor(directoryListing.length / columns)) * (height + gap))
    }, [scroll, scrollRef, size, columns, gridInfo, height])

    useEffect(() => {
        if (!scrollRef.current) { return }
        setColumns(Math.max(Math.round(scrollRef.current.offsetWidth / gridInfo.minWidth), 1))
    }, [scrollRef, size, gridInfo])

    useEffect(() => {
        setHeight(gridInfo.height(width))
    }, [width])

    useEffect(() => {
        if (!scrollRef.current) { return }

        const element = scrollRef.current
        const elementScroll = element.querySelector("div")

        const handleWheel = (e: WheelEvent) => {
            if (elementScroll) {
                elementScroll.scrollTop += e.deltaY / 2
            }
            e.preventDefault();
        }

        element.addEventListener("wheel", handleWheel)

        return () => {
            element.removeEventListener("wheel", handleWheel)
        }
    }, [scrollRef])


    return (
        <ScrollArea
            className={cn("relative h-full border border-solid rounded-lg", isDragging && !overDirectory ? ' border-blue-300' : 'border-background',)}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            ref={scrollRef}
            onScrollCapture={(e) => { setScroll((e.target as HTMLDivElement).scrollTop) }}
        >
            <div style={{ height: `${totalHeight}px` }}></div>
            {
                directoryListing.slice(startIndex, endIndex).map((file, index) => (
                    <div
                        key={file.name}
                        className="absolute"
                        style={{
                            left: `${(((index + startIndex) % columns)) * (width + gap)}px`,
                            top: `${Math.floor((index + startIndex) / columns) * (height + gap) - scroll}px`,
                            width: `${width}px`
                        }}
                        onScroll={() => { console.log("onScroll") }}
                        onScrollCapture={() => { console.log("onScrollCapture") }}
                    >
                        {getFileView(file)}
                    </div>
                ))
            }
        </ScrollArea>
    )
}