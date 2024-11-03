import type { APIContext } from "astro";

import { db } from "@/lib/db";

import { hash } from "@node-rs/argon2";
import { generateId } from "lucia";
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

    if (context.locals.user?.admin !== true) {
        return new Response(
            JSON.stringify({
                error: "User is not admin"
            }),
            {
                status: 403
            }
        );
    }

    const data = await context.request.json()
    try {

        console.log(data.username)
        console.log(data.admin)
        console.log(data.scope)
        console.log(data.password)

        const username = data.username
        const password = data.password

        if (
            typeof username !== "string" ||
            username.length < 3 ||
            username.length > 31 ||
            !/^[a-z0-9_-]+$/.test(username)
        ) {
            return new Response(
                JSON.stringify({
                    error: "Invalid username"
                }),
                {
                    status: 400
                }
            );
        }
        if (typeof password !== "string" || password.length < 6 || password.length > 255) {
            return new Response(
                JSON.stringify({
                    error: "Invalid password"
                }),
                {
                    status: 400
                }
            );
        }

        const passwordHash = await hash(password, {
            // recommended minimum parameters
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1
        });
        const userId = generateId(16);

        console.log("Inserting into user")
        db.prepare("INSERT INTO user (id, username, password_hash, scope, admin) VALUES(?, ?, ?, ?, ?)").run(
            userId,
            username,
            passwordHash,
            data.scope,
            data.admin == true ? 1 : 0
        );

        return new Response("OK")
    } catch (err) {
        let error = err as SqliteError
        
        if (error.name == "SqliteError") {
            return new Response(
                JSON.stringify({
                    error: error.toString()
                }),
                {
                    status: 500
                }
            );
        }

        return new Response(
            JSON.stringify({
                error: "Unable to create user"
            }),
            {
                status: 500
            }
        );
    }
}