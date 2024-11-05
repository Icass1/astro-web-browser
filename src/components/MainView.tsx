import type { FileStats } from "@/types"

import type { StatusResult } from "simple-git";
import GitMenu from "./GitMenu";
import DirectoryListing from "./DirectoryListing";
import { useState } from "react";

export default function MainView({ path, directoryListing, editable }: { path: string, directoryListing: { files: FileStats[], gitStatus: StatusResult | undefined }, editable: boolean }) {

    const [showGitStatus, setShowGitStatus] = useState<boolean>(false)

    return (
        showGitStatus ?
            <div className="grid grid-cols-[2fr_1px_300px] h-full gap-1 pb-4">
                < DirectoryListing path={path} directoryListing={directoryListing} editable={editable} />
                <div className="bg-muted h-full" />
                <GitMenu directoryListing={directoryListing}></GitMenu>
            </div >
            :
            <DirectoryListing path={path} directoryListing={directoryListing} editable={editable} />
    )
}