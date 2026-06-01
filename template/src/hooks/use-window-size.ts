import { useState } from "react";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

/**
 * Tracks the dimensions of the browser window.
 */
export function useWindowSize() {
	const [windowSize, setWindowSize] = useState({
		width: 0,
		height: 0,
	});

	useIsomorphicLayoutEffect(() => {
		function handleResize() {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		}

		window.addEventListener("resize", handleResize);
		handleResize();

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return windowSize;
}
