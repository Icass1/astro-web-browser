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
    try {

        console.log(context.request)

        const formData = await context.request.formData();

        const file = formData.get("file") as File
        const filePath = formData.get("path") as string


        const stream = file.stream()
        const reader = stream.getReader()
        const { value } = await reader.read();

        const localFilePath = path.join(context.locals.user.scope, filePath, file.name); // Update this path as needed

        const localFile = await fs.open(localFilePath, "w");
        await localFile.writeFile(value as Uint8Array);
        await localFile.close();

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
                error: "Unable to upload the file"
            }),
            {
                status: 500
            }
        );
    }
}