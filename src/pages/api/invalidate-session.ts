import { lucia } from "@/auth";
import type { APIContext } from "astro";
import type { SqliteError } from "better-sqlite3";

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
    try {
        await lucia.invalidateSession(data.session_id)

        return new Response("OK")
    } catch (err) {
        const error = err as SqliteError

        return new Response(
            JSON.stringify({
                error: "Error invalidating session. " + error.toString()
            }),
            {
                status: 500
            }
        );
    }

}