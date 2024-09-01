import type { APIContext } from "astro";

import fs from 'fs/promises';
import path from 'path';

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
            await fs.rmdir(path.join(context.locals.user.scope, data.path))
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