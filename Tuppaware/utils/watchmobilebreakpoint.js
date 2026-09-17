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

    const handleChange = (event) => {
      setIsBelowBreakPoint(event.matches);
    };

    setIsBelowBreakPoint(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [breakPoint]);

  return isBelowBreakPoint;
}