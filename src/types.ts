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
}

export interface DatabaseConfig {
    signup: number,
}

export interface SignupDB {
	signup: number
}
