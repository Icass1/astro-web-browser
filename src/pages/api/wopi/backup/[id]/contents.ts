import type { APIContext } from "astro";
import fs from 'fs';

export async function GET(context: APIContext): Promise<Response> {

    const { id } = context.params;

    if (!id) {
        return new Response("Error", { status: 404 })
    }

    const filePath = "backups/" + id

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
