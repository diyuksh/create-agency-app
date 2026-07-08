import { createClient } from "next-sanity";
import { env } from "../../env";

export const sanityClient = createClient({
	projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
	dataset: env.NEXT_PUBLIC_SANITY_DATASET || "",
	apiVersion: "2024-05-01",
	useCdn: env.NODE_ENV === "production",
	perspective: "published",
});

/**
 * Highly optimized Sanity fetch wrapper leveraging Next.js caching.
 */
export async function sanityFetch<QueryResponse>({
	query,
	params = {},
	tags = [],
}: {
	query: string;
	params?: Record<string, unknown>;
	tags?: string[];
}) {
	return sanityClient.fetch<QueryResponse>(query, params, {
		next: {
			tags,
		},
		cache: "force-cache",
	});
}
