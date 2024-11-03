
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"

import { Button, buttonVariants } from "@/components/ui/button";

import type { DatabaseBackup, FileStats } from '@/types';
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function SeeBackupsDialog({ path, file }: { path: string | undefined, file: FileStats }) {

    const [backups, setBackups] = useState<string | DatabaseBackup[]>("Loading")

    useEffect(() => {
        fetch("/api/get-backups", {
            method: 'POST',
            body: JSON.stringify({
                path: (path ? (path + "/") : "") + file.name,
            })
        }).then(response => {
            if (response.ok) {
                response.text().then((data) => JSON.parse(data)).then(data => {
                    setBackups(data.backups)
                })
            } else {
                response.json().then(data => {
                    setBackups(data.error)
                }).catch(() => {
                    setBackups("Error getting backups")
                })
            }
        })
    }, [])



    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Backups of '{file.name}'</DialogTitle>
            </DialogHeader>
            {typeof backups == "string" ?
                <div>
                    <label>{backups}</label>
                </div>
                :
                backups.length == 0 ?
                    <div>No backups found</div>
                    :
                    <div className="flex flex-col gap-4">
                        {backups.map((backup, index) => {
                            const date = new Date(backup.date)

                            return (
                                <div key={index} className="shadow-md bg-background p-2 rounded flex flex-col gap-2">
                                    <label className="text-lg font-semibold text-foreground">
                                        {date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()} {date.getHours()}:{date.getMinutes().toString().padStart(2, "0")} <label className="text-base font-normal">• by {backup.user}</label>
                                    </label>
                                    {backup.description && <label>{backup.description}</label>}
                                    {backup.actual_file_path != backup.file_path_at_creation &&
                                        <div className="flex flex-col">
                                            <label className="">Path when backup was created:</label>
                                            <label className="text-sm pl-3 text-foreground/80">{backup.file_path_at_creation}</label>
                                        </div>
                                    }
                                    <div className="flex flex-row justify-between">
                                        <Button variant="outline" className="hover:bg-destructive px-2">Delete backup</Button>
                                        <Button variant="outline" className="hover:bg-muted px-2">Restore backup</Button>
                                        <a className={cn(buttonVariants({ variant: "outline" }), "hover:bg-muted px-2")} target="_blank" href={`/backup/${backup.id}`}>
                                            Open file
                                        </a>
                                        <a className={cn(buttonVariants({ variant: "outline" }), "hover:bg-muted px-2")} target="_blank" href={`/backup/compare/${backup.id}`}>
                                            Compare file
                                        </a>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
            }
            <DialogFooter>
                <DialogClose>
                    <Button variant="outline">Close</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}