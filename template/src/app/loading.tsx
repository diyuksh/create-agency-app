export default function Loading() {
	return (
		<div className="flex items-center justify-center min-h-[50vh]">
			<div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
			<span className="sr-only">Loading...</span>
		</div>
	);
}
