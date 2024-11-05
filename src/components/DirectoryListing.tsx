
import type { FileStats } from "@/types"
import DetailsView from "./FileViews/DetailsView"
import BigView from "./FileViews/BigView"
import { useEffect, useRef, useState, type ReactElement } from 'react';

import Gallery from "./FileViews/Gallery";

import { $viewIndex } from "./viewIndex"
import { useStore } from '@nanostores/react';
import useWindowSize from "@/hooks/useWindowSize";

import {
    Download,
    FilePlus,
    FolderPlus,
    Pin,
    PinOff,
    Share2,
    TableProperties,
    UploadIcon
} from "lucide-react";

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"

import {
    Dialog,
    DialogTrigger,
} from "@/components/ui/dialog"

import ShareDialog from "./dialogs/ShareDialog";
import BaseFile from "./FileViews/Base";
import type { StatusResult } from "simple-git";
import NewFileNameDialog from "./dialogs/NewFileNameDialog";
import NewFolderDialog from "./dialogs/NewFolderDialog";
import { uploadFile } from "@/lib/uploadFile";
import downloadDirectory from "@/lib/downloadDirectory";
import { handlePinFile, handleUnpinFile } from "@/lib/pin";


type fileTypes = "Excel" | "Word" | "Powerpoint" | "Text" | "Python" | undefined

type DirectoryListingParams = { path: string, directoryListing: { files: FileStats[], gitStatus: StatusResult | undefined, pinned: boolean, shared: boolean }, editable: boolean }

export default function DirectoryListing({ path, directoryListing, editable }: DirectoryListingParams) {


    // const [isDragging, setIsDragging] = useState(false);
    const [overDirectory, setOverDirectory] = useState(false);



    const [actualDialog, setActualDialog] = useState<"share" | "filename" | "newFolder">("share")
    // const [selectedFiles, setSelectedFiles] = useState<FileStats[]>([])

    const [newFileType, setNewFileType] = useState<fileTypes>()


    const view = useStore($viewIndex)

    // This hook is needed because it re-renders this component when the window resizes.
    // @ts-ignore
    const size = useWindowSize()


    // const onDrop = async (files: FileList) => {
    //     for (let fileToUpload of files) {
    //         uploadFile(path ? (path) : (''), fileToUpload)
    //     }
    // }

    // const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    //     event.preventDefault();
    //     event.stopPropagation();

    //     setIsDragging(true);
    // };

    // const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    //     event.preventDefault();
    //     event.stopPropagation();

    //     if (!event.currentTarget.contains(event.relatedTarget as Node)) {
    //         setIsDragging(false);
    //     }
    // };

    // const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    //     event.preventDefault();
    //     event.stopPropagation();
    // };

    // const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    //     event.preventDefault();
    //     event.stopPropagation();

    //     setIsDragging(false);
    //     if (overDirectory) {
    //         return
    //     }

    //     if (event.dataTransfer.files.length > 0) {
    //         onDrop(event.dataTransfer.files);
    //     }
    // };

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
                    <BaseFileTemplate className="grid grid-cols-[24px_2fr_200px_30px_30px] gap-3 items-center border-0 py-1" >
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

    const gap = 10

    useEffect(() => {
        if (!scrollRef.current?.clientWidth) return

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
        } else if (actualDialog == "newFolder") {
            return <NewFolderDialog path={path} />
        } else if (actualDialog == "filename") {
            return <NewFileNameDialog path={path} fileType={newFileType} />
        }
    }

    // const handleScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    //     setLowerIndex(e.target.scrollTop / (height + gap))
    //     console.log()
    // }



    const handleUpload = () => {

        const input = document.createElement("input")
        input.type = "file"
        input.multiple = true
        input.click()

        input.onchange = (e) => {
            const a = e as unknown
            const event = a as React.ChangeEvent<HTMLInputElement>
            console.log(e)
            if (!event?.target?.files) { return }
            const files = event.target.files

            for (let index = 0; index < files.length; index++) {
                if (files.item(index)) {
                    uploadFile(path, files.item(index) as File)
                }
            }
        }
    }

    console.log({ directoryListing: directoryListing })

    return (
        <Dialog>
            <ContextMenu>
                <ContextMenuTrigger className="relative w-full min-h-0 max-h-full">
                    <div className="relative w-full h-full ">
                        <div
                            className="h-full w-full relative overflow-auto custom-slider"
                            ref={scrollRef}
                            onScroll={(e) => { setScrollTop((e.target as HTMLDivElement).scrollTop) }}
                        >
                            {columns == undefined || height == undefined || width == undefined ?
                                <div>Loading</div>
                                :
                                <>
                                    <div className="" style={{ minHeight: `${Math.ceil(directoryListing.files.length / columns) * height + (Math.ceil(directoryListing.files.length / columns) + 1) * gap}px` }}></div>

                                    {directoryListing.files.map((file, index) => {
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
                                    <DialogTrigger className='w-full' onClick={() => { setActualDialog("newFolder") }}>
                                        <ContextMenuItem onClick={() => { }} >
                                            <FolderPlus className="mr-2 h-4 w-4" />
                                            <span>New folder</span>
                                        </ContextMenuItem>
                                    </DialogTrigger>
                                </div>
                                <div className='hover:bg-muted transition-colors rounded'>
                                    <ContextMenuItem onClick={handleUpload} >
                                        <UploadIcon className="mr-2 h-4 w-4" />
                                        <span>Upload file</span>
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
                    <ContextMenuSub>
                        <div className='hover:bg-muted transition-colors rounded'>
                            <ContextMenuSubTrigger onClick={() => { downloadDirectory({ path: path, format: "zip" }) }}>
                                <Download className="mr-2 h-4 w-4" />
                                <span>Download</span>
                            </ContextMenuSubTrigger>
                        </div>
                        <ContextMenuSubContent className="w-48">
                            <DialogTrigger className='w-full' onClick={() => { setActualDialog("filename") }}>
                                <div className='hover:bg-muted transition-colors rounded'>
                                    <ContextMenuItem onClick={() => { downloadDirectory({ path: path, format: "zip" }) }}>
                                        <span>ZIP</span>
                                    </ContextMenuItem>
                                </div>
                                <div className='hover:bg-muted transition-colors rounded'>
                                    <ContextMenuItem onClick={() => { downloadDirectory({ path: path, format: "tar" }) }}>
                                        <span>TAR</span>
                                    </ContextMenuItem>
                                </div>
                            </DialogTrigger>
                        </ContextMenuSubContent>
                    </ContextMenuSub>

                    {
                        directoryListing.pinned ?
                            <div className='hover:bg-muted transition-colors rounded'>
                                <ContextMenuItem onClick={() => { handleUnpinFile(path) }} >
                                    <PinOff className="mr-2 h-4 w-4" />
                                    <span>Unpin</span>
                                </ContextMenuItem>
                            </div>
                            :
                            <div className='hover:bg-muted transition-colors rounded'>
                                <ContextMenuItem onClick={() => { handlePinFile(path) }} >
                                    <Pin className="mr-2 h-4 w-4" />
                                    <span>Pin</span>
                                </ContextMenuItem>
                            </div>
                    }
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