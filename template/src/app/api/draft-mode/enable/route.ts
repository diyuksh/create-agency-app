import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const secret = searchParams.get("secret");
	const slug = searchParams.get("slug");

	// Verify the secret to ensure the request is valid
	if (secret !== process.env.DRAFT_MODE_SECRET) {
		return new Response("Invalid token", { status: 401 });
	}

	if (!slug) {
		return new Response("Missing slug", { status: 400 });
	}

	// Enable Draft Mode by setting the cookie
	const draft = await draftMode();
	draft.enable();

	// Redirect to the path from the fetched post
	redirect(slug);
}
