import { useEffect, useLayoutEffect } from "react";

/**
 * Custom hook that safely uses useLayoutEffect on the client and useEffect on the server.
 * This prevents React hydration warnings when doing DOM measurements or mutations.
 */
export const useIsomorphicLayoutEffect =
	typeof window !== "undefined" ? useLayoutEffect : useEffect;
