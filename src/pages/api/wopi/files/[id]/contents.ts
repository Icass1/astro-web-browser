import type { APIContext } from "astro";
import fs from 'fs';
import { db } from "@/lib/db";
import path from 'path';
import type { DatabaseShare, DatabaseUser } from "@/types";

export async function GET(context: APIContext): Promise<Response> {

    const { id } = context.params;

    if (!id) {
        return new Response("Error")
    }

    let url = id.replace(/_._._/g, "/")
    console.log({url: url})

    let filePath
    if (url.startsWith("/api/share")) {
        console.warn("Check if file is shared.")
        filePath = "asdf"
        const share = (db.prepare(`SELECT * FROM share WHERE id='${url.split("/")[3]}'`).get() as DatabaseShare)
        filePath = path.join(share.local_path, url.split("/").splice(4).join("/"))
    } else if (url.startsWith("/api/file")) {
        url = url.replace("/api/file", "")

        const accessToken = new URL(context.request.url).searchParams.get('access_token');
        const userId = accessToken
        const userDB = (db.prepare(`SELECT scope, username FROM user WHERE id='${userId}'`).get() as DatabaseUser)
        const scope = userDB.scope
        filePath = path.join(scope, url)
        console.log(filePath)
    } else {
        console.warn("url doesn't start with correct string")
        return new Response('File not found', { status: 404 });
    }

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