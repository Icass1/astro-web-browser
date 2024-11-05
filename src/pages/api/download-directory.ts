import archiver from 'archiver';
import type { APIContext } from 'astro';
import fs from 'fs';
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
    const data = await context.request.json()

    const directoryPath = path.join(context.locals.user.scope, data.path);
    const archive = archiver(data.format, { zlib: { level: 9 } });



    return new Response(
        new ReadableStream({
            async start(controller) {
                // Set up the ZIP stream
                archive.on('data', (chunk) => {
                    controller.enqueue(chunk);
                });

                archive.on('end', () => {
                    controller.close();
                });

                archive.on('error', (err) => {
                    console.error('Archive error:', err);
                    controller.error(err);
                });


                // Add directory to archive
                archive.directory(directoryPath, false);
                await archive.finalize();
            },
        }),
        {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': 'attachment; filename="file.zip"',
            },
        }
    );
}
