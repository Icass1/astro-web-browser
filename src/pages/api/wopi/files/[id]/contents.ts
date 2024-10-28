import type { APIContext } from "astro";
import fs from 'fs';

export async function GET(context: APIContext): Promise<Response> {

    const { id } = context.params;

    if (!id) {
        return new Response("Error", { status: 404 })
    }

    let url = id.replace(/_._._/g, "/")
    const filePath = url

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

export async function POST(context: APIContext): Promise<Response> {

    const { id } = context.params;
    const access_token = context.url.searchParams.get("access_token")

    if (!id || !access_token) {
        return new Response("Not path provided", { status: 500 })
    }

    const params = JSON.parse(access_token)

    let url = id.replace(/_._._/g, "/")


    const fileBuffer = await context.request.arrayBuffer();
    fs.writeFileSync(url, Buffer.from(fileBuffer));

    return new Response('File saved successfully', { status: 200 });
}
