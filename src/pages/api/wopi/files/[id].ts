import type { APIContext } from "astro";
import { db } from "@/lib/db";
import type { DatabaseShare, DatabaseUser } from "@/types";
import path from 'path';

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


    const fileName = filePath.split("/").at(-1)

    // Fetch file details based on the ID (this could be from a database or filesystem)
    const fileData = {
        BaseFileName: fileName,
        OwnerId: context.locals.user?.id || "guest",
        Size: 12345, // The size of the file in bytes
        UserId: context.locals.user?.id || "guest",
        UserFriendlyName: context.locals.user?.username || "guest",
        Version: '1',
        SupportsUpdate: true,
        UserCanWrite: true,
        LastModifiedTime: new Date().toISOString(),
        IsAdminUser: context.locals.user?.admin || false
    };

    return new Response(JSON.stringify(fileData), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};
