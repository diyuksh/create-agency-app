export async function basehubFetch<T>({
	query,
	variables = {},
	tags = [],
}: {
	query: string;
	variables?: Record<string, unknown>;
	tags?: string[];
}): Promise<T> {
	const token = process.env.BASEHUB_TOKEN || "";
	const url = process.env.BASEHUB_URL || "https://api.basehub.com/graphql";

	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-basehub-token": token,
		},
		body: JSON.stringify({ query, variables }),
		next: { tags },
		cache: "force-cache",
	});

	const json = await response.json();

	if (json.errors) {
		throw new Error(`Failed to fetch from BaseHub: ${JSON.stringify(json.errors)}`);
	}

	return json.data;
}
