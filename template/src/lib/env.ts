import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
		SANITY_API_READ_TOKEN: z.string().min(1).optional(),
		SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string().min(1).optional(),
		SHOPIFY_STORE_DOMAIN: z.string().url().optional(),
		KLAVIYO_API_KEY: z.string().min(1).optional(),
	},
	client: {
		NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1).optional(),
		NEXT_PUBLIC_SANITY_DATASET: z.string().default("production"),
		NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
	},
	experimental__runtimeEnv: {
		NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
		NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
		NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
	},
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
