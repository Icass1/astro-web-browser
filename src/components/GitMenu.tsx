import { getFileIcon } from "@/lib/getIcons";
import type { FileStats } from "@/types";
import type { StatusResult } from "simple-git";

export default function GitMenu({ directoryListing }: { directoryListing: { files: FileStats[], gitStatus: StatusResult | undefined } }) {
    console.log(directoryListing.gitStatus)
    return (
        <div className="flex flex-col p-2 text-foreground/80">
            <label>Staged Changes</label>
            {directoryListing.gitStatus?.staged.map(file => {
                if (directoryListing.gitStatus?.deleted.includes(file)) {
                    return (
                        <div className="flex flex-row items-center gap-2 text-[#934437]">
                            <img src={getFileIcon(file)} className="w-4 h-4" />
                            {/* @ts-ignore */}
                            <strike>{file}</strike>
                        </div>
                    )
                }

                if (directoryListing.gitStatus?.created.includes(file)) {
                    return (
                        <div title={file + " - Index Added"} className="flex flex-row items-center gap-2 text-[#6aa37e]">
                            <img src={getFileIcon(file)} className="w-4 h-4" />
                            {file}
                        </div>
                    )
                }

                return (
                    <div className="flex flex-row items-center gap-2">
                        <img src={getFileIcon(file)} className="w-4 h-4" />
                        {file}
                    </div>
                )
            })}

            <label>Changes</label>

            {directoryListing.gitStatus?.modified.map(file => (
                <div title={file + " - Modified"} className="flex flex-row items-center w-full gap-2 text-[#e2b568]">
                    <img src={getFileIcon(file)} className="w-4 h-4" />
                    <label className="truncate w-full text-left" style={{ direction: "rtl" }}>{file}</label>
                </div>
            ))}

            {directoryListing.gitStatus?.not_added.map(file => (
                <div title={file + " - Untracked"} className="flex flex-row items-center gap-2 text-[#6aa37e]" >
                    <img src={getFileIcon(file)} className="w-4 h-4" />
                    <label className="truncate w-full text-left" style={{ direction: "rtl" }}>{file}</label>
                </div>
            ))}

            {directoryListing.gitStatus?.deleted.map(file => {
                if (directoryListing.gitStatus?.staged.includes(file)) { return }

                return (
                    <div title={file + " - Deleted"} className="flex flex-row items-center gap-2 text-[#934437]">
                        <img src={getFileIcon(file)} className="w-4 h-4" />
                        {/* @ts-ignore */}
                        <label className="truncate w-full text-left" style={{ direction: "rtl" }}><strike>{file}</strike></label>
                    </div>
                )
            })}
        </div>


    )

}