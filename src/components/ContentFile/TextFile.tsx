
import { Fragment } from "react/jsx-runtime";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRef, useState } from "react";


export default function TextFileView({ fileContent }: { fileContent: string }) {
    const lineNumberRef = useRef<HTMLDivElement>(null)
    const [content, setContent] = useState(fileContent)

    return (
        <div className="w-full h-full relative grid grid-cols-[40px_1fr] gap-x-2">
            <div ref={lineNumberRef} className="flex flex-col h-full overflow-y-hidden">
                {[...content.split("\n"), " ", " ", " "].map((line, index) => (
                    <label key={index} className="text-primary/70 text-right border-r-2 border-solid border-muted  pr-2 select-none">{index}</label>
                ))}
            </div>
            <textarea value={content} onInput={(e) => { setContent((e.target as HTMLTextAreaElement).value) }} className="w-full bg-muted/60 h-full resize-none relative outline-none" onScroll={(e) => { if (lineNumberRef.current) lineNumberRef.current.scrollTop = (e.target as HTMLTextAreaElement).scrollTop }} />
        </div>
    )

    return (
        <ScrollArea className="bg-muted/60 rounded p-2">
            <div className="grid grid-cols-[40px_1fr] gap-x-2">
                {fileContent.split("\n").map((line, index) => (
                    <Fragment key={index}>
                        <label className="text-primary/70 text-right border-r-2 border-solid border-muted  pr-2 select-none">{index}</label>
                        <input className="bg-transparent outline-none" defaultValue={line} style={{ fontFamily: 'Consola' }}></input>
                    </Fragment>
                ))}
            </div>
        </ScrollArea>
    )
}