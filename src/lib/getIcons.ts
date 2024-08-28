import { fileExtensions } from "./supportedExtensions";
import { folderExtensions } from "./supportedFolders";

export function getFileIcon(filename: string) {

    let icon;


    for (let k of fileExtensions.supported) {
        if (k.disabled) { continue; }

        if (k.extensionsGlob && k.filenamesGlob) {
            for (let _ext of k.extensionsGlob) {
                for (let _filename of k.filenamesGlob) {
                    if (filename.startsWith(_filename) && filename.endsWith(_ext)) {
                        // console.log(k.icon)
                        icon = "/icons/file_type_" + k.icon + ".svg"
                        // return "/icons/file_type_" + k.icon + ".svg"
                    }
                }
            }
        }
        if (k?.extensions) {
            for (let ext of k?.extensions) {
                if (k.filename) {
                    if (filename === ext) {
                        // console.log(k.icon)
                        icon = "/icons/file_type_" + k.icon + ".svg"
                        // return "/icons/file_type_" + k.icon + ".svg"
                    }
                } else if (filename.endsWith("." + ext)) {
                    // console.log(k.icon)
                    icon = "/icons/file_type_" + k.icon + ".svg"
                    // return "/icons/file_type_" + k.icon + ".svg"
                }
            }
        }
        if (k?.languages) {
            for (let ext of k?.languages) {
                if (k.filename) {
                    if (filename === ext) {
                        // console.log(k.icon)
                        icon = "/icons/file_type_" + k.icon + ".svg"
                        // return "/icons/file_type_" + k.icon + ".svg"
                    }
                } else if (filename.endsWith("." + ext.defaultExtension)) {
                    // console.log(k.icon)
                    icon = "/icons/file_type_" + k.icon + ".svg"
                    // return "/icons/file_type_" + k.icon + ".svg"
                }
            }
        }
    }
    // console.log("=========================")
    return icon
}

export function getFolderIcon(filename: string) {
    for (let k of folderExtensions.supported) {
        if (k.disabled) { continue; }
        if (k?.extensions) {
            for (let ext of k?.extensions) {
                if (filename === ext) {
                    return "/icons/folder_type_" + k.icon + ".svg"
                }
            }
        }
    }
}