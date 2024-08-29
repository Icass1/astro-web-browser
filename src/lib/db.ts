import sqlite from "better-sqlite3";

export const db = sqlite("database.db");

// console.log("CREATE TABLE IF NOT EXISTS user")
db.exec(`CREATE TABLE IF NOT EXISTS user (
    id TEXT NOT NULL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    scope TEXT DEFAULT "/" NOT NULL
)`);

// console.log("ALTER TABLE user ADD COLUMN IF ")
// db.exec(`ALTER TABLE user ADD COLUMN scope TEXT DEFAULT '/'`)


// console.log("CREATE TABLE IF NOT EXISTS session")
db.exec(`CREATE TABLE IF NOT EXISTS session (
    id TEXT NOT NULL PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
)`);

export interface DatabaseUser {
	id: string;
	username: string;
	password_hash: string;
}