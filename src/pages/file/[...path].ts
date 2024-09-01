import type { APIContext } from "astro";

import fs from 'fs/promises';
import path from 'path';
import { fileTypeFromBuffer } from 'file-type'

export async function GET(context: APIContext): Promise<Response> {

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
        if (!context.params.path) return new Response(
            JSON.stringify({
                error: "File not found"
            }),
            {
                status: 404
            }
        );

        const directoryPath = path.join(context.locals.user.scope, context.params.path)
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
                    'Cache-Control': 'no-cache', // Prevent caching
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