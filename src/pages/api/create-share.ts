import type { APIContext } from "astro";

import fs from 'fs/promises';
import path from 'path';
import { db } from "@/lib/db";
import { generateId } from "lucia";
import type { DatabaseUser } from "@/types";

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

    let shareId = generateId(16)
    try {

        db.prepare("INSERT INTO shares (id, path, local_path, password, editable, expires_at, type) VALUES(?, ?, ?, ?, ?, ?, ?)").run(
            shareId,
            data.url,
            path.join(context.locals.user.scope, data.path),
            data.password || undefined,
            data.editable ? 1 : 0,
            data.expires_at ? new Date(data.expires_at).getTime() : undefined,
            data.type
        );

        userShares.push(shareId)


        db.exec(`UPDATE user SET shares = '${JSON.stringify(userShares)}' WHERE id = '${context.locals.user.id}'`)


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