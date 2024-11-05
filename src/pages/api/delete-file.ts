import { db } from "@/lib/db";
import type { DatabaseShare, DatabaseUser } from "@/types";
import type { APIContext } from "astro";
import { promises as fs } from 'fs';

// import fs from 'fs/promises';
// import path from 'path';
import * as path from 'path'

interface ErrnoException extends Error {
    errno?: number | undefined;
    code?: string | undefined;
    path?: string | undefined;
    syscall?: string | undefined;
}

export async function POST(context: APIContext): Promise<Response> {

    if (!context.locals.user?.id) {
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



        let shares: DatabaseShare[] | string[] = db.prepare(`SELECT id FROM share WHERE local_path='${path.join(context.locals.user.scope, data.path)}'`).all() as DatabaseShare[]
        shares = shares.map(share => share.id) as string[]

        if (shares) {
            db.exec(`DELETE FROM share WHERE local_path='${path.join(context.locals.user.scope, data.path)}'`)
            const users = db.prepare(`SELECT id, shares FROM user`).all() as DatabaseUser[]

            users.map(user => {
                let userShares = JSON.parse(user.shares) as string[]
                let newUserShares = userShares.filter(share => !shares.includes(share))
                db.exec(`UPDATE user SET shares = '${JSON.stringify(newUserShares)}' WHERE id = '${context.locals.user?.id as string}'`)
            })
        }


        if (data.isDirectory) {
            await fs.rm(path.join(context.locals.user.scope, data.path), { recursive: true })
        } else {
            await fs.rm(path.join(context.locals.user.scope, data.path))
        }

        return new Response(
            JSON.stringify({
                error: "OK"
            }),
            {
                status: 200
            }
        );
    } catch (err) {
        let error = err as ErrnoException
        if (error.code == "ENOTEMPTY") {
            return new Response(
                JSON.stringify({
                    error: "Directory not empty"
                }),
                {
                    status: 500
                }
            );
        } else if (error.code == "EACCES") {
            return new Response(
                JSON.stringify({
                    error: "Permission denied"
                }),
                {
                    status: 500
                }
            );
        } else {
            console.error(err)
            return new Response(
                JSON.stringify({
                    error: "Error deleting file"
                }),
                {
                    status: 500
                }
            );
        }
    }
}