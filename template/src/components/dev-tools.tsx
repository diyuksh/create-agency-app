"use client";

import { useState } from "react";
import { useShortcut } from "@/hooks/use-shortcut";

/**
 * Custom Agency Dev Tools
 * Toggles a visual CSS grid (Shift+G) and structural outlines (Shift+O)
 * in development mode ONLY.
 */
export function DevTools() {
	const [gridVisible, setGridVisible] = useState(false);
	const [outlinesVisible, setOutlinesVisible] = useState(false);

	useShortcut("shift+g", () => setGridVisible((v) => !v));
	useShortcut("shift+o", () => setOutlinesVisible((v) => !v));

	if (process.env.NODE_ENV !== "development") {
		return null;
	}

	return (
		<>
			{gridVisible && (
				<div className="pointer-events-none fixed inset-0 z-[9999] flex w-full justify-center px-4 md:px-8">
					<div className="grid h-full w-full max-w-7xl grid-cols-4 gap-4 md:grid-cols-12 md:gap-6">
						{Array.from({ length: 12 }).map((_, i) => (
							<div
								key={i}
								className="h-full w-full bg-red-500/10 hidden md:block"
							/>
						))}
						{/* Mobile visible grid columns */}
						{Array.from({ length: 4 }).map((_, i) => (
							<div
								key={`mob-${i}`}
								className="h-full w-full bg-red-500/10 md:hidden"
							/>
						))}
					</div>
				</div>
			)}

			{outlinesVisible && (
				<style
					dangerouslySetInnerHTML={{
						__html: `
            * { outline: 1px solid rgba(255, 0, 0, 0.2) !important; }
          `,
					}}
				/>
			)}
		</>
	);
}
