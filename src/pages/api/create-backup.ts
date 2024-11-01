import { db } from "@/lib/db";
import type { APIContext } from "astro";
import { promises as fs } from 'fs';
import { generateId } from "lucia";

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
        const id = generateId(16)
        const actualFilePath = path.join(context.locals.user.scope, data.path)
        const filePathAtCreation = actualFilePath;
        const description = data.description
        const date = new Date()
        const backupPath = path.join("backups", id)

        fs.copyFile(actualFilePath, backupPath, fs.constants.COPYFILE_EXCL)

        db.prepare("INSERT INTO backup (id, actual_file_path, file_path_at_creation, description, date, backup_path, user) VALUES(?, ?, ?, ?, ?, ?, ?)").run(
            id,
            actualFilePath,
            filePathAtCreation,
            description,
            date.getTime(),
            backupPath,
            context.locals.user.id
        );

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