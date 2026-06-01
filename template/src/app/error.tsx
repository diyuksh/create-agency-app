"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error(error);
	}, [error]);

	return (
		<div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
			<h2 className="text-2xl font-bold tracking-tight text-gray-900">
				Something went wrong!
			</h2>
			<p className="text-gray-500">
				{error.message || "An unexpected error occurred."}
			</p>
			<button
				onClick={() => reset()}
				className="px-4 py-2 font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors"
			>
				Try again
			</button>
		</div>
	);
}
