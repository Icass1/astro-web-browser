import { lucia } from "@/auth";
import type { APIContext } from "astro";

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

        lucia.invalidateSession(data.session_id)

        return new Response("OK")
    } catch (error) {
        console.log(error)
        return new Response(
            JSON.stringify({
                error: "Error invalidating session"
            }),
            {
                status: 500
            }
        );
    }

}