import type { APIContext } from "astro";

import fs from 'fs/promises';
import path from 'path';
import { fileTypeFromBuffer } from 'file-type'

import { db } from "@/lib/db";
import type { DatabaseShare } from "@/types";

export async function GET(context: APIContext): Promise<Response> {
    try {

        const share = db
            .prepare(
                `SELECT * FROM share WHERE id='${context.params.path?.split("/")[0] as string}'`,
            )
            .get() as DatabaseShare;

        if (!context.params.path || !share) return new Response(
            JSON.stringify({
                error: "File not found"
            }),
            {
                status: 404
            }
        );

        const directoryPath = path.join(share.local_path, context.params.path.split("/").splice(1).join("/"))
        const stat = await fs.stat(directoryPath)
        if (stat.isDirectory()) {
            // Handle directory download. Maybe use zip
            return new Response(
                JSON.stringify({
                    error: "Directory download is not avaliable"
                }),
                {
                    status: 501
                }
            );
        } else {
            const fileContent = await fs.readFile(directoryPath)
            const fileType = await fileTypeFromBuffer(fileContent)

            directoryPath.split("/")

            return new Response(fileContent, {
                headers: {
                    'Content-Type': `${fileType?.mime}`, // MIME type of the file
                    'Cache-Control': 'public, max-age=3600', // Prevent caching
                    'Custom-Header': 'CustomHeaderValue', // Example of a custom header
                    'Content-Disposition': 'inline'
                },
            });
        }

    } catch (error) {
        console.log(error)
        return new Response(
            JSON.stringify({
                error: "File not found"
            }),
            {
                status: 404
            }
        );
    }

}