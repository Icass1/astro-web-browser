import type { APIContext } from "astro";
import { db } from "@/lib/db";
import type { DatabaseUser } from "@/types";

export async function GET(context: APIContext): Promise<Response> {

    const { id } = context.params;
    const access_token = context.url.searchParams.get("access_token")

    if (!id || !access_token) {
        return new Response("Not path provided", { status: 500 })
    }

    const params = JSON.parse(access_token)

    let url = id.replace(/_._._/g, "/")
    const filePath = url

    const fileName = filePath.split("/").at(-1)

    let userDB: DatabaseUser | undefined

    if (params?.share == false && params?.id) {
        userDB = db.prepare(`SELECT username, admin FROM user WHERE id = '${params.id}'`).get() as DatabaseUser
    }

    // Fetch file details based on the ID (this could be from a database or filesystem)
    const fileData = {
        BaseFileName: fileName,
        OwnerId: userDB?.id || "guest",
        Size: 12345, // The size of the file in bytes
        UserId: userDB?.id || "guest",
        UserFriendlyName: userDB?.username || "guest",
        Version: '1',
        SupportsUpdate: true,
        UserCanWrite: true,
        LastModifiedTime: new Date().toISOString(),
        IsAdminUser: userDB?.admin || false
    };

    return new Response(JSON.stringify(fileData), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};
