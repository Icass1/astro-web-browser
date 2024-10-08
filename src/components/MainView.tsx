import type { FileStats } from "@/types"
import DetailsView from "./FileViews/DetailsView"
import BigView from "./FileViews/BigView"
import { useEffect, useRef, useState, type Dispatch, type DragEvent, type SetStateAction, type SyntheticEvent } from 'react';
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";

import Galery from "./FileViews/Galery";

import { $viewIndex } from "./viewIndex"
import { useStore } from '@nanostores/react';
import { uploadFile } from "@/lib/uploadFile";
import useWindowSize from "@/hooks/useWindowSize";

import {
    CalendarIcon,
    Eye,
    FilePlus,
    FolderPlus,
    Share2,
    TableProperties
} from "lucide-react";
import { generateId } from "lucia";
import { format } from "date-fns"

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"

import { Checkbox } from "@/components/ui/checkbox"


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner";

export function DatePicker({ date, setDate }: { date: Date | undefined, setDate: Dispatch<SetStateAction<Date | undefined>> }) {

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}

export default function MainView({ path, directoryListing }: { path: string, directoryListing: FileStats[] | undefined }) {

    const [isDragging, setIsDragging] = useState(false);
    const [overDirectory, setOverDirectory] = useState(false);

    const view = useStore($viewIndex)
    const size = useWindowSize()

    const [actualDialog, setActualDialog] = useState<"share">("share")
    const closeDeleteDialogRef = useRef<HTMLButtonElement | null>(null);
    const [shareExpriesAtDate, setShareExpriesAtDate] = useState<Date>()
    const [sharePassword, setSharePassword] = useState<string>('')
    const [shareUrl, setShareUrl] = useState<string>(generateId(16))
    const [shareEditable, setShareEditable] = useState<boolean>(false)
    const sharePasswordRef = useRef<HTMLInputElement>(null)

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

    const handleShare = () => {
        fetch("/api/create-share", {
            method: "post", body:
                JSON.stringify({
                    'password': sharePassword,
                    'url': shareUrl,
                    'expires_at': shareExpriesAtDate || "",
                    'editable': shareEditable,
                    'path': path,
                })
        }).then(response => {
            if (response.ok) {
                closeDeleteDialogRef.current?.click()
                toast("Share created")
            } else {
                closeDeleteDialogRef.current?.click()
                response.json().then((data) => {
                    toast(data.error, { style: { color: '#ed4337' } })
                })
            }
        })
    }

    const getShareDialogContent = () => {
        return (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share folder '{path?.split("/")[path?.split("/").length - 1] || "/"}'</DialogTitle>
                    <DialogDescription>
                        Share '<label className='text-white font-semibold'>{path || '/'}</label>'.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                    <label className="text-sm ">Enter URL of share <label className="font-semibold text-muted">(8 characters)</label></label>
                    <Input
                        className="invalid:bg-red-400/10 "
                        value={shareUrl}
                        onChange={(e) => { setShareUrl(e.target.value) }}
                        maxLength={8}
                        minLength={8}
                    />
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                    <label className="text-sm ">Enter password <label className="font-semibold text-muted">(Optional)</label></label>
                    <div className="relative">
                        <Input
                            ref={sharePasswordRef}
                            value={sharePassword}
                            onChange={(e) => { setSharePassword(e.target.value) }}
                            type="password" />
                        <Eye
                            className="absolute top-1/2 -translate-y-1/2 right-2 w-5 h-5 hover:scale-105"
                            onMouseDown={(e) => { sharePasswordRef.current ? sharePasswordRef.current.type = "" : '' }}
                            onMouseUp={(e) => { sharePasswordRef.current ? sharePasswordRef.current.type = "password" : '' }}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                    <label className="text-sm w-[164px]">Editable</label>
                    <Checkbox onCheckedChange={(checked) => { setShareEditable(checked.valueOf() as boolean) }}></Checkbox>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                    <label className="text-sm w-[164px]">Expiration date</label>
                    <DatePicker date={shareExpriesAtDate} setDate={setShareExpriesAtDate}></DatePicker>
                </div>
                <DialogFooter>
                    <DialogClose ref={closeDeleteDialogRef} />
                    <Button variant="outline" onClick={() => closeDeleteDialogRef.current?.click()}>Cancel</Button>
                    <Button disabled={false} onClick={handleShare} >Share</Button>
                </DialogFooter>
            </DialogContent>
        )
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
                </ContextMenuTrigger >
                <ContextMenuContent>
                    <div className='hover:bg-muted transition-colors rounded'>
                        <ContextMenuItem onClick={() => { }}>
                            <FilePlus className="mr-2 h-4 w-4" />
                            <span>New file</span>
                        </ContextMenuItem>
                    </div>
                    <div className='hover:bg-muted transition-colors rounded'>
                        <ContextMenuItem onClick={() => { }} >
                            <FolderPlus className="mr-2 h-4 w-4" />
                            <span>New folder</span>
                        </ContextMenuItem>
                    </div>
                    <div className='hover:bg-muted transition-colors rounded'>
                        <DialogTrigger className='w-full'>
                            <ContextMenuItem>
                                <Share2 className="mr-2 h-4 w-4" />
                                <span>Share</span>
                            </ContextMenuItem>
                        </DialogTrigger>
                    </div>
                    <div className='hover:bg-muted transition-colors rounded'>
                        <ContextMenuItem>
                            <img src="/icons/file_type_vscode.svg" className="mr-2 h-4 w-4" />
                            <span>Open with VSCode</span>
                        </ContextMenuItem>
                    </div>
                    <div className='hover:bg-muted transition-colors rounded'>
                        <ContextMenuItem>
                            <TableProperties className="mr-2 h-4 w-4" />
                            <span>Details</span>
                        </ContextMenuItem>
                    </div>
                </ContextMenuContent>
            </ContextMenu >
            {getDialogContent()}
        </Dialog >
    )
}