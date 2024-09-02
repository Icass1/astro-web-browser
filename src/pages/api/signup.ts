import { lucia } from "@/auth";
import { generateId } from "lucia";
import { hash } from "@node-rs/argon2";
import { db } from "@/lib/db";
import { SqliteError } from "better-sqlite3";
import type { SignupDB } from '@/types'

import type { APIContext } from "astro";

export async function POST(context: APIContext): Promise<Response> {

	const signup = db.prepare("SELECT signup FROM config WHERE id='1'").get() as SignupDB

	console.log(signup)

	if (signup.signup != 1) {
		// Disable signup feature
		return new Response(
			JSON.stringify({
				error: "Signup disabled"
			}),
			{
				status: 404
			}
		);
	}

	const formData = await context.request.formData();
	const username = formData.get("username");
	// username must be between 4 ~ 31 characters, and only consists of lowercase letters, 0-9, -, and _
	// keep in mind some database (e.g. mysql) are case insensitive
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
	const password = formData.get("password");
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
	const userId = generateId(15);

	try {
		console.log("Inserting into user")
		db.prepare("INSERT INTO user (id, username, password_hash) VALUES(?, ?, ?)").run(
			userId,
			username,
			passwordHash
		);
		console.log("done")

		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

		return new Response();
	} catch (e) {
		if (e instanceof SqliteError && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
			return new Response(
				JSON.stringify({
					error: "Username already used"
				}),
				{
					status: 400
				}
			);
		}
		return new Response(
			JSON.stringify({
				error: "An unknown error occurred"
			}),
			{
				status: 500
			}
		);
	}
}