import { lucia } from "@/auth";

import type { APIContext } from "astro";

export async function POST(context: APIContext): Promise<Response> {
    if (!context.locals.session) {
        return new Response("Error", {
            status: 401
        });
    }

    await lucia.invalidateSession(context.locals.session.id);

    const sessionCookie = lucia.createBlankSessionCookie();
    context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return new Response("OK");
}

export async function GET(context: APIContext): Promise<Response> {
    if (!context.locals.session) {
        return new Response("error", {
            status: 401
        });
    }

    await lucia.invalidateSession(context.locals.session.id);

    const sessionCookie = lucia.createBlankSessionCookie();
    context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return new Response("OK");
}