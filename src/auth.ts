import { Lucia } from "lucia";
import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";
import sqlite from "better-sqlite3";

const db = sqlite("database.db");

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
            scope: attributes.scope
        };
    }
});

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}
interface DatabaseUserAttributes {
    id: string;
    username: string;
    scope: string;
}