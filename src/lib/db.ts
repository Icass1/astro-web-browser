import sqlite from "better-sqlite3";

export const db = sqlite("database.db");

// console.log("CREATE TABLE IF NOT EXISTS user")
db.exec(`CREATE TABLE IF NOT EXISTS user (
    id TEXT NOT NULL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    scope TEXT DEFAULT "/" NOT NULL,
    admin BOOLEAN DEFAULT 0 NOT NULL
)`);

// console.log("ALTER TABLE")
// db.exec(`UPDATE user SET admin = 1 WHERE id = 'qzwnikdpu60pb3v'`)
// db.exec(`ALTER TABLE config ADD COLUMN id TEXT NOT NULL PRIMARY KEY`)
// db.exec("DROP TABLE config")
// db.exec("DELETE FROM config WHERE id = '1.0'")





// console.log("CREATE TABLE IF NOT EXISTS session")
db.exec(`CREATE TABLE IF NOT EXISTS session (
    id TEXT NOT NULL PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
)`);

db.exec(`CREATE TABLE IF NOT EXISTS config (
    id TEXT NOT NULL PRIMARY KEY,
    signup BOOLEAN DEFAULT 1 NOT NULL
)`);

const config = db.prepare("SELECT * FROM config WHERE id='1'").get()
if (!config)  {
    console.log("Not config found")
    db.exec("INSERT INTO config (id) VALUES(1)")
}
