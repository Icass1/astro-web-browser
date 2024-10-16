export interface FileStats {
    name: string,
    size: string,
    modified: string,
    isDirectory: boolean,
    iconPath: string,
    shared: boolean,
    mime: string
}

export interface DatabaseUser {
    id: string;
    username: string;
    password_hash: string;
    scope: string;
    admin: boolean;
    shares: string;
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
    signup: number,
    collabora_url: string,
    wopi_host: string
}

export interface SignupDB {
	signup: number
}
