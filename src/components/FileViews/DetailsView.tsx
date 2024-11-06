import type { FileStats } from "@/types";
import { Share2 } from "lucide-react";
import '@/styles/globals.css'

export default function DetailsView(
    { file }: { file: FileStats }
) {

    const gitStatus = () => {

        if (!file.gitStatus || file.gitStatus?.files.length == 0) {
            return <label />
        }

        if (file.isDirectory) {
            if (file.gitStatus.files.find((element) => { return element.working_dir == "M" })) {
                return (
                    <svg className="w-3 h-3 mx-auto" viewBox="0 0 100 100" fill="#e2b568" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="50" />
                    </svg>
                )
            } else {
                return (
                    <svg className="w-3 h-3 mx-auto" viewBox="0 0 100 100" fill="#6aa37e" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="50" />
                    </svg>
                )
            }

        } else {
            if (file.gitStatus.files.length != 1) {
                return <label title="Git error" className="truncate">Git error</label>
            }

            if (file.gitStatus.files[0].working_dir == "M") {
                return <label className="font-semibold text-[#e2b568]  text-center">M</label>
            }

            if (file.gitStatus.files[0].working_dir == "?") {
                return <label title="Untracked" className="font-semibold text-[#6aa37e] text-center">U</label>
            }

            if (file.gitStatus.files[0].working_dir == " ") {
                return <label title="Index Added" className="font-semibold text-[#6aa37e]  text-center">A</label>
            }

            return <label>{file.gitStatus.files[0].working_dir}</label>
        }
    }

    return (
        <>
            <img src={file.iconPath} className="w-6 h-6" />
            <h3 className="font-semibold truncate max-w-full min-w-0">{file.name}</h3>
            <p className="text-xs md:text-sm text-muted-foreground truncate max-w-full min-w-0 text-right">
                {file.isDirectory ? ' ' : file.size + ' • '}
                {file.modified}
            </p>
            <div className="hidden md:block">
                {
                    file.shared ?
                        <Share2 className="w-4 h-4 text-blue-500 inline-block ml-2" />
                        :
                        <label></label>
                }
            </div>
            <div className="hidden md:block">
                {gitStatus()}
            </div>
        </>
    )
}
