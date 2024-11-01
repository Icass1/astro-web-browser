import type { FileStats } from "@/types"
import DetailsView from "./FileViews/DetailsView"
import BigView from "./FileViews/BigView"
import { useEffect, useRef, useState, type DragEvent, type ReactElement } from 'react';

import Gallery from "./FileViews/Gallery";

import { $viewIndex } from "./viewIndex"
import { useStore } from '@nanostores/react';
import { uploadFile } from "@/lib/uploadFile";
import useWindowSize from "@/hooks/useWindowSize";

import {
    Download,
    FilePlus,
    FolderPlus,
    Pin,
    Share2,
    TableProperties
} from "lucide-react";

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import ShareDialog from "./dialogs/ShareDialog";
import BaseFile from "./FileViews/Base";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";

type fileTypes = "Excel" | "Word" | "Powerpoint" | "Text" | "Python" | undefined

function FileNameDialog({ fileType, path }: { fileType: fileTypes, path: string }) {

    if (!fileType) {
        <DialogContent>
            This should never happend, fileType is undefined
        </DialogContent>
    }

    const closeDeleteDialogRef = useRef<HTMLButtonElement | null>(null);
    const [fileName, setFileName] = useState<string>()

    let extension: string = ""
    switch (fileType) {
        case "Excel":
            extension = ".xlsx"
            break
        case "Powerpoint":
            extension = ".pptx"
            break
        case "Word":
            extension = ".docx"
            break
        case "Python":
            extension = ".py"
            break
        case "Text":
            extension = ".txt"
            break
    }

    const handleNewFile = () => {
        console.log(path)
        console.log(fileName + extension)

        fetch("/api/new-file", {
            method: "POST",
            body: JSON.stringify({
                path: path,
                file_name: fileName + extension,
                extension: extension,
            })
        }).then(response => {
            if (response.ok) {
                toast("File created")
                closeDeleteDialogRef.current?.click()
                // @ts-ignore
                navigation.reload()
            } else {
                response.json().then(data => {
                    toast(data.error, { style: { color: '#ed4337' } })
                }).catch(() => {
                    toast("Error creating file", { style: { color: '#ed4337' } })
                })
            }
        })
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create new {fileType} file</DialogTitle>
                <DialogDescription>
                </DialogDescription>
            </DialogHeader>
            <label>Enter file name</label>
            <div className="relative">
                <Input value={fileName} onChange={(e) => { setFileName(e.target.value) }}></Input>
                <label className="absolute right-2 top-2 text-foreground/70">{extension}</label>
            </div>

            <DialogFooter>
                <DialogClose ref={closeDeleteDialogRef} />
                <Button variant="outline" onClick={() => closeDeleteDialogRef.current?.click()}>Cancel</Button>
                <Button disabled={false} onClick={handleNewFile} >Create</Button>
            </DialogFooter>
        </DialogContent>
    )
}

