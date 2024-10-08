import type { APIContext } from "astro";

import fs from 'fs/promises';
import path from 'path';
import { db } from "@/lib/db";
import { generateId, type DatabaseUser } from "lucia";

export async function POST(context: APIContext): Promise<Response> {

    if (!context.locals.user) {
        return new Response(
            JSON.stringify({
                error: "User not logged in"
            }),
            {
                status: 401
            }
        );
    }

    const data = await context.request.json()
    console.log(data)


    const userShares = JSON.parse((db.prepare(`SELECT shares FROM user WHERE id='${context.locals.user.id}'`).get() as DatabaseUser).shares)

    console.log(userShares)
    try {

        // db.prepare("INSERT INTO shares (id, path, local_path, password, editable, expires_at) VALUES(?, ?, ?, ?, ?, ?)").run(
        //     generateId(16),
        //     data.url,
        //     path.join(context.locals.user.scope, data.path),
        //     data.password || undefined,
        //     data.editable ? 1 : 0,
        //     data.expires_at ? new Date(data.expires_at).getTime() : undefined
        // );




        // db.exec(`UPDATE user SET ${column} = '${k[1]}' WHERE id = '${id}'`)


        return new Response(
            JSON.stringify({
                error: "Share created"
            }),
            {
                status: 200
            }
        );
    } catch {
        return new Response(
            JSON.stringify({
                error: "Unable to create share"
            }),
            {
                status: 500
            }
        );
    }
}