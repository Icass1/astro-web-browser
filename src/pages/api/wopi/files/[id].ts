import type { APIContext } from "astro";
import { db } from "@/lib/db";
import type { DatabaseUser } from "@/types";
import path from 'path';

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

    const fileName = filePath.split("/").at(-1)

    // Fetch file details based on the ID (this could be from a database or filesystem)
    const fileData = {
        BaseFileName: fileName,
        OwnerId: userId,
        Size: 12345, // The size of the file in bytes
        UserId: userId,
        UserFriendlyName: userDB.username,
        Version: '1',
        SupportsUpdate: true,
        UserCanWrite: true,
        LastModifiedTime: new Date().toISOString()
    };

    return new Response(JSON.stringify(fileData), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};
