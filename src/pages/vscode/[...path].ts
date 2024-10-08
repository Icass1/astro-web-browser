
import type { SqliteError } from "better-sqlite3";
import { db } from "@/lib/db";

import type { APIContext } from "astro";

// https://github.com/gitpod-io/openvscode-server/issues/320

export async function POST(context: APIContext): Promise<Response> {

    console.log(context)

	return new Response("POST");
}

export async function GET(context: APIContext): Promise<Response> {

    console.log(context)

    const response = fetch("http://127.0.0.1:8080/?folder=/home/icass/HomeDrive/root")

	return response
}