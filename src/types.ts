export interface FileStats {
    name: string,
    size: string,
    modified: string,
    isDirectory: boolean,
    iconPath: string,
    shared: boolean,
    mime: string
}

export interface UserAttributres {

    id: string
    name: string
}