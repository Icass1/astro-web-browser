import { lucia } from "@/auth";

import type { APIContext } from "astro";
import type { SqliteError } from "better-sqlite3";

export async function ALL(context: APIContext): Promise<Response> {
    if (!context.locals.session) {
        return new Response("error", {
            status: 401
        });
    }

    try {

        await lucia.invalidateSession(context.locals.session.id);

        const sessionCookie = lucia.createBlankSessionCookie();
        context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

        return new Response("OK");
    } catch (err) {
        const error = err as SqliteError

        error.toString()

        return new Response(
            JSON.stringify({
                error: "Error logging out. " + error.toString()
            }),
            {
                status: 500
            }
        );
    }
}