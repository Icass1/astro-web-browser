
import { Fragment } from "react/jsx-runtime";
import { ScrollArea } from "../ui/scroll-area";


export default function TextFileView({ fileContent }: { fileContent: string }) {

    return (
        <ScrollArea className="bg-muted/60 rounded p-2">
            <div className="grid grid-cols-[40px_1fr] gap-x-2">
                {fileContent.split("\n").map((line, index) => (
                    <Fragment key={index}>
                        <label className="text-primary/70 text-right border-r-2 border-solid border-muted  pr-2 select-none">{index}</label>
                        <input className="bg-transparent focus:outline-0" defaultValue={line} style={{ fontFamily: 'Consola' }}></input>
                    </Fragment>
                ))}
            </div>
        </ScrollArea>
    )
}