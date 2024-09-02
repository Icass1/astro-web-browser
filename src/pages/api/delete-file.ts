import type { APIContext } from "astro";
import { promises as fs } from 'fs';

// import fs from 'fs/promises';
// import path from 'path';
import * as path from 'path'

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

        if (data.isDirectory) {
            await fs.rm(path.join(context.locals.user.scope, data.path), {recursive: true})
        } else {
            await fs.rm(path.join(context.locals.user.scope, data.path))
        }

        return new Response(
            JSON.stringify({
                error: "OK"
            }),
            {
                status: 200
            }
        );
    } catch (err) {
        let error = err as ErrnoException
        if (error.code == "ENOTEMPTY") {
            return new Response(
                JSON.stringify({
                    error: "Directory not empty"
                }),
                {
                    status: 500
                }
            );
        } else {
            return new Response(
                JSON.stringify({
                    error: "Error deleting file"
                }),
                {
                    status: 500
                }
            );
        }
    }
}