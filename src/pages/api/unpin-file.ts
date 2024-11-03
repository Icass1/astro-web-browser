import type { APIContext } from "astro";

import * as path from 'path';

import { db } from "@/lib/db";
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
    try {
        let pinnedFiles = JSON.parse((db.prepare(`SELECT pinned_files FROM user WHERE id='${context.locals.user.id}'`).get() as DatabaseUser).pinned_files) as string[]
        const filePath = path.join(context.locals.user.scope, data.path)

        if (pinnedFiles.includes(filePath)) {
            pinnedFiles = pinnedFiles.filter(file => file != filePath)
            db.exec(`UPDATE user SET pinned_files = '${JSON.stringify(pinnedFiles)}' WHERE id = '${context.locals.user.id}'`)
            return new Response(
                JSON.stringify({
                    error: "OK"
                }),
                {
                    status: 200
                }
            );
        }

        return new Response(
            JSON.stringify({
                error: "File isn't pinned"
            }),
            {
                status: 500
            }
        );
    } catch (error) {
        console.log(error)
        return new Response(
            JSON.stringify({
                error: "File already exists"
            }),
            {
                status: 500
            }
        );
    }
}