import { useEffect, useRef } from "react";

type FrameCallback = (time: number, deltaTime: number) => void;

/**
 * A highly optimized RequestAnimationFrame hook.
 * Avoids React state for performance, passing time directly to the callback.
 */
export function useFrame(callback: FrameCallback, active = true) {
	const requestRef = useRef<number | undefined>(undefined);
	const previousTimeRef = useRef<number | undefined>(undefined);
	const callbackRef = useRef(callback);

	// Keep callback fresh without re-triggering the loop
	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		if (!active) return;

		const animate = (time: number) => {
			if (previousTimeRef.current !== undefined) {
				const deltaTime = time - previousTimeRef.current;
				callbackRef.current(time, deltaTime);
			}
			previousTimeRef.current = time;
			requestRef.current = requestAnimationFrame(animate);
		};

		requestRef.current = requestAnimationFrame(animate);

		return () => {
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
			}
			previousTimeRef.current = undefined;
		};
	}, [active]);
}
