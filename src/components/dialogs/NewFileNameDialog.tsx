
import { useRef, useState, } from 'react';



import {
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type fileTypes = "Excel" | "Word" | "Powerpoint" | "Text" | "Python" | undefined

export default function NewFileNameDialog({ fileType, path }: { fileType: fileTypes, path: string }) {


    if (!fileType) {
        <DialogContent>
            This should never happend, fileType is undefined
        </DialogContent>
    }

    const closeDeleteDialogRef = useRef<HTMLButtonElement | null>(null);
    const [fileName, setFileName] = useState<string>("")

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
