import { Uint8ArrayToStr } from "@/lib/uint8ArrayToStr";
import TextFileView from "./TextFile";
import Collabora from "./Collabora";
import "@/styles/globals.css";

export default function FileContentView(
    {
        relativePath,
        absolutePath,
        fileContent,
        isText,
        fileExt,
        fileType,
        userId,
        collaboraURL,
        type,
        id,
        WOPIHost,
    }:
        {
            relativePath: string,
            absolutePath: string,
            fileContent: Buffer | undefined,
            isText: boolean,
            fileExt: string | undefined,
            fileType: string | undefined,
            userId: string,
            collaboraURL: string,
            type: "normal" | "share" | "backup",
            id: string,
            WOPIHost: string
        }) {

    const renderMainView = () => {
        if (isText) {
            // return <Collabora userId={userId} filePath={path} collaboraURL={collaboraURL} />

            return <TextFileView fileContent={Uint8ArrayToStr(fileContent as Buffer)} />
        } else if (fileType?.startsWith("image")) {
            return (
                <div className="h-full w-full overflow-auto">
                    {/* <img className="left-1/2 relative top-1/2 -translate-x-1/2 -translate-y-1/2" src={"/api/file/" + path} /> */}
                    <img className="left-1/2 relative -translate-x-1/2" src={relativePath} />
                </div>
            )
        } else if (false && fileType == "application/pdf") {
            return (
                <iframe className="h-full w-full" src={relativePath}></iframe>
            )
        } else if (fileType == "video/mp4") {
            return (
                <video className="max-h-full max-w-full" controls src={relativePath}></video>
            )
        } else if (
            fileType &&
            [
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/pdf'
            ].includes(fileType)) {
            return (
                <Collabora userId={userId} filePath={absolutePath} collaboraURL={collaboraURL} type={type} id={id} WOPIHost={WOPIHost} />
            )

        } else {
            return (
                <>
                    <label>File format not supported</label>
                    <label>fileType '{fileType}'</label>
                    <label>isText '{JSON.stringify(isText)}'</label>
                    <label>{relativePath}</label>
                </>
            )
        }
    }

    return (
        <div className="bg-neutral-800 h-full w-full">
            {renderMainView()}
        </div>
    )

    if (type == "backup") {
        return (
            <div className="bg-neutral-800">
                {renderMainView()}
            </div>
        )
    }


    return (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-neutral-800">
            {renderMainView()}
        </div>
    )
}

