const domain = process.env.SHOPIFY_STORE_DOMAIN
	? `https://${process.env.SHOPIFY_STORE_DOMAIN}`
	: "";
const endpoint = `${domain}/api/2024-01/graphql.json`;
const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

type FetchParams = {
	cache?: RequestCache;
	headers?: HeadersInit;
	query: string;
	tags?: string[];
	variables?: Record<string, unknown>;
};

export interface ShopifyResponse<T> {
	data: T;
	status: number;
}

export class ShopifyAPIError extends Error {
	constructor(
		message: string,
		public cause?: unknown,
	) {
		super(message);
		this.name = "ShopifyAPIError";
	}
}

/**
 * Highly optimized fetch wrapper for Shopify Storefront API
 * designed specifically for React Server Components and Next.js caching.
 */
export async function shopifyFetch<T>({
	cache = "force-cache",
	headers,
	query,
	tags,
	variables,
}: FetchParams): Promise<ShopifyResponse<T>> {
	if (!domain || !key) {
		throw new Error(
			"Missing Shopify credentials. Please set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN.",
		);
	}

	try {
		const result = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Shopify-Storefront-Access-Token": key,
				...headers,
			},
			body: JSON.stringify({
				...(query && { query }),
				...(variables && { variables }),
			}),
			cache,
			...(tags && { next: { tags } }),
		});

		const body = await result.json();

		if (body.errors) {
			throw body.errors[0];
		}

		return {
			status: result.status,
			data: body.data,
		};
	} catch (error) {
		if (error instanceof Error) {
			console.error("[Shopify Client Error]", error.message);
			throw new ShopifyAPIError(error.message, error);
		}
		console.error("[Shopify Client Error]", error);
		throw new ShopifyAPIError(
			"An unexpected error occurred while fetching from Shopify.",
			error,
		);
	}
}
