import type { SqliteError } from "better-sqlite3";
import { db } from "@/lib/db";

import type { APIContext } from "astro";

export async function POST(context: APIContext): Promise<Response> {
	const formData = await context.request.formData();

	console.log(context.locals.user)

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

	for (let k of formData.entries()) {
		const [table, id, column] = k[0].split("|")

		if (id && column) {
			try {
				db.exec(`UPDATE ${table} SET ${column} = '${k[1]}' WHERE id = '${id}'`)
			} catch (err) {
				const error = err as SqliteError
				return new Response(
					JSON.stringify({
						error: error.toString()
					}),
					{
						status: 500
					}
				);
			}
		} else if (id == "collabora_url") {
			db.exec(`UPDATE config SET collabora_url = '${k[1]}' WHERE id = '1'`)
		} else if (id == "enable_signup") {
			db.exec(`UPDATE config SET signup = ${k[1] == 'on' ? '1' : '0'} WHERE id = '1'`)
		} else {
			console.warn("Unknow id config", id)
		}
	}
	return new Response();
}