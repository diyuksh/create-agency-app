import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
			<h2 className="text-3xl font-bold tracking-tight text-gray-900">
				404 - Not Found
			</h2>
			<p className="text-gray-500">Could not find requested resource</p>
			<Link
				href="/"
				className="px-4 py-2 font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors"
			>
				Return Home
			</Link>
		</div>
	);
}
