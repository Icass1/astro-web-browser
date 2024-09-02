import { Uint8ArrayToStr } from "@/lib/uint8ArrayToStr";
import TextFileView from "./TextFile";

export default function FileContentView(
    {
        path,
        fileContent,
        isText,
        fileExt,
        fileType,
    }:
        {
            path: string | undefined,
            fileContent: Buffer | undefined,
            isText: boolean | undefined,
            fileExt: string | undefined,
            fileType: string | undefined,
        }) {


    const renderMainView = () => {

        if (isText) {
            return <TextFileView fileContent={Uint8ArrayToStr(fileContent as Buffer)} />
        } else if (fileType?.startsWith("image")) {
            return (
                <div className="h-full w-full overflow-auto">
                    {/* <img className="left-1/2 relative top-1/2 -translate-x-1/2 -translate-y-1/2" src={"/file/" + path} /> */}
                    <img className="left-1/2 relative -translate-x-1/2" src={"/file/" + path} />
                </div>
            )
        } else if (fileType == "application/pdf") {
            return (
                <iframe className="h-full w-full" src={"/file/" + path}></iframe>
            )
        } else if (fileType == "video/mp4") {
            return (
                <video className="max-h-full max-w-full" controls src={"/file/" + path}></video>
            )
        } else {
            return (
                <>
                    <label>File format not supported</label>
                    <label>fileType '{fileType}'</label>
                    <label>isText '{JSON.stringify(isText)}'</label>
                </>
            )
        }
    }

    return (
        <div className="flex flex-col gap-10 h-full overflow-hidden px-1 pb-2">
            {renderMainView()}
        </div>
    )
}

