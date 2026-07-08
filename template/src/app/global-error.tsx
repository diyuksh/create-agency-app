"use client";

import { useEffect } from "react";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<html lang="en">
			<body className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
				<h2 className="text-2xl font-bold mb-4">
					Something went wrong fatally!
				</h2>
				<p className="text-gray-400 mb-6">
					{error.message || "An unexpected error occurred."}
				</p>
				<button
					type="button"
					onClick={() => reset()}
					className="px-4 py-2 font-medium text-black bg-white rounded-md hover:bg-gray-200 transition-colors"
				>
					Try again
				</button>
			</body>
		</html>
	);
}
