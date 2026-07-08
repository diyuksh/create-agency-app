import { useEffect, useRef } from "react";

type FrameCallback = (time: number, deltaTime: number) => void;

class Ticker {
	private callbacks = new Set<FrameCallback>();
	private rafId: number | null = null;
	private lastTime: number = 0;

	public add(callback: FrameCallback) {
		this.callbacks.add(callback);
		if (this.callbacks.size === 1) {
			this.start();
		}
	}

	public remove(callback: FrameCallback) {
		this.callbacks.delete(callback);
		if (this.callbacks.size === 0) {
			this.stop();
		}
	}

	private start() {
		this.lastTime = performance.now();
		this.rafId = requestAnimationFrame(this.tick);
	}

	private stop() {
		if (this.rafId !== null) {
			cancelAnimationFrame(this.rafId);
			this.rafId = null;
		}
	}

	private tick = (time: number) => {
		const deltaTime = time - this.lastTime;
		this.lastTime = time;
		
		this.callbacks.forEach((callback) => {
			callback(time, deltaTime);
		});

		this.rafId = requestAnimationFrame(this.tick);
	};
}

const globalTicker = new Ticker();

/**
 * A highly optimized RequestAnimationFrame hook.
 * Avoids React state for performance, passing time directly to the callback.
 */
export function useFrame(callback: FrameCallback, active = true) {
	const callbackRef = useRef(callback);

	// Keep callback fresh without re-triggering the loop
	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		if (!active) return;

		const tick: FrameCallback = (time, deltaTime) => {
			callbackRef.current(time, deltaTime);
		};

		globalTicker.add(tick);

		return () => {
			globalTicker.remove(tick);
		};
	}, [active]);
}
