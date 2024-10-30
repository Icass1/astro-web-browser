import { Lucia } from "lucia";
import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";
// import sqlite from "better-sqlite3";
import type { DatabaseUser } from "./types";
import { db } from "./lib/db";


const adapter = new BetterSqlite3Adapter(db, {
    user: "user",
    session: "session"
});

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            // set to `true` when using HTTPS
            secure: import.meta.env.PROD
        }
    },
    getUserAttributes: (attributes) => {
        return {
            username: attributes.username,
            id: attributes.id,
            scope: attributes.scope,
            admin: attributes.admin == 1 ? true : false
        };
    }
});

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUser;
    }
}
