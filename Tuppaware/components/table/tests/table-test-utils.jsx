import { afterEach, beforeEach, expect } from "vitest";
import { act, render, waitFor } from "@testing-library/react";
import { useState } from "react";
import Table from "../src/table";

export const DESKTOP_WIDTH = 1024;
export const MOBILE_WIDTH = 500;

let viewportWidth = DESKTOP_WIDTH;

const mqlEntries = new Map();

const evaluateQuery = (query, width) => {
  const max = /max-width:\s*(\d+)/.exec(query);
  const min = /min-width:\s*(\d+)/.exec(query);
  return (max ? width <= Number(max[1]) : true) && (min ? width >= Number(min[1]) : true);
};

export const installMatchMedia = () => {
  window.matchMedia = (query) => {
    const mql = {
      media: query,
      get matches() {
        return evaluateQuery(query, viewportWidth);
      },
      addEventListener: (_type, listener) => {
        const entry = mqlEntries.get(mql);
        if (!entry) return;
        entry.listeners.add(listener);
      },
      removeEventListener: (_type, listener) => {
        const entry = mqlEntries.get(mql);
        if (!entry) return;
        entry.listeners.delete(listener);
      },
      // Legacy API kept for compatibility with code paths that use it.
      addListener: (listener) => {
        const entry = mqlEntries.get(mql);
        if (!entry) return;
        entry.listeners.add(listener);
      },
      removeListener: (listener) => {
        const entry = mqlEntries.get(mql);
        if (!entry) return;
        entry.listeners.delete(listener);
      },
    };
    mqlEntries.set(mql, { query, listeners: new Set() });
    return mql;
  };
};

/**
 * Change the simulated viewport width and dispatch `change` events only to the
 * MediaQueryLists whose `matches` value transitioned as a result. This is the
 * behavior the real browser exhibits, and it's what makes the breakpoint test
 * meaningful: a component that ignores `event.matches`, or forgets to register
 * a listener, or forgets to remove it, will visibly fail.
 */
export const setViewportWidth = (width) => {
  const previousWidth = viewportWidth;
  viewportWidth = width;
  window.innerWidth = width;

  // Collect the mqls whose matches value flipped, and dispatch to each.
  const transitions = [];
  mqlEntries.forEach((entry, mql) => {
    const before = evaluateQuery(entry.query, previousWidth);
    const after = evaluateQuery(entry.query, width);
    if (before !== after) {
      transitions.push({ mql, entry, matches: after });
    }
  });

  if (transitions.length === 0) return;

  act(() => {
    transitions.forEach(({ entry, matches }) => {
      entry.listeners.forEach((listener) => {
        listener({ matches, media: entry.query });
      });
    });
  });
};

const resetMatchMedia = () => {
  mqlEntries.clear();
  viewportWidth = DESKTOP_WIDTH;
  window.innerWidth = DESKTOP_WIDTH;
  installMatchMedia();
};

export const useTableTestEnvironment = () => {
  beforeEach(() => {
    resetMatchMedia();
  });
  afterEach(() => {
    resetMatchMedia();
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  });
};

export const renderMobile = async (ui, selector = "table") => {
  setViewportWidth(MOBILE_WIDTH);
  const result = render(ui);
  await waitFor(() => expect(result.container.querySelector(selector)).toBeInTheDocument());
  return result;
};

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
export const baseColumns = () => [
  { name: "Name", mapto: "name" },
  { name: "Age", mapto: "age" },
];

export const baseRows = () => [{ data: { name: "Taylor", age: "32" } }];

export const threeColumns = () => [
  { name: "Name", mapto: "name" },
  { name: "Age", mapto: "age" },
  { name: "Location", mapto: "location" },
];

export const threeRows = () => [
  { data: { name: "Charlie", age: 35, location: "NYC" } },
  { data: { name: "Alice", age: 25, location: "LA" } },
  { data: { name: "Bob", age: 30, location: "SF" } },
];

export const twoColumns = () => [
  { name: "Name", mapto: "name" },
  { name: "Age", mapto: "age" },
];

export const twoRows = () => [
  { data: { name: "Charlie", age: 35 } },
  { data: { name: "Alice", age: 25 } },
  { data: { name: "Bob", age: 30 } },
];

export const stableActionColumn = { name: "Actions" };

// ---------------------------------------------------------------------------
// Harnesses
// ---------------------------------------------------------------------------
export const MobileHarness = ({ onColumnsSet, initialColumns, ...props }) => {
  const [columns, setColumns] = useState(initialColumns ?? threeColumns());
  return (
    <Table
      columns={columns}
      setColumns={(next) => {
        onColumnsSet?.(next);
        setColumns(next);
      }}
      rowData={threeRows()}
      {...props}
    />
  );
};

export const DefaultSortHarness = () => {
  const [columns, setColumns] = useState(twoColumns());
  const [rows, setRows] = useState(twoRows());
  return (
    <Table
      columns={columns}
      setColumns={setColumns}
      rowData={rows}
      setRows={setRows}
      useActionsColumn={false}
    />
  );
};