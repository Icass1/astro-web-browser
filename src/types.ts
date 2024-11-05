import type { StatusResult } from "simple-git";

export interface FileStats {
    name: string;
    size: string;
    modified: string;
    isDirectory: boolean;
    iconPath: string;
    shared: boolean;
    shareInfo: DatabaseShare | undefined;
    mime: string;
    pinned: boolean;
    gitStatus: StatusResult | undefined
}

export interface DatabaseUser {
    id: string;
    username: string;
    password_hash: string;
    scope: string;
    admin: number;
    shares: string;
    pinned_files: string;
}

export interface DatabaseBackup {
    id: string;
    actual_file_path: string;
    file_path_at_creation: string;
    description: string;
    date: number;
    backup_path: string;
    user: string;
}

export interface DatabaseShare {
    id: string;
    path: string;
    local_path: string;
    password: string;
    times_accessed: number;
    times_downloaded: number;
    editable: boolean;
    expires_at: number;
    type: 'directory' | 'file';
}

export interface DatabaseConfig {
    signup: number;
    collabora_url: string;
    wopi_host: string;
}

export interface SignupDB {
    signup: number;
}
