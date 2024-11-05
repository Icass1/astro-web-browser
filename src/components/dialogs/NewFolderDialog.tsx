import { useRef, useState, type BaseSyntheticEvent } from "react"
import { Button } from "../ui/button"
import { DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { toast } from "sonner"


export default function NewFolderDialog({ path }: { path: string }) {

    const handleNewFolder = (e: BaseSyntheticEvent) => {
        console.log("New Folder", e.target, folderName, path)
        fetch("/api/new-directory", {
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

        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Create new folder</DialogTitle>
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

    )

}