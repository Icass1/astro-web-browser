

import type { APIContext } from "astro";

// https://github.com/gitpod-io/openvscode-server/issues/320


export async function ALL(context: APIContext): Promise<Response> {


    const { path = '' } = context.params;
    const targetUrl = `http://localhost:8364/vscode` + (path ? '/' + path : '');


    // Forward the request to the target URL
    const proxyResponse = await fetch(targetUrl, {
        method: context.request.method,
        headers: context.request.headers,
        body: context.request.method !== 'GET' && context.request.method !== 'HEAD' ? context.request.body : undefined,
    });

    // Create a new response based on the proxy response
    const headers = new Headers(proxyResponse.headers);
    // headers.set('X-Proxy', 'Astro');

    headers.delete('content-encoding'); // Prevents re-decompression issues

    return new Response(await proxyResponse.text(), {
        status: proxyResponse.status,
        headers,
    });

}