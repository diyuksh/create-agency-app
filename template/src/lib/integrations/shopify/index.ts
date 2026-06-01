import { shopifyFetch } from "./client";
import {
	getProductQuery,
	getProductsQuery,
	getCartQuery,
	createCartMutation,
	addToCartMutation,
	removeFromCartMutation,
	updateCartMutation,
} from "./queries";
import type { Product, Connection, Cart } from "./types";

const TAGS = {
	cart: "cart",
	products: "products",
	collections: "collections",
};

/**
 * Retrieves a single product by its handle.
 */
export async function getProduct(handle: string): Promise<Product | undefined> {
	const res = await shopifyFetch<{ product: Product }>({
		query: getProductQuery,
		tags: [TAGS.products, handle],
		variables: { handle },
	});

	return res.data?.product;
}

/**
 * Retrieves a list of products, optionally filtered and sorted.
 */
export async function getProducts(
	query?: string,
	reverse?: boolean,
): Promise<Product[]> {
	const res = await shopifyFetch<{ products: Connection<Product> }>({
		query: getProductsQuery,
		tags: [TAGS.products],
		variables: {
			query,
			reverse,
		},
	});

	return res.data?.products?.edges.map((edge) => edge.node) || [];
}

/**
 * Retrieves a cart by its ID. Always fetches fresh data (no cache).
 */
export async function getCart(cartId: string): Promise<Cart | undefined> {
	const res = await shopifyFetch<{ cart: Cart }>({
		query: getCartQuery,
		variables: { cartId },
		tags: [TAGS.cart],
		cache: "no-store",
	});

	return res.data?.cart;
}

/**
 * Creates a new cart with the provided line items.
 */
export async function createCart(
	lines: { merchandiseId: string; quantity: number }[],
): Promise<Cart | undefined> {
	const res = await shopifyFetch<{ cartCreate: { cart: Cart } }>({
		query: createCartMutation,
		variables: { lineItems: lines },
		cache: "no-store",
	});

	return res.data?.cartCreate?.cart;
}

/**
 * Adds line items to an existing cart.
 */
export async function addToCart(
	cartId: string,
	lines: { merchandiseId: string; quantity: number }[],
): Promise<Cart | undefined> {
	const res = await shopifyFetch<{ cartLinesAdd: { cart: Cart } }>({
		query: addToCartMutation,
		variables: { cartId, lines },
		cache: "no-store",
	});

	return res.data?.cartLinesAdd?.cart;
}

/**
 * Removes line items from an existing cart by line ID.
 */
export async function removeFromCart(
	cartId: string,
	lineIds: string[],
): Promise<Cart | undefined> {
	const res = await shopifyFetch<{ cartLinesRemove: { cart: Cart } }>({
		query: removeFromCartMutation,
		variables: { cartId, lineIds },
		cache: "no-store",
	});

	return res.data?.cartLinesRemove?.cart;
}

/**
 * Updates the quantity of existing line items in a cart.
 */
export async function updateCart(
	cartId: string,
	lines: { id: string; merchandiseId: string; quantity: number }[],
): Promise<Cart | undefined> {
	const res = await shopifyFetch<{ cartLinesUpdate: { cart: Cart } }>({
		query: updateCartMutation,
		variables: { cartId, lines },
		cache: "no-store",
	});

	return res.data?.cartLinesUpdate?.cart;
}

export * from "./types";
export * from "./client";
export * from "./queries";
