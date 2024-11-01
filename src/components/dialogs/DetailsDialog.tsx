
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button";

import type { FileStats } from '@/types';

export default function DetailsDialog({ path, file, type }: { path: string | undefined, file: FileStats, type: 'file' | 'directory' }) {

    console.log(location.hostname)

    const shareExpirationDate = file.shareInfo?.expires_at ? new Date(file.shareInfo?.expires_at) : ''

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{type == "directory" ? "Directory" : "File"} '{path?.split("/")[path?.split("/").length - 1] || "/"}'</DialogTitle>
            </DialogHeader>

            <div className='grid grid-cols-[1fr_2fr] gap-3'>
                <label className='text-right'>Path:</label>
                <label>{path || '/'}</label>
                <label className='text-right'>File Name:</label>
                <label>{path?.split("/")[path?.split("/").length - 1] || "/"}</label>
                <label className='text-right'>Size:</label>
                <label>{file.size}</label>
                <label className='text-right'>Modified:</label>
                <label>{file.modified}</label>
            </div>
            <div>
                {file.shared ?
                    <div>
                        <DialogHeader>
                            <DialogTitle>Share info</DialogTitle>
                        </DialogHeader>

                        <div className='grid grid-cols-[1fr_2fr] gap-3'>
                            <label className='text-right'>URL:</label>
                            <label>{location.origin}/share/{file.shareInfo?.path}</label>
                            <label className='text-right'>Editable:</label>
                            <label>{file.shareInfo?.editable ? 'Yes' : 'No'}</label>
                            <label className='text-right'>Password:</label>
                            <label>{file.shareInfo?.password}</label>
                            <label className='text-right'>Times accessed:</label>
                            <label>{file.shareInfo?.times_accessed}</label>
                            <label className='text-right'>Times downloaded:</label>
                            <label>{file.shareInfo?.times_downloaded}</label>
                            <label className='text-right'>Expiration date:</label>
                            {shareExpirationDate ?
                                <label>{`${shareExpirationDate.getDate()}/${shareExpirationDate.getMonth() + 1}/${shareExpirationDate.getFullYear()}`}</label>
                                :
                                <label>Never</label>
                            }
                        </div>
                    </div>
                    : ""}
            </div>

            <DialogFooter>
                <DialogClose>
                    <Button variant="outline">Close</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}