import type { FileStats } from "@/types";
import FileDropdownMenu from "../DropdownMenu";
import { MoreVertical, Share2, Edit, Trash, Download, Navigation } from "lucide-react"
import { useRef, useState, type Dispatch, type DragEvent, type ReactElement, type SetStateAction } from 'react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import '@/styles/globals.css'
import { uploadFile } from "@/lib/uploadFile";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
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
import { Button } from '@/components/ui/button';
// import { CommonActions, useNavigation } from '@react-navigation/native' // <-- import useNavigation hook

export default function BaseFile({ file, path, setOverDirectory, children, className }: { className?: string, file: FileStats, path: string | undefined, setOverDirectory: Dispatch<SetStateAction<boolean>>, children: ReactElement[] }) {

    const [isDragging, setIsDragging] = useState(false);
    const closeDeleteDialogRef = useRef<HTMLButtonElement | null>(null);
    // const navigation = useNavigation()

    const handleDeleteFile = () => {
        console.log("ASDF")

        fetch("/api/delete-file", {
            method: 'POST',
            body: JSON.stringify({
                isDirectory: file.isDirectory,
                path: (path ? (path + "/") : '') + file.name,
            })
        }).then(response => {
            if (response.ok) {
                toast("File deleted")
                closeDeleteDialogRef.current?.click()
                navigation.reload()
            } else {
                response.json().then(data => {
                    toast(data.error, { style: { color: '#ed4337' } })
                }).catch(error => {
                    toast("Error deleting file", { style: { color: '#ed4337' } })
                })
            }
        })
    }

    const onDrop = async (files: FileList[]) => {
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
            const src = (path ? (path + "/") : "") + data.fileName
            const dest = (path ? (path + "/") : "") + file.name + "/" + data.fileName
            console.log(src, "->", dest)
        }

        if (event.dataTransfer.files.length > 0) {
            onDrop(event.dataTransfer.files);
        }
    };

    return (
        <Dialog>
            <ContextMenu>
                <ContextMenuTrigger>
                    <div
                        onDragEnter={file.isDirectory ? handleDragEnter : undefined}
                        onDragLeave={file.isDirectory ? handleDragLeave : undefined}
                        onDragOver={file.isDirectory ? handleDragOver : undefined}
                        onDrop={file.isDirectory ? handleDrop : undefined}
                        onDragStart={(e) => { e.dataTransfer.setData("file-path", JSON.stringify({ path: path, fileName: file.name })) }}
                        className={'transition-transform ' + (isDragging ? "scale-[1.01]" : '')}
                    >
                        <a
                            className={cn("border rounded-lg py-2 px-3 cursor-pointer hover:bg-muted", isDragging ? 'border-blue-500 bg-muted/50' : '', className)}
                            href={(path ? ("/files/" + path + "/" + file.name) : ("/files/" + file.name))}
                        >
                            {children}
                        </a >
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <div className='hover:bg-muted transition-colors rounded'>
                        <ContextMenuItem onClick={() => { console.log("rename"); toast("rename") }}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Rename</span>
                        </ContextMenuItem>
                    </div>
                    <div className='hover:bg-muted transition-colors rounded'>
                        <ContextMenuItem >
                            <Download className="mr-2 h-4 w-4" />
                            <span>Download</span>
                        </ContextMenuItem>
                    </div>
                    <div className='hover:bg-muted transition-colors rounded'>
                        <ContextMenuItem>
                            <Share2 className="mr-2 h-4 w-4" />
                            <span>Share</span>
                        </ContextMenuItem>
                    </div>
                    <ContextMenuSeparator />

                    <ContextMenuItem className='w-full p-0'>
                        <DialogTrigger className='w-full'>
                            <div className='hover:bg-destructive transition-colors rounded'>
                                <ContextMenuItem>
                                    <Trash className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                </ContextMenuItem>
                            </div>
                        </DialogTrigger>
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                        Do you really want to delete '<label className='text-white font-semibold'>{file?.name}</label>'? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose ref={closeDeleteDialogRef} />
                    <Button variant="outline" onClick={() => closeDeleteDialogRef.current?.click()}>Cancel</Button>
                    <Button onClick={handleDeleteFile}>Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    )
}
