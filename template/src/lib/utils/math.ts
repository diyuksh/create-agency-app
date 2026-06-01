/**
 * High-performance math utilities for animations, scroll effects, and webgl.
 * Customized for Next.js Server/Client environments.
 */

/**
 * Constrains a value between a minimum and maximum bound.
 */
export const clamp = (min: number, val: number, max: number): number => {
	return Math.max(min, Math.min(val, max));
};

/**
 * Linear interpolation between a start and end value.
 */
export const lerp = (start: number, end: number, amt: number): number => {
	return (1 - amt) * start + amt * end;
};

/**
 * Frame-rate independent damped interpolation.
 * Perfect for smoothing out cursor movements or scroll values across different refresh rates.
 */
export const damp = (
	current: number,
	target: number,
	smoothing: number,
	deltaTime: number,
): number => {
	return lerp(current, target, 1 - Math.exp(-smoothing * deltaTime));
};

/**
 * Maps a value from one range to another.
 * @param clampResult - If true, the output is clamped to the output range.
 */
export const mapRange = (
	inMin: number,
	inMax: number,
	input: number,
	outMin: number,
	outMax: number,
	clampResult = false,
): number => {
	const mapped =
		((input - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
	if (clampResult) {
		const min = Math.min(outMin, outMax);
		const max = Math.max(outMin, outMax);
		return clamp(min, mapped, max);
	}
	return mapped;
};

/**
 * Truncates a float to a specific number of decimal places (faster than toFixed).
 */
export const roundTo = (val: number, decimals: number = 2): number => {
	const p = Math.pow(10, decimals);
	return Math.round(val * p) / p;
};
