import type { FileStats } from "@/types";
import {
    Share2,
    Edit,
    Trash,
    Download,
    TableProperties,
    Pin,
    PinOff,
    FolderSyncIcon,
    RotateCcwIcon,
    ListIcon,
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
    ContextMenuSub,
    ContextMenuSubTrigger,
    ContextMenuSubContent,
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
import ShareDialog from "../dialogs/ShareDialog";
import DetailsDialog from "../dialogs/DetailsDialog";
import NewBackupDialog from "../dialogs/NewBackupDialog";
import SeeBackupsDialog from "../dialogs/SeeBackupsDialog";

export default function BaseFile(
    {
        file,
        path,
        setOverDirectory,
        children,
        className,
        href,
        editable
    }: {
        className?: string,
        file: FileStats,
        path: string | undefined,
        setOverDirectory: Dispatch<SetStateAction<boolean>>,
        children: ReactElement[] | ReactElement,
        href: string,
        editable: boolean
    }
) {

    const [isDragging, setIsDragging] = useState(false);
    const closeDeleteDialogRef = useRef<HTMLButtonElement | null>(null);

    const [actualDialog, setActualDialog] = useState<"rename" | "delete" | "share" | "details" | "newBackup" | "seeBackups">("rename")
    const [newNameInputDialog, setNewNameInputDialog] = useState<string>(file.name)

    const anchorRef = useRef<HTMLAnchorElement>(null)

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
            const src = (data.path ? (data.path + "/") : "") + data.fileName
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
                }
            })
        }

        if (event.dataTransfer.files.length > 0) {
            onDrop(event.dataTransfer.files);
        }
    };

    const handleDragStart = async (event: DragEvent<HTMLDivElement>) => {
        console.log("drag start", JSON.stringify({ path: path, fileName: file.name, isDirectory: file.isDirectory }))
        event.dataTransfer.setData("file-path", JSON.stringify({ path: path, fileName: file.name, isDirectory: file.isDirectory }))
        event.dataTransfer.setData("text", `https://files2.rockhosting.org/files/${path}/${file.name}`)
        const img = new Image()
        img.src = file.iconPath
        img.width = 10
        img.height = 10
        event.dataTransfer.setDragImage(img, 60, 50)
    }

    const handleDownload = () => {
        if (file.isDirectory) {
            toast("Unable to download directory", { style: { color: '#ed4337' } })
            return
        }

        toast("Downloading " + file.name)

        const downloadElement = document.createElement("a")
        downloadElement.href = "/api/file/" + (path ? (path + "/") : '') + file.name
        // href={(path ? ("/files/" + path + "/" + file.name) : ("/files/" + file.name))}

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

    const handlePinFile = () => {
        fetch("/api/pin-file", {
            method: "POST",
            body: JSON.stringify({
                'path': (path ? (path + "/") : "") + file.name
            })
        }).then(response => {
            if (response.ok) {
                toast("Directory pinned")
            } else {
                response.json().then(data => {
                    toast(data.error, { style: { color: '#ed4337' } })
                }).catch(() => {
                    toast("Error pinning file", { style: { color: '#ed4337' } })
                })
            }
        })
    }

    const handleUnpinFile = () => {
        fetch("/api/unpin-file", {
            method: "POST",
            body: JSON.stringify({
                'path': (path ? (path + "/") : "") + file.name
            })
        }).then(response => {
            if (response.ok) {
                toast("Directory unpinned")
            } else {
                response.json().then(data => {
                    toast(data.error, { style: { color: '#ed4337' } })
                }).catch(() => {
                    toast("Error removing pin file", { style: { color: '#ed4337' } })
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
        } else if (actualDialog == "share") {
            return <ShareDialog path={(path ? (path + "/") : "") + file.name} type={file.isDirectory ? 'directory' : 'file'} />
        } else if (actualDialog == "details") {
            return <DetailsDialog path={(path ? (path + "/") : "") + file.name} file={file} type={file.isDirectory ? 'directory' : 'file'} />
        } else if (actualDialog == "newBackup") {
            return <NewBackupDialog path={path} file={file} />
        } else if (actualDialog == "seeBackups") {
            return <SeeBackupsDialog path={path} file={file} />
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
                        draggable
                    >
                        <div
                            className={cn("border rounded py-2 px-3 cursor-pointer hover:bg-muted select-none overflow-hidden", isDragging ? "outline-blue-400 outline-dashed outline-1" : '', className)}
                            onDoubleClick={() => { anchorRef.current?.click() }}
                        >
                            {children}
                            <a ref={anchorRef} href={href} className="hidden"></a>
                        </div>
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <div className={cn('hover:bg-muted transition-colors rounded', !editable && 'hidden')}>
                        <DialogTrigger className='w-full' onClick={() => { setActualDialog("rename") }}>
                            <ContextMenuItem >
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Rename</span>
                            </ContextMenuItem>
                        </DialogTrigger>
                    </div>
                    <div className='hover:bg-muted transition-colors rounded'>
                        <ContextMenuItem onClick={handleDownload}>
                            <Download className="mr-2 h-4 w-4" />
                            <span>Download</span>
                        </ContextMenuItem>
                    </div>

                    <DialogTrigger className={cn('w-full', !editable && 'hidden')} onClick={() => { setActualDialog("share") }}>
                        <div className='hover:bg-muted transition-colors rounded'>
                            <ContextMenuItem >
                                <Share2 className="mr-2 h-4 w-4" />
                                <span>{file.shared ? 'Stop share' : 'Share'}</span>
                            </ContextMenuItem>
                        </div>
                    </DialogTrigger>

                    <div className={cn('hover:bg-muted transition-colors rounded', !editable && 'hidden')}>
                        <ContextMenuItem>
                            <img src="/icons/file_type_vscode.svg" className="mr-2 h-4 w-4" />
                            <span>TODO - Open with VSCode</span>
                        </ContextMenuItem>
                    </div>

                    <DialogTrigger className={cn('w-full', !editable && 'hidden')} onClick={() => { setActualDialog("details") }}>
                        <div className='hover:bg-muted transition-colors rounded'>
                            <ContextMenuItem >
                                <TableProperties className="mr-2 h-4 w-4" />
                                <span>Details</span>
                            </ContextMenuItem>
                        </div>
                    </DialogTrigger>
                    {
                        file.pinned ?
                            <div className='hover:bg-muted transition-colors rounded'>
                                <ContextMenuItem onClick={handleUnpinFile} >
                                    <PinOff className="mr-2 h-4 w-4" />
                                    <span>Unpin</span>
                                </ContextMenuItem>
                            </div>
                            :
                            <div className='hover:bg-muted transition-colors rounded'>
                                <ContextMenuItem onClick={handlePinFile}>
                                    <Pin className="mr-2 h-4 w-4" />
                                    <span>Pin</span>
                                </ContextMenuItem>
                            </div>
                    }

                    {!file.isDirectory &&
                        <ContextMenuSub>
                            <div className='hover:bg-muted transition-colors rounded'>
                                <ContextMenuSubTrigger>
                                    <FolderSyncIcon className="mr-2 h-4 w-4" />
                                    <span>Backup</span>
                                </ContextMenuSubTrigger>
                            </div>
                            <ContextMenuSubContent className="w-48">
                                <DialogTrigger className={cn('w-full', !editable && 'hidden')} >
                                    <div className='hover:bg-muted transition-colors rounded' onClick={() => { setActualDialog("newBackup") }}>
                                        <ContextMenuItem onClick={() => { }}>
                                            <FolderSyncIcon className="mr-2 h-4 w-4" />
                                            <span>TODO - New backup</span>
                                        </ContextMenuItem>
                                    </div>
                                    <div className='hover:bg-muted transition-colors rounded'>
                                        <ContextMenuItem onClick={() => { }}>
                                            <RotateCcwIcon className="mr-2 h-4 w-4" />
                                            <span>TODO - Restore last backup</span>
                                        </ContextMenuItem>
                                    </div>
                                    <div className='hover:bg-muted transition-colors rounded' onClick={() => { setActualDialog("seeBackups") }}>
                                        <ContextMenuItem onClick={() => { }}>
                                            <ListIcon className="mr-2 h-4 w-4" />
                                            <span>TODO - See backups</span>
                                        </ContextMenuItem>
                                    </div>
                                </DialogTrigger>

                            </ContextMenuSubContent>
                        </ContextMenuSub>
                    }

                    <ContextMenuSeparator className={cn(!editable && 'hidden')} />

                    <DialogTrigger className={cn('w-full', !editable && 'hidden')} onClick={() => { setActualDialog("delete") }}>
                        <div className='hover:bg-destructive transition-colors rounded'>
                            <ContextMenuItem>
                                <Trash className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                            </ContextMenuItem>
                        </div>
                    </DialogTrigger>
                </ContextMenuContent>
            </ContextMenu>
            {getDialogContent()}
        </Dialog>
    )
}
