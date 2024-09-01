import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Share2, Edit, Trash, Download } from "lucide-react"
import { Button } from './ui/button';
import { toast } from 'sonner';
import '@/styles/globals.css'

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
import type { FileStats } from '@/types';
import { useRef } from 'react';


export default function FileDropdownMenu({ file, path }: { file: FileStats, path: string | undefined }) {

    const closeDeleteDialogRef = useRef<HTMLButtonElement | null>(null);

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
            } else {
                response.json().then(data => {
                    toast(data.error, { style: { color: '#ed4337' } })
                }).catch(error => {
                    toast("Error deleting file", { style: { color: '#ed4337' } })
                })
            }
        })

    }


    return (
        <Dialog>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    {/* <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-background"> */}
                    <MoreVertical className="h-8 w-8 hover:bg-background p-2 rounded" />
                    {/* </Button> */}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <div className='hover:bg-muted transition-colors rounded'>
                        <DropdownMenuItem onClick={() => { console.log("rename"); toast("rename") }}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Rename</span>
                        </DropdownMenuItem>
                    </div>
                    <div className='hover:bg-muted transition-colors rounded'>
                        <DropdownMenuItem >
                            <Download className="mr-2 h-4 w-4" />
                            <span>Download</span>
                        </DropdownMenuItem>
                    </div>
                    <div className='hover:bg-muted transition-colors rounded'>
                        <DropdownMenuItem>
                            <Share2 className="mr-2 h-4 w-4" />
                            <span>Share</span>
                        </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem className='w-full p-0'>
                        <DialogTrigger className='w-full'>
                            <div className='hover:bg-destructive transition-colors rounded'>
                                <DropdownMenuItem>
                                    <Trash className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            </div>
                        </DialogTrigger>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                        Do you really want to delete '<label className='text-white font-semibold'>{file?.name}</label>'. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose ref={closeDeleteDialogRef} />
                    <Button variant="outline" onClick={() => closeDeleteDialogRef.current?.click()}>Cancel</Button>
                    <Button onClick={handleDeleteFile}>Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
