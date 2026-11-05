import { afterEach, beforeEach, expect } from "vitest";
import { act, render, waitFor } from "@testing-library/react";
import { useState } from "react";
import Table from "../table";

// ---------------------------------------------------------------------------
// Breakpoint / matchMedia mock
// ---------------------------------------------------------------------------
export const DESKTOP_WIDTH = 1024;
export const MOBILE_WIDTH = 500;

let viewportWidth = DESKTOP_WIDTH;
const mediaListeners = new Set();

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
      addEventListener: (_type, listener) => mediaListeners.add({ query, listener, mql }),
      removeEventListener: (_type, listener) => {
        mediaListeners.forEach((entry) => {
          if (entry.listener === listener) mediaListeners.delete(entry);
        });
      },
      addListener: () => {},
      removeListener: () => {},
    };
    return mql;
  };
};

export const setViewportWidth = (width) => {
  viewportWidth = width;
  window.innerWidth = width;
  act(() => {
    mediaListeners.forEach(({ query, listener }) => {
      listener({ matches: evaluateQuery(query, width), media: query });
    });
  });
};

// Call in each test file's beforeEach/afterEach (or import this hook):
export const useTableTestEnvironment = () => {
  beforeEach(() => {
    installMatchMedia();
    viewportWidth = DESKTOP_WIDTH;
    window.innerWidth = DESKTOP_WIDTH;
  });
  afterEach(() => {
    mediaListeners.clear();
    viewportWidth = DESKTOP_WIDTH;
    window.innerWidth = DESKTOP_WIDTH;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  });
};

export const renderMobile = async (ui, selector = ".fa-bars") => {
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