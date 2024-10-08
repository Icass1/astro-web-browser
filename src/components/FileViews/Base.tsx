import type { FileStats } from "@/types";
import {
    Share2,
    Edit,
    Trash,
    Download,
    TableProperties,
} from "lucide-react"
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
import { Input } from "@/components/ui/input";

export default function BaseFile({ file, path, setOverDirectory, children, className }: { className?: string, file: FileStats, path: string | undefined, setOverDirectory: Dispatch<SetStateAction<boolean>>, children: ReactElement[] }) {

    const [isDragging, setIsDragging] = useState(false);
    const closeDeleteDialogRef = useRef<HTMLButtonElement | null>(null);

    const [actualDialog, setActualDialog] = useState<"rename" | "delete">("rename")
    const [newNameInputDialog, setNewNameInputDialog] = useState<string>(file.name)

    const onDrop = async (files: FileList) => {
        for (let index = 0; index < files.length; index++) {
            if (files.item(index)) {
                uploadFile((path ? (path + "/") : ('')) + file.name, files.item(index) as File)
            }
        }
    }

    const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
        setOverDirectory(true)
    };

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setIsDragging(false);
            setOverDirectory(false)
        }
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
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

            if (src + "/" + data.fileName == dest) {
                toast("Unable to move a folder into itself", { style: { color: '#ed4337' } })
                return
            }

            console.log(file.isDirectory)
            console.log(src, "->", dest)

            fetch("/api/move-file", {
                method: 'POST',
                body: JSON.stringify({
                    isDirectory: data.isDirectory,
                    src: src,
                    dest: dest,
                })
            }).then(response => {
                if (response.ok) {
                    toast("File moved")
                    // @ts-ignore
                    // navigation.reload()
                } else {
                    toast("Error moving file", { style: { color: '#ed4337' } })

                    console.log("")
                    // response.json().then(data => {
                    //     toast(data.error, { style: { color: '#ed4337' } })
                    // }).catch(error => {
                    //     toast("Error deleting file", { style: { color: '#ed4337' } })
                    // })
                }
            })

        }

        if (event.dataTransfer.files.length > 0) {
            onDrop(event.dataTransfer.files);
        }
    };

    const handleDragStart = async (event: DragEvent<HTMLDivElement>) => {
        event.dataTransfer.setData("file-path", JSON.stringify({ path: path, fileName: file.name, isDirectory: file.isDirectory }))
        const img = new Image()
        img.src = file.iconPath
        img.width = 10
        img.height = 10
        event.dataTransfer.setDragImage(img, 60, 50)
    }

    const handleDownload = () => {

        toast("Downloading " + file.name)

        const downloadElement = document.createElement("a")
        downloadElement.href = "/file/" + (path ? (path + "/") : '') + file.name
        downloadElement.download = file.name

        downloadElement.click()
    }

    const handleDeleteFile = () => {
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
                // @ts-ignore
                navigation.reload()
            } else {
                response.json().then(data => {
                    toast(data.error, { style: { color: '#ed4337' } })
                }).catch(() => {
                    toast("Error deleting file", { style: { color: '#ed4337' } })
                })
            }
        })
    }


    const handleRename = () => {
        const oldPath = (path ? (path + "/") : "") + file.name
        const newPath = (path ? (path + "/") : "") + newNameInputDialog

        console.log(oldPath, "->", newPath)
        fetch("/api/rename-file", {
            method: 'POST',
            body: JSON.stringify({
                isDirectory: file.isDirectory,
                oldPath: oldPath,
                newPath: newPath,
            })
        }).then(response => {
            if (response.ok) {
                toast("File renamed")
                closeDeleteDialogRef.current?.click()
                // @ts-ignore
                navigation.reload()
            } else {
                response.json().then(data => {
                    toast(data.error, { style: { color: '#ed4337' } })
                }).catch(() => {
                    toast("Error renaming file", { style: { color: '#ed4337' } })
                })
            }
        })


    }

    const getDeleteDialogContent = () => {
        return (
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
        )
    }

    const getRenameDialogContent = () => {
        return (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename {newNameInputDialog}</DialogTitle>
                    <DialogDescription>
                        Enter the new name for '<label className='text-white font-semibold'>{file?.name}</label>'.
                    </DialogDescription>
                </DialogHeader>
                <Input defaultValue={file.name} onChange={(e) => { setNewNameInputDialog(e.target.value) }} />
                <DialogFooter>
                    <DialogClose ref={closeDeleteDialogRef} />
                    <Button variant="outline" onClick={() => closeDeleteDialogRef.current?.click()}>Cancel</Button>
                    <Button onClick={handleRename} disabled={file.name == newNameInputDialog}>Rename</Button>
                </DialogFooter>
            </DialogContent>
        )
    }

    const getDialogContent = () => {
        if (actualDialog == "delete") {
            return getDeleteDialogContent()
        } else if (actualDialog == "rename") {
            return getRenameDialogContent()
        }
    }

    return (
        <Dialog>
            <ContextMenu>
                <ContextMenuTrigger>
                    <div
                        onDragEnter={file.isDirectory ? handleDragEnter : undefined}
                        onDragLeave={file.isDirectory ? handleDragLeave : undefined}
                        onDragOver={file.isDirectory ? handleDragOver : undefined}
                        onDrop={file.isDirectory ? handleDrop : undefined}
                        onDragStart={handleDragStart}
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
                        <DialogTrigger className='w-full'>
                            <ContextMenuItem onClick={() => { setActualDialog("rename") }}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Rename</span>
                            </ContextMenuItem>
                        </DialogTrigger>
                    </div>
                    <div className='hover:bg-muted transition-colors rounded'>
                        <ContextMenuItem onClick={handleDownload} >
                            <Download className="mr-2 h-4 w-4" />
                            <span>Download</span>
                        </ContextMenuItem>
                    </div>
                    <div className='hover:bg-muted transition-colors rounded'>
                        <ContextMenuItem>
                            <Share2 className="mr-2 h-4 w-4" />
                            <span>{file.shared ? 'Stop share' : 'Share'}</span>
                        </ContextMenuItem>
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
                    <ContextMenuSeparator />
                    <ContextMenuItem className='w-full p-0'>
                        <DialogTrigger className='w-full'>
                            <div className='hover:bg-destructive transition-colors rounded'>
                                <ContextMenuItem onClick={() => { setActualDialog("delete") }}>
                                    <Trash className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                </ContextMenuItem>
                            </div>
                        </DialogTrigger>
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
            {getDialogContent()}
        </Dialog>
    )
}
