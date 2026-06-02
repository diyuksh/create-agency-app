import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DevTools } from "@/components/dev-tools";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Agency Next.js Template",
	description:
		"High-performance framework for building exceptional digital experiences.",
};

import { Partytown } from '@builder.io/partytown/react';

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-black text-white`}
		>
			<head>
				<Partytown debug={true} forward={['dataLayer.push']} />
			</head>
			<body className="min-h-full flex flex-col">
				{children}
				<DevTools />
			</body>
		</html>
	);
}
