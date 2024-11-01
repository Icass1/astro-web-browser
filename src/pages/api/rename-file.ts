import { db } from "@/lib/db";
import type { APIContext } from "astro";

import * as fs from 'fs/promises';
import * as path from 'path';

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
        const src = path.join(context.locals.user.scope, data.oldPath)
        const dest = path.join(context.locals.user.scope, data.newPath)
        
        db.exec(`UPDATE backup SET actual_file_path = '${dest}' WHERE actual_file_path = '${src}'`)

        await fs.rename(src, dest)

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
                error: "Error renaming file"
            }),
            {
                status: 500
            }
        );
    }

}