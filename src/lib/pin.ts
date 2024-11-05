import { toast } from "sonner"


export const handlePinFile = (path: string) => {
    fetch("/api/pin-file", {
        method: "POST",
        body: JSON.stringify({
            'path': path
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

export const handleUnpinFile = (path: string) => {
    fetch("/api/unpin-file", {
        method: "POST",
        body: JSON.stringify({
            'path': path
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