import type { FileStats } from "@/types"
import DetailsView from "./FileViews/DetailsView"
import BigView from "./FileViews/BigView"
import { useEffect, useRef, useState, type DragEvent } from 'react';
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

import Galery from "./FileViews/Galery";

import { $viewIndex } from "./viewIndex"
import { useStore } from '@nanostores/react';
import { uploadFile } from "@/lib/uploadFile";
import useWindowSize from "@/hooks/useWindowSize";

import {
    Download,
    FilePlus,
    FolderPlus,
    Share2,
    TableProperties
} from "lucide-react";

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"

import {
    Dialog,
    DialogTrigger,
} from "@/components/ui/dialog"

import ShareDialog from "./ShareDialog";



export default function MainView({ path, directoryListing, editable }: { path: string, directoryListing: FileStats[], editable: boolean }) {

    const [isDragging, setIsDragging] = useState(false);
    const [overDirectory, setOverDirectory] = useState(false);

    const view = useStore($viewIndex)
    const size = useWindowSize()

    const [actualDialog, setActualDialog] = useState<"share">("share")
    const [selectedFiles, setSelectedFiles] = useState<string[]>([])

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

    interface GridInfo {
        minWidth: number,
        height: (width: number) => number
    }

    const [gridInfo, setGridInfo] = useState<GridInfo>({ minWidth: 0, height: () => (1) })

    useEffect(() => {
        switch (view) {
            case "details":
                return setGridInfo({ minWidth: 100000, height: () => (32) })
            case "big":
                return setGridInfo({ minWidth: 400, height: () => (62) })
            case "galery":
                return setGridInfo({ minWidth: 300, height: (width: number) => (width + 68) })
        }
    }, [view])

    const getFileView = (file: FileStats) => {

        const shareId = location.pathname.split("/")[2]
        const href = location.pathname.startsWith("/files") ? (path ? ("/files/" + path + "/" + file.name) : ("/files/" + file.name)) : (path ? (`/share/${shareId}/` + path + "/" + file.name) : (`/share/${shareId}/` + file.name))

        switch (view) {
            case "details":
                return <DetailsView key={file.name} setOverDirectory={setOverDirectory} path={path} file={file} href={href} editable={editable} />
            case "big":
                return <BigView key={file.name} setOverDirectory={setOverDirectory} path={path} file={file} href={href} editable={editable} />
            case "galery":
                return <Galery key={file.name} setOverDirectory={setOverDirectory} path={path} file={file} href={href} editable={editable} />
            default:
                console.warn("Unknow view")
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

        const totalHeight = Math.max(1, Math.floor(directoryListing.length / columns)) * (height + gap)

        setStartIndex(Math.floor(scroll / (height + gap)) * columns)
        setEndIndex(Math.floor((totalHeight + scroll) / (height + gap) + 2) * columns)

        setWidth(newWidth - 2)

        setTotalHeight(totalHeight)
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

    const getShareDialogContent = () => {
        return <ShareDialog path={path} type="directory" />
    }

    const getDialogContent = () => {
        if (actualDialog == "share") {
            return getShareDialogContent()
        }
    }

    return (
        <Dialog>
            <ContextMenu>
                <ContextMenuTrigger className="relative w-full h-full">
                    <ScrollArea
                        className={cn("relative h-full border border-solid rounded-lg w-full", isDragging && !overDirectory ? ' border-blue-300' : 'border-background',)}
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
                                    className={cn("absolute", selectedFiles.includes(file.name) && "bg-neutral-600 rounded")}
                                    style={{
                                        left: `${(((index + startIndex) % columns)) * (width + gap)}px`,
                                        top: `${Math.floor((index + startIndex) / columns) * (height + gap) - scroll}px`,
                                        width: `${width}px`
                                    }}
                                    onClick={() => { if (!selectedFiles.includes(file.name)) setSelectedFiles([...selectedFiles, file.name])}}
                                >
                                    {getFileView(file)}
                                </div>
                            ))
                        }
                    </ScrollArea>
                </ContextMenuTrigger >
                <ContextMenuContent>
                    {
                        editable && (
                            <>
                                <div className='hover:bg-muted transition-colors rounded'>
                                    <ContextMenuItem onClick={() => { }}>
                                        <FilePlus className="mr-2 h-4 w-4" />
                                        <span>TODO - New file</span>
                                    </ContextMenuItem>
                                </div>
                                <div className='hover:bg-muted transition-colors rounded'>
                                    <ContextMenuItem onClick={() => { }} >
                                        <FolderPlus className="mr-2 h-4 w-4" />
                                        <span>TODO - New folder</span>
                                    </ContextMenuItem>
                                </div>
                            </>
                        )
                    }
                    <div className='hover:bg-muted transition-colors rounded'>
                        <DialogTrigger className='w-full'>
                            <ContextMenuItem>
                                <Share2 className="mr-2 h-4 w-4" />
                                <span>Share</span>
                            </ContextMenuItem>
                        </DialogTrigger>
                    </div>
                    {
                        editable && (
                            <>
                                <div className='hover:bg-muted transition-colors rounded'>
                                    <ContextMenuItem>
                                        <img src="/icons/file_type_vscode.svg" className="mr-2 h-4 w-4" />
                                        <span>TODO - Open with VSCode</span>
                                    </ContextMenuItem>
                                </div>
                            </>
                        )
                    }
                    <div className='hover:bg-muted transition-colors rounded'>
                        <ContextMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            <span>TODO - Download</span>
                        </ContextMenuItem>
                    </div>
                    <div className='hover:bg-muted transition-colors rounded'>
                        <ContextMenuItem>
                            <TableProperties className="mr-2 h-4 w-4" />
                            <span>TODO - Details</span>
                        </ContextMenuItem>
                    </div>
                </ContextMenuContent>
            </ContextMenu >
            {getDialogContent()}
        </Dialog >
    )
}