import { UploadIcon, FolderPlus } from "lucide-react"
import { Button } from "./ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRef, useState, type BaseSyntheticEvent } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

import '@/styles/globals.css'
import { uploadFile } from "@/lib/uploadFile"
import { $viewIndex } from "./viewIndex"
import { useStore } from '@nanostores/react';

import { Images, List, Table } from "lucide-react"

export function NewFolder({ path }: { path: string }) {
    const handleNewFolder = (e: BaseSyntheticEvent) => {
        console.log("New Folder", e.target, folderName, path)
        fetch("/api/create-file", {
            method: 'POST',
            body: JSON.stringify({
                folder_name: folderName,
                path: path,
            })
        }).then(response => {
            if (response.ok) {
                toast("Folder created")
                closeRef.current?.click()
                // @ts-ignore
                navigation.reload()
            } else {
                console.log("error")
                response.json().then(data => {
                    console.log("error dat", data)
                    toast(data.error)
                })
            }
        })
    }

    const [folderName, setFolderName] = useState<string>("New folder");
    const closeRef = useRef<HTMLButtonElement | null>(null);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex flex-row gap-2 hover:bg-muted">
                    <FolderPlus className="w-4 h-4" />
                    <label>New Folder</label>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create new folder</DialogTitle>
                    {/* <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription> */}
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            defaultValue={folderName}
                            className="col-span-3"
                            onChange={(e) => { setFolderName(e.target.value) }}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleNewFolder}>Save changes</Button>
                </DialogFooter>
                <DialogClose className="hidden">
                    <button type="submit" ref={closeRef}></button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    )

}

export function Upload({ path }: { path: string }) {

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

    return (
        <Button
            variant="outline"
            className=" flex flex-row gap-2 hover:bg-muted "
            onClick={handleUpload}
        >
            <UploadIcon className="w-4 h-4" />
            <label>Upload</label>
        </Button >
    )
}


export function SetScope({ className = '', scope }: { className: string, scope: string }) {
    const closeRef = useRef<HTMLButtonElement | null>(null);

    const handleChangeScope = (e: BaseSyntheticEvent) => {
        fetch("/api/set-scope", {
            method: 'POST',
            body: JSON.stringify({
                scope: newScope,
            })
        }).then(response => {
            if (response.ok) {
                toast("Scope changed")
                closeRef.current?.click()
            } else {
                response.json().then(data => {
                    console.log(data)
                })
                toast("Error", { style: { color: '#ed4337' } })
            }
        })
    }

    const [newScope, setNewScope] = useState<string>(scope);

    return (
        <Dialog>
            <DialogTrigger asChild >
                <Button variant="outline" className={cn("flex flex-row gap-2 hover:bg-muted", className)}>
                    <label>Set scope</label>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create new folder</DialogTitle>
                    {/* <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription> */}
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            defaultValue={newScope}
                            className="col-span-3"
                            onChange={(e) => { setNewScope(e.target.value) }}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button type="submit" disabled={newScope == scope} onClick={handleChangeScope}>Save changes</Button>
                </DialogFooter>
                <DialogClose className="hidden">
                    <button type="submit" ref={closeRef}></button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    )
}


export function ChangeView({ className = '' }: { className?: string }) {

    const view = useStore($viewIndex)

    const changeView = () => {
        switch (view) {
            case "big":
                $viewIndex.set("details")
                return
            case "details":
                $viewIndex.set("galery")
                return
            case "galery":
                $viewIndex.set("big")
                return
            default:
                $viewIndex.set("galery")
                return
        }
    }


    const getIcon = () => {
        switch ($viewIndex.get()) {
            case "big":
                return <Table className="w-5 h-5" />
            case "details":
                return <List className="w-5 h-5" />
            case "galery":
                return <Images className="w-5 h-5" />
        }
    }

    return (
        <Button variant="outline" className={cn("flex flex-row gap-2 hover:bg-muted", className)} onClick={changeView}>
            {getIcon()}
        </Button>
    )
}