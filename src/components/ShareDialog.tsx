import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { cn } from "@/lib/utils";

import {
    CalendarIcon,
    Eye,
} from "lucide-react";
import { generateId } from "lucia";
import { format } from "date-fns"


import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"

import { Checkbox } from "@/components/ui/checkbox"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner";

export function DatePicker({ date, setDate }: { date: Date | undefined, setDate: Dispatch<SetStateAction<Date | undefined>> }) {

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}

export default function ShareDialog({ path, type }: { path: string | undefined, type: 'file' | 'directory' }) {

    const closeDeleteDialogRef = useRef<HTMLButtonElement | null>(null);
    const [shareExpriesAtDate, setShareExpriesAtDate] = useState<Date>()
    const [sharePassword, setSharePassword] = useState<string>('')
    const [shareUrl, setShareUrl] = useState<string>(generateId(16))
    const [shareEditable, setShareEditable] = useState<boolean>(false)
    const sharePasswordRef = useRef<HTMLInputElement>(null)

    const handleShare = () => {
        fetch("/api/create-share", {
            method: "post", body:
                JSON.stringify({
                    'password': sharePassword,
                    'url': shareUrl,
                    'expires_at': shareExpriesAtDate || "",
                    'editable': shareEditable,
                    'path': path,
                    'type': type,
                })
        }).then(response => {
            if (response.ok) {
                closeDeleteDialogRef.current?.click()
                toast("Share created")
            } else {
                closeDeleteDialogRef.current?.click()
                response.json().then((data) => {
                    toast(data.error, { style: { color: '#ed4337' } })
                })
            }
        })
    }

    return (

        <DialogContent>
            <DialogHeader>
                <DialogTitle>Share folder '{path?.split("/")[path?.split("/").length - 1] || "/"}'</DialogTitle>
                <DialogDescription>
                    Share '<label className='text-white font-semibold'>{path || '/'}</label>'.
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                <label className="text-sm ">Enter URL of share <label className="font-semibold text-muted">(8 characters)</label></label>
                <Input
                    className="invalid:bg-red-400/10 "
                    value={shareUrl}
                    onChange={(e) => { setShareUrl(e.target.value) }}
                    maxLength={8}
                    minLength={8}
                />
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                <label className="text-sm ">Enter password <label className="font-semibold text-muted">(Optional)</label></label>
                <div className="relative">
                    <Input
                        ref={sharePasswordRef}
                        value={sharePassword}
                        onChange={(e) => { setSharePassword(e.target.value) }}
                        type="password" />
                    <Eye
                        className="absolute top-1/2 -translate-y-1/2 right-2 w-5 h-5 hover:scale-105"
                        onMouseDown={() => { sharePasswordRef.current ? sharePasswordRef.current.type = "" : '' }}
                        onMouseUp={() => { sharePasswordRef.current ? sharePasswordRef.current.type = "password" : '' }}
                    />
                </div>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                <label className="text-sm w-[164px]">Editable</label>
                <Checkbox onCheckedChange={(checked) => { setShareEditable(checked.valueOf() as boolean) }}></Checkbox>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2 items-center">
                <label className="text-sm w-[164px]">Expiration date</label>
                <DatePicker date={shareExpriesAtDate} setDate={setShareExpriesAtDate}></DatePicker>
            </div>
            <DialogFooter>
                <DialogClose ref={closeDeleteDialogRef} />
                <Button variant="outline" onClick={() => closeDeleteDialogRef.current?.click()}>Cancel</Button>
                <Button disabled={false} onClick={handleShare} >Share</Button>
            </DialogFooter>
        </DialogContent>
    )
}