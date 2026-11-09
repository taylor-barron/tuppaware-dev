"use client";

import { useEffect, useState } from "react";

export default function useIsBelowBreakPoint(breakPoint) {
  const getMatches = () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(max-width: ${breakPoint}px)`).matches;
  };

  const [isBelowBreakPoint, setIsBelowBreakPoint] = useState(getMatches);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(`(max-width: ${breakPoint}px)`);

    // When the `change` event fires, its `matches` value is authoritative.
    const handleChange = (event) => {
      setIsBelowBreakPoint(event.matches);
    };

    // Safari (and some other browsers/configurations) do not reliably fire
    // `change` on window resize. Re-read `mediaQuery.matches` on `resize`
    // so the state tracks the actual viewport regardless of which event
    // the browser decides to deliver. `mediaQuery.matches` is a live getter,
    // so reading it here reflects the current width.
    const handleResize = () => {
      setIsBelowBreakPoint(mediaQuery.matches);
    };

    setIsBelowBreakPoint(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    window.addEventListener("resize", handleResize);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      window.removeEventListener("resize", handleResize);
    };
  }, [breakPoint]);

  return isBelowBreakPoint;
}