import sqlite from "better-sqlite3";

export const db = sqlite("database/database.db");

// console.log("CREATE TABLE IF NOT EXISTS user")
db.exec(`CREATE TABLE IF NOT EXISTS user (
    id TEXT NOT NULL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    scope TEXT DEFAULT "/" NOT NULL,
    admin BOOLEAN DEFAULT 0 NOT NULL,
    shares TEXT DEFAULT "[]" NOT NULL,
    pinned_files TEXT DEFAULT "[]" NOT NULL
)`);



db.exec(`CREATE TABLE IF NOT EXISTS share (
    id TEXT NOT NULL PRIMARY KEY,
    path TEXT NOT NULL,
    local_path TEXT NOT NULL,
    password TEXT default NULL,
    times_accessed INTEGER DEFAULT 0 NOT NULL,
    times_downloaded INTEGER DEFAULT 0 NOT NULL,
    editable BOOLEAN DEFAULT 0 NOT NULL,
    expires_at INTEGER,
    type TEXT NOT NULL
)`);

db.exec(`CREATE TABLE IF NOT EXISTS session (
    id TEXT NOT NULL PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
)`);

db.exec(`CREATE TABLE IF NOT EXISTS config (
    id TEXT NOT NULL PRIMARY KEY,
    signup BOOLEAN DEFAULT 1 NOT NULL,
    collabora_url TEXT DEFAULT '' NOT NULL,
    wopi_host TEXT DEFAULT '' NOT NULL
)`);

db.exec(`CREATE TABLE IF NOT EXISTS backup (
    id TEXT NOT NULL PRIMARY KEY,
    actual_file_path TEXT NOT NULL,
    file_path_at_creation TEXT  NOT NULL,
    description TEXT,
    date INTEGER NOT NULL,
    backup_path TEXT  NOT NULL,
    user TEXT  NOT NULL
)`);

const config = db.prepare("SELECT * FROM config WHERE id='1'").get()
if (!config) {
    console.log("Not config found")
    db.exec("INSERT INTO config (id) VALUES(1)")
}

// console.log("ALTER TABLE")
// db.exec(`UPDATE user SET admin = 1 WHERE id = 'qzwnikdpu60pb3v'`)
// db.exec(`ALTER TABLE user ADD COLUMN pinned_files TEXT DEFAULT "[]" NOT NULL`)
// db.exec("DROP TABLE config")
// db.exec("DELETE FROM config WHERE id = '1.0'")

// console.log("CREATE TABLE IF NOT EXISTS shartes")
