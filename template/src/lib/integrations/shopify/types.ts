export type Maybe<T> = T | null;

export type Connection<T> = {
	edges: Array<Edge<T>>;
};

export type Edge<T> = {
	node: T;
};

export type Image = {
	url: string;
	altText: string;
	width: number;
	height: number;
};

export type Money = {
	amount: string;
	currencyCode: string;
};

export type SEO = {
	title: string;
	description: string;
};

export type ProductOption = {
	id: string;
	name: string;
	values: string[];
};

export type ProductVariant = {
	id: string;
	title: string;
	availableForSale: boolean;
	selectedOptions: {
		name: string;
		value: string;
	}[];
	price: Money;
	compareAtPrice?: Money;
};

export type Product = {
	id: string;
	handle: string;
	title: string;
	description: string;
	descriptionHtml: string;
	availableForSale: boolean;
	options: ProductOption[];
	variants: Connection<ProductVariant>;
	featuredImage?: Image;
	images: Connection<Image>;
	seo: SEO;
	tags: string[];
	updatedAt: string;
	priceRange: {
		minVariantPrice: Money;
		maxVariantPrice: Money;
	};
};

export type Collection = {
	id: string;
	handle: string;
	title: string;
	description: string;
	seo: SEO;
	updatedAt: string;
	products: Connection<Product>;
};

export type CartLine = {
	id: string;
	quantity: number;
	cost: {
		totalAmount: Money;
	};
	merchandise: {
		id: string;
		title: string;
		selectedOptions: {
			name: string;
			value: string;
		}[];
		product: {
			id: string;
			handle: string;
			title: string;
			featuredImage: Image;
		};
	};
};

export type Cart = {
	id: string;
	checkoutUrl: string;
	cost: {
		subtotalAmount: Money;
		totalAmount: Money;
		totalTaxAmount: Money;
	};
	lines: Connection<CartLine>;
	totalQuantity: number;
};

export type ShopifyError = {
	message: string;
	extensions?: {
		code?: string;
	};
};
