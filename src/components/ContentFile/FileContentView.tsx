import type { Stats } from "fs";
import { ScrollArea } from "../ui/scroll-area";
import { Uint8ArrayToStr } from "@/lib/uint8ArrayToStr";
import TextFileView from "./TextFile";

export default function FileContentView(
    {
        path,
        fileContent,
        stat,
        isText,
        fileExt,
        fileType,
    }:
        {
            path: string | undefined,
            fileContent: Buffer | undefined,
            stat: Stats | undefined,
            isText: boolean | undefined,
            fileExt: string | undefined,
            fileType: string | undefined,
        }) {

    console.log(path)

    const renderMainView = () => {
        if (isText) {
            return <TextFileView fileContent={Uint8ArrayToStr(fileContent as Buffer)} />
        } else if (fileType?.startsWith("image")) {
            return (
                <div className="h-full w-full overflow-auto">

                    <img src={"/file/" + path} />
                </div>
            )
        } else if (fileType == "application/pdf") {
            return (
                <iframe className="h-full w-full" src={"/file/" + path}></iframe>

            )
        }
    }

    return (
        <div className="flex flex-col gap-10 h-full overflow-hidden px-2 pb-4">
            {fileContent ?
                renderMainView()
                :
                <div>No content</div>
            }
        </div>
    )
}

