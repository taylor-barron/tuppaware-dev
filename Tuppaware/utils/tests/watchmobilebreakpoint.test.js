import { describe, expect, it, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useIsBelowBreakPoint from "../watchmobilebreakpoint";

describe("useIsBelowBreakPoint", () => {
  let listenersByQuery;
  let viewportWidth;

  beforeEach(() => {
    listenersByQuery = new Map();
    viewportWidth = 1024;

    // A mock that mirrors the browser contract we care about:
    // - `matches` reflects the current viewportWidth.
    // - `addEventListener("change", fn)` registers fn on this query.
    // - Nothing fires `change` automatically. Tests dispatch `change` or
    //   `resize` explicitly, so each test states its assumptions.
    window.matchMedia = (query) => {
      const maxMatch = /max-width:\s*(\d+)/.exec(query);
      const maxWidth = maxMatch ? Number(maxMatch[1]) : Infinity;
      const mql = {
        media: query,
        get matches() {
          return viewportWidth <= maxWidth;
        },
        addEventListener: (_type, listener) => {
          if (!listenersByQuery.has(query)) listenersByQuery.set(query, new Set());
          listenersByQuery.get(query).add(listener);
        },
        removeEventListener: (_type, listener) => {
          listenersByQuery.get(query)?.delete(listener);
        },
      };
      return mql;
    };
  });

  const fireChange = (query, matches) => {
    listenersByQuery.get(query)?.forEach((listener) => listener({ matches, media: query }));
  };

  it("reacts to matchMedia change events (baseline: Chrome / modern Firefox)", () => {
    const { result } = renderHook(() => useIsBelowBreakPoint(768));
    expect(result.current).toBe(false);

    act(() => {
      viewportWidth = 500;
      fireChange("(max-width: 768px)", true);
    });
    expect(result.current).toBe(true);

    act(() => {
      viewportWidth = 1024;
      fireChange("(max-width: 768px)", false);
    });
    expect(result.current).toBe(false);
  });

  it("reacts to window resize when the browser does not fire matchMedia change (Safari)", () => {
    const { result } = renderHook(() => useIsBelowBreakPoint(768));
    expect(result.current).toBe(false);

    act(() => {
      viewportWidth = 500;
      // Deliberately do NOT fire the matchMedia change event.
      // This is what Safari does on window resize.
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toBe(true);

    act(() => {
      viewportWidth = 1024;
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toBe(false);
  });

  it("does not double-update when both change and resize fire", () => {
    const { result } = renderHook(() => useIsBelowBreakPoint(768));

    act(() => {
      viewportWidth = 500;
      fireChange("(max-width: 768px)", true);
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toBe(true);
  });
});