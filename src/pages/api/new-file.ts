import type { APIContext } from "astro";

import * as fs from 'fs/promises';
import * as path from 'path';

interface ErrnoException extends Error {
    errno?: number | undefined;
    code?: string | undefined;
    path?: string | undefined;
    syscall?: string | undefined;
}

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
        const dest = path.join(context.locals.user.scope, data.path, data.file_name)

        try {
            await fs.access(dest)
            return new Response(
                JSON.stringify({
                    error: "File already exists"
                }),
                {
                    status: 500
                }
            );
        } catch {
            await fs.copyFile("templates/template" + data.extension, dest)
        }


        return new Response("OK")

    } catch (err) {
        let error = err as ErrnoException
        if (error.code == "ENOENT") {
            console.error(error)
            return new Response(
                JSON.stringify({
                    error: "Template not found"
                }),
                {
                    status: 500
                }
            );
        }
        console.error(error)
        return new Response(
            JSON.stringify({
                error: "Error creating file"
            }),
            {
                status: 500
            }
        );
    }

}