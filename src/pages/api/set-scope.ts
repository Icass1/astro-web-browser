import { db } from "../../lib/db";

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
        console.log(`UPDATE user SET scope = '${data.scope}' WHERE id = '${context.locals.user.id}'`)
        db.exec(`UPDATE user SET scope = '${data.scope}' WHERE id = '${context.locals.user.id}'`)
        return new Response(
            JSON.stringify({
                error: "OK"
            }),
            {
                status: 200
            }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({
                error: "Error executing query"
            }),
            {
                status: 500
            }
        )
    }
}