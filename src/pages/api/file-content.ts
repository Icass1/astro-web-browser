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

        console.log(data)

        await fs.writeFile(data.path, data.content, 'utf-8');

        return new Response("OK")

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