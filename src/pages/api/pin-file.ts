import type { APIContext } from "astro";

import * as fs from 'fs/promises';
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
        const pinnedFiles = JSON.parse((db.prepare(`SELECT pinned_files FROM user WHERE id='${context.locals.user.id}'`).get() as DatabaseUser).pinned_files)
        const filePath = path.join(context.locals.user.scope, data.path)

        if (pinnedFiles.includes(filePath)) {
            return new Response(
                JSON.stringify({
                    error: "File already pinned"
                }),
                {
                    status: 500
                }
            );

        }

        pinnedFiles.push(filePath)

        db.exec(`UPDATE user SET pinned_files = '${JSON.stringify(pinnedFiles)}' WHERE id = '${context.locals.user.id}'`)


        return new Response(
            JSON.stringify({
                error: "OK"
            }),
            {
                status: 200
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