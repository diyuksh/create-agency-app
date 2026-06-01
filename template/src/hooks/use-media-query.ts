import { useState } from "react";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

/**
 * Evaluates a CSS media query and returns a boolean indicating if it matches.
 */
export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(false);

	useIsomorphicLayoutEffect(() => {
		const media = window.matchMedia(query);

		// Set initial value
		if (media.matches !== matches) {
			setMatches(media.matches);
		}

		const listener = () => setMatches(media.matches);

		if (typeof media.addEventListener === "function") {
			media.addEventListener("change", listener);
			return () => media.removeEventListener("change", listener);
		} else {
			// Deprecated fallback for older browsers
			media.addListener(listener);
			return () => media.removeListener(listener);
		}
	}, [matches, query]);

	return matches;
}
