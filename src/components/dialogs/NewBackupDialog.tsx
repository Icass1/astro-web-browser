
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button";

import type { FileStats } from '@/types';
import { useRef, useState } from "react";
import { Input } from "../ui/input";
import { toast } from "sonner";

export default function NewBackupDialog({ path, file }: { path: string | undefined, file: FileStats }) {

    const closeDeleteDialogRef = useRef<HTMLButtonElement | null>(null);
    const [description, setDescription] = useState<string>("")

    const handleNewBackup = () => {

        fetch("/api/create-backup", {
            method: 'POST',
            body: JSON.stringify({
                path: (path ? (path + "/") : "") + file.name,
                description: description,
            })
        }).then(response => {
            if (response.ok) {
                toast("Backup created")
                closeDeleteDialogRef.current?.click()
            } else {
                response.json().then(data => {
                    toast(data.error, { style: { color: '#ed4337' } })
                }).catch(() => {
                    toast("Error creating backup", { style: { color: '#ed4337' } })
                })
            }
        })
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>New backup of '{file.name}'</DialogTitle>
            </DialogHeader>

            <Input placeholder="Description (Optional)" value={description} onChange={(e) => { setDescription(e.target.value) }} />

            <DialogFooter>
                <DialogClose ref={closeDeleteDialogRef} />
                <Button variant="outline" onClick={() => closeDeleteDialogRef.current?.click()}>Cancel</Button>
                <Button disabled={false} onClick={handleNewBackup}>Create backup</Button>
            </DialogFooter>
        </DialogContent>
    )
}