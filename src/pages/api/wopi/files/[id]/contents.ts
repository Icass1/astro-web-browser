import type { APIContext } from "astro";
import fs from 'fs';
import { db } from "@/lib/db";
import path from 'path';
import type { DatabaseUser } from "@/types";

export async function GET(context: APIContext): Promise<Response> {

    const { id } = context.params;

    if (!id) {
        return new Response("Error")
    }
    const accessToken = new URL(context.request.url).searchParams.get('access_token');
    const userId = accessToken
    const userDB = (db.prepare(`SELECT scope, username FROM user WHERE id='${userId}'`).get() as DatabaseUser)
    const scope = userDB.scope
    const filePath = path.join(scope, id?.replace(/_._._/g, "/"))

    try {
        const fileBuffer = fs.readFileSync(filePath);
        return new Response(fileBuffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Length': fileBuffer.length.toString(),
            }
        });
    } catch (error) {
        console.error('File read error:', error);
        return new Response('File not found', { status: 404 });
    }
};