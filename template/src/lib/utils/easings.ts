/**
 * Custom Easing Functions
 * Tailored for high-end agency animations (monochrome/apple-like aesthetics).
 */

export const easings = {
	// Linear
	linear: (t: number) => t,

	// Smooth Apple-like Expo
	expoOut: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
	expoInOut: (t: number) => {
		if (t === 0) return 0;
		if (t === 1) return 1;
		if ((t /= 0.5) < 1) return 0.5 * Math.pow(2, 10 * (t - 1));
		return 0.5 * (-Math.pow(2, -10 * --t) + 2);
	},

	// Snappy Quintic (Great for dramatic typography reveals)
	quintOut: (t: number) => 1 - Math.pow(1 - t, 5),
	quintInOut: (t: number) =>
		t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,

	// Apple-like Spring (Simulated critical damping for UI elements)
	springOut: (t: number) => {
		const c4 = (2 * Math.PI) / 3;
		return t === 0
			? 0
			: t === 1
				? 1
				: Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
	},
};
