import { uploadFile } from "@/lib/uploadFile";
import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "lucide-react";
import { useState, type DragEvent } from "react";
import { toast } from "sonner";


function HeaderPathElement({ path, index, dir }: { path: string[], index: number, dir: string }) {

    const [isOver, setIsOver] = useState<boolean>(false)

    const handleDragEnter = (event: DragEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsOver(true)
    }
    const handleDragLeave = (event: DragEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsOver(false)
    }
    const handleDragOver = (event: DragEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        event.stopPropagation();
    }

    const joinedPath = path.slice(0, index).join("/")

    const handleDrop = (event: DragEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        event.stopPropagation();

        setIsOver(false)

        // Move files insde the application.
        const transferData = event.dataTransfer.getData("file-path")

        if (transferData) {
            const data = JSON.parse(transferData)
            const src = (data.path ? (data.path + "/") : "") + data.fileName
            const dest = (joinedPath ? (joinedPath + "/") : "") + data.fileName

            console.log(src, "->", dest)

            if (src + "/" + data.fileName == dest) {
                toast("Unable to move a folder into itself", { style: { color: '#ed4337' } })
                return
            }

            if (src == dest) {
                return
            }

            fetch("/api/move-file", {
                method: 'POST',
                body: JSON.stringify({
                    isDirectory: data.isDirectory,
                    src: src,
                    dest: dest,
                })
            }).then(response => {
                if (response.ok) {
                    toast("File moved")
                    // @ts-ignore
                    // navigation.reload()
                } else {
                    toast("Error moving file", { style: { color: '#ed4337' } })
                    console.log("")
                }
            })
        } else {

            function traverseFileTree(item: FileSystemEntry, path?: string) {
                path = path || ""
                console.log("item.name", path + item.name)
                if (item.isFile) {
                    // Get file
                    // @ts-ignore
                    item.file(function (file: File) {
                        console.log("File:", path + file.name);
                        // console.log("File:", file);
                        uploadFile(path, file)
                    });
                } else if (item.isDirectory) {
                    fetch("/api/new-directory", { method: "POST", body: JSON.stringify({ path: path, folder_name: item.name }) }).then(response => {
                        if (response.ok) {
                            // Get folder contents
                            // @ts-ignore
                            var dirReader = item.createReader();
                            dirReader.readEntries(function (entries: FileSystemEntry[]) {
                                for (var i = 0; i < entries.length; i++) {
                                    traverseFileTree(entries[i], path + item.name + "/");
                                }
                            });
                        } else {
                            toast("Error creating directory", { style: { color: '#ed4337' } })
                        }
                    })
                }
            }

            var items = event.dataTransfer.items;
            for (var i = 0; i < items.length; i++) {
                // webkitGetAsEntry is where the magic happens
                var item = items[i].webkitGetAsEntry();
                if (item) {
                    traverseFileTree(item, (joinedPath ? (joinedPath + "/") : "") + "/");
                }
            }
        }
    };



    return (
        <a
            className={cn("font-semibold hover:bg-muted rounded px-2 py-1", isOver && "bg-muted/50 rounded outline-dashed outline-1 outline-blue-500")}
            href={"/files/" + path.slice(0, index).join("/")}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
        >
            {dir}
        </a >
    )
}

export default function HeaderPath({ path }: { path: string | undefined }) {

    return (
        <div className="flex flex-row items-center w-full overflow-x-hidden p-1">
            <HeaderPathElement path={path?.split("/") || [""]} index={0} dir="Home" />

            {path?.split("/").map((dir, index, path) => (
                <div key={index} className="flex flex-row items-center">
                    <ChevronRightIcon className='w-7 h-7' />
                    <HeaderPathElement path={path} index={index + 1} dir={dir} />
                </div>
            ))}
        </div>

    )

}