import type { APIContext } from "astro";
import { db } from "@/lib/db";
import type { DatabaseBackup, DatabaseShare, DatabaseUser } from "@/types";

export async function GET(context: APIContext): Promise<Response> {
    const { id } = context.params;
    const access_token = context.url.searchParams.get("access_token")

    if (!id || !access_token) {
        return new Response("Not path provided", { status: 500 })
    }

    const params = JSON.parse(access_token)

    const userDB = db.prepare(`SELECT username, admin FROM user WHERE id = '${params.id}'`).get() as DatabaseUser
    const backupDB = db.prepare(`SELECT * FROM backup WHERE id = '${id}'`).get() as DatabaseBackup

    if (!userDB) {
        return new Response(JSON.stringify({ status: 404 }))
    }
    if (!backupDB) {
        return new Response(JSON.stringify({ status: 404 }))
    }

    const date = new Date(backupDB.date)

    const fileName = `${backupDB.file_path_at_creation.split("/").at(-1)} - ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear().toString().padStart(2, "0")} ${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`

    // Fetch file details based on the ID (this could be from a database or filesystem)
    const fileData = {
        BaseFileName: fileName,
        OwnerId: userDB?.id || "guest",
        Size: 12345, // The size of the file in bytes
        UserId: userDB?.id || "guest",
        UserFriendlyName: userDB?.username || "guest",
        Version: '1',
        SupportsUpdate: true,
        UserCanWrite: false,
        LastModifiedTime: new Date().toISOString(),
        IsAdminUser: userDB?.admin || false
    };

    return new Response(JSON.stringify(fileData), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};
