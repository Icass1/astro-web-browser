import { UploadIcon, FolderPlus } from "lucide-react"
import { Button, buttonVariants } from "./ui/button"
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
import { Switch } from "@/components/ui/switch"

import { useRef, useState, type BaseSyntheticEvent } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

import '@/styles/globals.css'
import { uploadFile } from "@/lib/uploadFile"
import { $viewIndex } from "./viewIndex"
import { useStore } from '@nanostores/react';

import { Images, List, Table } from "lucide-react"

// **********
// Deprecated
// **********
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

// **********
// Deprecated
// **********
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

// **********
// Deprecated
// **********
export function SetScope({ className = '', scope }: { className: string, scope: string }) {
    const closeRef = useRef<HTMLButtonElement | null>(null);

    const handleChangeScope = () => {
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
                $viewIndex.set("gallery")
                return
            case "gallery":
                $viewIndex.set("big")
                return
            default:
                $viewIndex.set("gallery")
                return
        }
    }


    const getIcon = () => {
        switch ($viewIndex.get()) {
            case "big":
                return <Table className="w-5 h-5" />
            case "details":
                return <List className="w-5 h-5" />
            case "gallery":
                return <Images className="w-5 h-5" />
        }
    }

    return (
        <Button variant="outline" className={cn("flex flex-row gap-2 hover:bg-muted", className)} onClick={changeView}>
            {getIcon()}
        </Button>
    )
}


export function CloseSession({ sessionID, className = '' }: { sessionID: string, className?: string }) {

    const handleClick = () => {

        fetch("/api/invalidate-session", {
            method: 'POST',
            body: JSON.stringify({
                session_id: sessionID,
            })
        }).then(response => {
            if (response.ok) {
                toast("Session closed")
            } else {
                response.json().then(data => {
                    toast(data.error, { style: { color: '#ed4337' } })
                }).catch(() => {
                    toast("Error closing session", { style: { color: '#ed4337' } })
                })
            }
        })
    }

    return (
        <Button variant={"outline"} className={cn("left-[calc(20%_+_0.5rem)] -translate-x-1/2 block relative mt-2 hover:bg-muted", className)} onClick={handleClick}>
            Close
        </Button>
    )
}

export function LogoutButton() {
    const handleClick = () => {
        fetch("/api/logout").then(response => {
            if (response.ok) {
                // @ts-ignore
                navigation.navigate("/login")
            } else {
                response.json().then(data => {
                    toast(data.error, { style: { color: '#ed4337' } })
                }).catch(() => {
                    toast("Error logging out", { style: { color: '#ed4337' } })
                })
            }
        })

    }
    return (
        <Button onClick={handleClick} className="hover:bg-destructive w-full text-center cursor-pointer" variant={"outline"}>
            Logout
        </ Button>
    )
}

export function CreateUser() {

    const closeDeleteDialogRef = useRef<HTMLButtonElement | null>(null);

    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [repeatPassword, setRepeatPassword] = useState<string>("")
    const [scope, setScope] = useState<string>("")
    const [admin, setAdmin] = useState<boolean>(false)

    const handleNewUser = () => {

        if (password != repeatPassword) {
            
            toast("Passwords don't match", { style: { color: '#ed4337' } })
            return
        }

        fetch("/api/create-user", {
            method: 'POST',
            body: JSON.stringify({
                username: username,
                password: password,
                repeatPassword: repeatPassword,
                scope: scope,
                admin: admin
            })
        }).then(response => {
            if (response.ok) {
                toast("User created")
            } else {
                response.json().then(data => {
                    toast(data.error, { style: { color: '#ed4337' } })
                }).catch(() => {
                    toast("Error creating user", { style: { color: '#ed4337' } })
                })
            }
        })

    }

    return (
        <Dialog>
            <DialogTrigger>
                <label className={cn(buttonVariants({ variant: "outline" }), "hover:bg-muted cursor-pointer")}>New user</label>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New user</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-[1fr_2fr] gap-x-3 gap-y-3 items-center">
                    <label className="text-right" >User Name</label>
                    <Input autoComplete='one-time-code' value={username} onChange={(e) => { setUsername(e.target.value) }}></Input>

                    <label className="text-right" >Password</label>
                    <Input type="password" autoComplete='one-time-code' value={password} onChange={(e) => { setPassword(e.target.value) }}></Input>

                    <label className="text-right" >Repeat password</label>
                    <Input type="password" autoComplete='one-time-code' value={repeatPassword} onChange={(e) => { setRepeatPassword(e.target.value) }}></Input>

                    <label className="text-right" >Scope</label>
                    <Input value={scope} onChange={(e) => { setScope(e.target.value) }}></Input>

                    <label className="text-right">Admin</label>
                    <Switch checked={admin} onCheckedChange={(checked) => { setAdmin(checked) }}></Switch>

                </div>
                <DialogFooter>
                    <DialogClose ref={closeDeleteDialogRef} />
                    <Button variant="outline" onClick={() => closeDeleteDialogRef.current?.click()}>Cancel</Button>
                    <Button disabled={false} onClick={handleNewUser}>Add user</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}