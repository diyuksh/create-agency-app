import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { DevTools } from "@/components/dev-tools";

import { PostHogProvider } from "@/providers/posthog-provider";
import { ShopifyAnalytics } from "@/providers/shopify-analytics";

export const metadata: Metadata = {
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
	),
	title: "Agency Next.js Template",
	description:
		"High-performance framework for building exceptional digital experiences.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className="h-full antialiased bg-black text-white font-sans"
		>
			<body className="min-h-full flex flex-col">
				<PostHogProvider>
					<ShopifyAnalytics />
				{children}
				<GoogleAnalytics gaId="G-XYZ" />
				<DevTools />
				<Analytics />
				<SpeedInsights />
				</PostHogProvider>
			</body>
		</html>
	);
}
