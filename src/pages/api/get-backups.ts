import { db } from "@/lib/db";
import type { DatabaseBackup, DatabaseUser } from "@/types";
import type { APIContext } from "astro";
import * as path from 'path'

interface ErrnoException extends Error {
    errno?: number | undefined;
    code?: string | undefined;
    path?: string | undefined;
    syscall?: string | undefined;
}

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
        const actualFilePath = path.join(context.locals.user.scope, data.path)

        let backups = db.prepare(`SELECT * FROM backup WHERE actual_file_path='${actualFilePath}'`).all() as DatabaseBackup[]
        console.log(backups)

        backups = backups.map(backup => {

            if (backup.user == context.locals.user?.id) {
                backup.user = "You"
            } else {
                let userName = (db.prepare(`SELECT username FROM user WHERE id='${backup.user}'`).get() as DatabaseUser).username
                backup.user = userName

            }
            return backup
        })

        return new Response(
            JSON.stringify({
                backups: backups
            }),
            {
                status: 200
            }
        );
    } catch (err) {
        let error = err as ErrnoException
        if (error.code == "SQLITE_ERROR") {

            return new Response(
                JSON.stringify({
                    error: error.toString()
                }),
                {
                    status: 500
                }
            );
        } else if (error.code == "ENOTEMPTY") {
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
                    error: "Error creating backup"
                }),
                {
                    status: 500
                }
            );
        }
    }
}