export default function MainView({ path, directoryListing, editable }: { path: string, directoryListing: FileStats[], editable: boolean }) {

    const [isDragging, setIsDragging] = useState(false);
    const [overDirectory, setOverDirectory] = useState(false);

    const view = useStore($viewIndex)
    // This hook is needed because it re-renders this component when the window resizes.
    // @ts-ignore
    const size = useWindowSize()

    const [actualDialog, setActualDialog] = useState<"share" | "filename">("share")
    const [selectedFiles, setSelectedFiles] = useState<FileStats[]>([])

    const [newFileType, setNewFileType] = useState<fileTypes>()

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
            case "gallery":
                return setGridInfo({ minWidth: 300, height: (width: number) => (width + 68) })
        }
    }, [view])

    const getFileView = (file: FileStats) => {

        const shareId = location.pathname.split("/")[2]
        const href = location.pathname.startsWith("/files") ? (path ? ("/files/" + path + "/" + file.name) : ("/files/" + file.name)) : (path ? (`/share/${shareId}/` + path + "/" + file.name) : (`/share/${shareId}/` + file.name))


        function BaseFileTemplate(
            {
                children,
                className
            }: {
                children: ReactElement[] | ReactElement,
                className?: string | undefined,
            }
        ) {
            return (
                <BaseFile
                    className={className}
                    file={file}
                    path={path}
                    setOverDirectory={setOverDirectory}
                    href={href}
                    editable={editable}
                >
                    {children}
                </BaseFile>
            )
        }

        switch (view) {
            case "details":
                return (
                    <BaseFileTemplate className="grid grid-cols-[24px_2fr_200px_30px] gap-3 items-center border-0 py-1" >
                        <DetailsView key={file.name} file={file} />
                    </BaseFileTemplate>
                )
            case "big":
                return (
                    <BaseFileTemplate className="flex flex-row gap-3 items-center" >
                        <BigView key={file.name} file={file} />
                    </BaseFileTemplate>
                )
            case "gallery":
                return (
                    <BaseFileTemplate className="shadow relative p-0 flex flex-col gap-2" >
                        <Gallery key={file.name} path={path} file={file} />
                    </BaseFileTemplate>
                )
            default:
                console.warn("Unknow view")
        }
    }

    const scrollRef = useRef<HTMLDivElement>(null)

    const [columns, setColumns] = useState<number>()
    const [height, setHeight] = useState<number>()
    const [width, setWidth] = useState<number>()
    const [scrollTop, setScrollTop] = useState<number>(0)
    const [lowerIndex, setLowerIndex] = useState<number>(0)
    const [upperIndex, setUpperIndex] = useState<number | undefined>(5)

    const gap = 10

    useEffect(() => {
        if (!scrollRef.current?.clientWidth) return
        console.log("userEffect1")

        let columns = Math.max(Math.round(scrollRef.current.clientWidth / gridInfo.minWidth), 1)
        let width = Math.floor((scrollRef.current.clientWidth - gap * (columns + 1)) / columns)
        let height = gridInfo.height(width)

        setColumns(columns)
        setWidth(width)
        setHeight(height)
    }, [scrollRef, size, view, gridInfo])

    const getShareDialogContent = () => {
        return <ShareDialog path={path} type="directory" />
    }

    const getDialogContent = () => {
        if (actualDialog == "share") {
            return getShareDialogContent()
        } else if (actualDialog == "filename") {
            return <FileNameDialog path={path} fileType={newFileType} />
        }
    }

    // const handleScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    //     setLowerIndex(e.target.scrollTop / (height + gap))
    //     console.log()

    // }

    return (
        <Dialog>
            <ContextMenu>
                <ContextMenuTrigger className="relative w-full h-full">
                    <div className="relative w-full h-full pb-4">
                        <div
                            className="h-full w-full relative overflow-auto custom-slider"
                            ref={scrollRef}
                            onScroll={(e) => { setScrollTop((e.target as HTMLDivElement).scrollTop) }}
                        >
                            {columns == undefined || height == undefined || width == undefined ?
                                <div>Loading</div>
                                :
                                <>
                                    <div className="" style={{ minHeight: `${Math.ceil(directoryListing.length / columns) * height + (Math.ceil(directoryListing.length / columns) + 1) * gap}px` }}></div>

                                    {directoryListing.map((file, index) => {
                                        // console.log(file.name, index)

                                        if (scrollTop > gap + Math.floor((index) / columns) * (height + gap) + height) {
                                            return
                                        }

                                        if (scrollRef.current?.clientHeight && scrollTop + scrollRef.current.clientHeight < gap + Math.floor((index) / columns) * (height + gap)) {
                                            return
                                        }


                                        // if (index < lowerIndex) {
                                        //     return
                                        // }

                                        // if (upperIndex && index > upperIndex) {
                                        //     return
                                        // }

                                        return (
                                            <div
                                                key={index}
                                                className="absolute w-full"
                                                style={{
                                                    left: `${gap + (((index) % columns)) * (width + gap)}px`,
                                                    top: `${gap + Math.floor((index) / columns) * (height + gap)}px`,
                                                    width: `${width}px`,
                                                }}
                                            >
                                                {getFileView(file)}
                                            </div>
                                        )
                                    })}
                                </>
                            }


                        </div>
                    </div>
                </ContextMenuTrigger >
                <ContextMenuContent>
                    {
                        editable && (
                            <>
                                <ContextMenuSub>
                                    <div className='hover:bg-muted transition-colors rounded'>
                                        <ContextMenuSubTrigger>
                                            <FilePlus className="mr-2 h-4 w-4" />
                                            <span>New file</span>
                                        </ContextMenuSubTrigger>
                                    </div>
                                    <ContextMenuSubContent className="w-48">
                                        <DialogTrigger className='w-full' onClick={() => { setActualDialog("filename") }}>

                                            <div className='hover:bg-muted transition-colors rounded'>
                                                <ContextMenuItem onClick={() => { setNewFileType("Excel") }}>
                                                    <img src="/icons/file_type_excel.svg" className="mr-2 h-4 w-4" />
                                                    <span>Excel</span>
                                                </ContextMenuItem>
                                            </div>
                                            <div className='hover:bg-muted transition-colors rounded'>
                                                <ContextMenuItem onClick={() => { setNewFileType("Word") }}>
                                                    <img src="/icons/file_type_word.svg" className="mr-2 h-4 w-4" />
                                                    <span>Word</span>
                                                </ContextMenuItem>
                                            </div>
                                            <div className='hover:bg-muted transition-colors rounded'>
                                                <ContextMenuItem onClick={() => { setNewFileType("Powerpoint") }}>
                                                    <img src="/icons/file_type_powerpoint.svg" className="mr-2 h-4 w-4" />
                                                    <span>PowerPoint</span>
                                                </ContextMenuItem>
                                            </div>
                                            <div className='hover:bg-muted transition-colors rounded'>
                                                <ContextMenuItem onClick={() => { setNewFileType("Text") }}>
                                                    <img src="/icons/file_type_text.svg" className="mr-2 h-4 w-4" />
                                                    <span>Text</span>
                                                </ContextMenuItem>
                                            </div>
                                            <div className='hover:bg-muted transition-colors rounded'>
                                                <ContextMenuItem onClick={() => { setNewFileType("Python") }}>
                                                    <img src="/icons/file_type_python.svg" className="mr-2 h-4 w-4" />
                                                    <span>Python</span>
                                                </ContextMenuItem>
                                            </div>
                                        </DialogTrigger>


                                    </ContextMenuSubContent>
                                </ContextMenuSub>
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
                        <DialogTrigger className='w-full' onClick={() => { setActualDialog("share") }}>
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
                            <Pin className="mr-2 h-4 w-4" />
                            <span>TODO - Pin</span>
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