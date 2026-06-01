import { useEffect } from "react";

/**
 * A lightweight hook to listen for keyboard shortcuts (e.g., 'Shift+G').
 */
export function useShortcut(keyCombo: string, callback: () => void) {
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const keys = keyCombo.toLowerCase().split("+");
			const requiresShift = keys.includes("shift");
			const requiresCtrl = keys.includes("ctrl") || keys.includes("cmd");
			const targetKey = keys[keys.length - 1];

			if (
				e.key.toLowerCase() === targetKey &&
				e.shiftKey === requiresShift &&
				(e.ctrlKey || e.metaKey) === requiresCtrl
			) {
				callback();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [keyCombo, callback]);
}
