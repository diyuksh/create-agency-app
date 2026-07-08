import { useEffect } from "react";

let scrollLockCount = 0;

export const usePreventScroll = (active = false) => {
	useEffect(() => {
		if (!active) return;
		
		scrollLockCount++;
		if (scrollLockCount === 1) {
			document.documentElement.classList.add("no-scroll");
		}
		
		return () => {
			scrollLockCount--;
			if (scrollLockCount === 0) {
				document.documentElement.classList.remove("no-scroll");
			}
		};
	}, [active]);
};
