import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  ACTION_COLUMN_MAPTO,
  SORT_ASC,
  SORT_DESC,
  SORT_NONE,
  computeInitiallyShowActionColumn,
  ensureRowsHaveOrder,
  getActionCellStyle,
  getBodyCellStyle,
  getHeaderBackgroundColor,
  getHeaderStyle,
  getMeasuredWidth,
  handleResizeEvent,
  handleRowClick,
  numberRows,
  renderCellValue,
  selectColumns,
  sortRows,
  updateColumns,
  useEmitColumnChanges,
} from "../table-service";

// ---------------------------------------------------------------------------
// Local fixtures — do NOT import from table-test-utils so this file stays
// dependency-free (apart from renderHook for the one hook test) and can run
// in isolation.
// ---------------------------------------------------------------------------
const threeColumns = () => [
  { name: "Name", mapto: "name" },
  { name: "Age", mapto: "age" },
  { name: "Location", mapto: "location" },
];

const twoColumns = () => [
  { name: "Name", mapto: "name" },
  { name: "Age", mapto: "age" },
];

const people = () => [
  { data: { name: "Charlie", age: 35 } },
  { data: { name: "Alice", age: 25 } },
  { data: { name: "Bob", age: 30 } },
];

describe("table-service.js", () => {
  describe("constants", () => {
    it("exposes the expected values", () => {
      expect(SORT_ASC).toBe("asc");
      expect(SORT_DESC).toBe("desc");
      expect(SORT_NONE).toBe("none");
      expect(ACTION_COLUMN_MAPTO).toBe("actionColumn");
    });
  });

  describe("useEmitColumnChanges", () => {
    const setup = (overrides = {}) => {
      const onColumnsChange = vi.fn();
      const columns = [
        { name: "Name", mapto: "name" },
        { name: "Age", mapto: "age" },
      ];
      const args = {
        columns,
        actionColumn: { name: "Actions" },
        useActionsColumn: false,
        ref: { current: "" },
        ...overrides,
      };
      const { result } = renderHook(() =>
        useEmitColumnChanges(args.columns, args.actionColumn, args.useActionsColumn, onColumnsChange, args.ref)
      );
      return { emit: result.current, onColumnsChange };
    };

    it("maps widths onto each column's length", () => {
      const { emit, onColumnsChange } = setup();
      emit([200, 300]);
      expect(onColumnsChange.mock.calls[0][0].columns.map((c) => c.length)).toEqual([200, 300]);
    });

    it("leaves a column unchanged when its width is invalid", () => {
      const { emit, onColumnsChange } = setup();
      emit([0, NaN]);
      const { columns } = onColumnsChange.mock.calls[0][0];
      expect(columns[0].length).toBeUndefined();
      expect(columns[1].length).toBeUndefined();
    });

    it("sets the action column length only when useActionsColumn is true", () => {
      const withAction = setup({ useActionsColumn: true });
      withAction.emit([200, 300, 150]);
      expect(withAction.onColumnsChange.mock.calls[0][0].actionColumn.length).toBe(150);

      const withoutAction = setup({ useActionsColumn: false });
      withoutAction.emit([200, 300, 150]);
      expect(withoutAction.onColumnsChange.mock.calls[0][0].actionColumn.length).toBeUndefined();
    });

    it("dedupes identical signatures and re-emits on change", () => {
      const { emit, onColumnsChange } = setup();
      emit([200, 300]);
      emit([200, 300]);
      emit([210, 290]);
      expect(onColumnsChange).toHaveBeenCalledTimes(2);
    });
  });

  describe("getMeasuredWidth", () => {
    it("returns offsetWidth when positive", () => {
      expect(getMeasuredWidth(0, { current: [{ offsetWidth: 123 }] }, false, 2, 140)).toBe(123);
    });
    it("returns actionColWidth for the action column when unmeasured", () => {
      expect(getMeasuredWidth(2, { current: [{}, {}, {}] }, true, 3, 140)).toBe(140);
    });
    it("falls back to 160 (or custom fallback)", () => {
      expect(getMeasuredWidth(0, { current: [{}] }, false, 2, 140)).toBe(160);
      expect(getMeasuredWidth(0, { current: [{}] }, false, 2, 140, 100)).toBe(100);
    });
  });

  describe("handleResizeEvent", () => {
    const run = ({ widths, index, delta, min = 80, cascade = false }) => {
      const resizeStateRef = { current: { index, startX: 100, startWidths: widths } };
      const latestWidthsRef = { current: widths };
      const setColumnWidths = vi.fn();
      handleResizeEvent({ clientX: 100 + delta }, resizeStateRef, min, latestWidthsRef, setColumnWidths, cascade);
      return { next: latestWidthsRef.current, setColumnWidths };
    };

    it("does nothing without resize state", () => {
      const setColumnWidths = vi.fn();
      handleResizeEvent({ clientX: 10 }, { current: null }, 80, { current: [] }, setColumnWidths, false);
      expect(setColumnWidths).not.toHaveBeenCalled();
    });

    it("non-cascade: grows dragged and shrinks neighbor equally", () => {
      const { next, setColumnWidths } = run({ widths: [160, 160, 160], index: 0, delta: 40 });
      expect(next).toEqual([200, 120, 160]);
      expect(setColumnWidths).toHaveBeenCalledWith(next);
    });

    it("non-cascade: clamps to minColWidth both directions", () => {
      expect(run({ widths: [160, 160, 160], index: 0, delta: 500 }).next).toEqual([240, 80, 160]);
      expect(run({ widths: [160, 160, 160], index: 0, delta: -500 }).next).toEqual([80, 240, 160]);
    });

    it("cascade right: takes nearest first, then outward", () => {
      const { next } = run({ widths: [160, 160, 160], index: 0, delta: 100, min: 100, cascade: true });
      expect(next).toEqual([260, 100, 120]);
    });

    it("cascade right: stops when all right cols at min", () => {
      const { next } = run({ widths: [160, 160, 160], index: 0, delta: 1000, min: 100, cascade: true });
      expect(next).toEqual([280, 100, 100]);
    });

    it("cascade left: shrinks dragged first, then outward left", () => {
      const { next } = run({ widths: [160, 160, 160], index: 1, delta: -100, min: 100, cascade: true });
      expect(next).toEqual([120, 100, 260]);
    });

    it("recomputes from start widths on reversal", () => {
      const widths = [160, 160, 160];
      const resizeStateRef = { current: { index: 0, startX: 100, startWidths: widths } };
      const latestWidthsRef = { current: widths };
      const set = vi.fn();
      handleResizeEvent({ clientX: 160 }, resizeStateRef, 80, latestWidthsRef, set, true);
      handleResizeEvent({ clientX: 100 }, resizeStateRef, 80, latestWidthsRef, set, true);
      expect(latestWidthsRef.current).toEqual([160, 160, 160]);
    });
  });

  describe("renderCellValue / handleRowClick / style getters", () => {
    it("renderCellValue handles null, objects, primitives", () => {
      expect(renderCellValue(null)).toBe("");
      expect(renderCellValue(undefined)).toBe("");
      expect(renderCellValue({ a: 1 })).toBe(JSON.stringify({ a: 1 }));
      expect(renderCellValue("text")).toBe("text");
      expect(renderCellValue(5)).toBe(5);
    });

    it("handleRowClick only selects when writeable and showSelected", () => {
      const select = vi.fn();
      const click = vi.fn();
      handleRowClick({ id: 1 }, 2, true, true, select, click);
      expect(select).toHaveBeenCalledWith(2);
      expect(click).toHaveBeenCalledWith({ id: 1 }, 2);

      const select2 = vi.fn();
      handleRowClick({ id: 1 }, 2, false, true, select2, click);
      handleRowClick({ id: 1 }, 2, true, false, select2, click);
      expect(select2).not.toHaveBeenCalled();
    });

    it("handleRowClick tolerates a non-function onRowClick", () => {
      expect(() => handleRowClick({}, 0, true, true, vi.fn(), undefined)).not.toThrow();
    });

    it("getHeaderStyle / getBodyCellStyle / getActionCellStyle", () => {
      const header = getHeaderStyle(1, { padding: "4px" }, [100, 200, 50], 3);
      expect(header.padding).toBe("4px");
      expect(header.width).toBe("200px");
      expect(header.borderRight).toBe("1px solid #ddd");
      expect(getHeaderStyle(2, {}, [100, 200, 50], 3).borderRight).toBeUndefined();
      expect(getHeaderStyle(5, {}, [100], 3).width).toBeUndefined();

      expect(getBodyCellStyle(0, [120, 80], 2).width).toBe("120px");

      const action = getActionCellStyle(1, [120, 80], 2);
      expect(action.overflow).toBe("visible");
      expect(action.position).toBe("relative");
    });
  });

  describe("ensureRowsHaveOrder", () => {
    it("returns [] for non-arrays", () => {
      expect(ensureRowsHaveOrder(null, "order")).toEqual([]);
    });
    it("adds order by index, keeps existing", () => {
      const result = ensureRowsHaveOrder([{ data: {} }, { data: {}, order: 99 }], "order");
      expect(result[0].order).toBe(0);
      expect(result[1].order).toBe(99);
    });
    it("supports a custom key and does not mutate", () => {
      const input = [Object.freeze({ data: {} })];
      const result = ensureRowsHaveOrder(input, "position");
      expect(result[0].position).toBe(0);
      expect("position" in input[0]).toBe(false);
    });
    it("wraps primitive/array rows", () => {
      const result = ensureRowsHaveOrder(["a", 1], "order");
      expect(result[0]).toEqual({ data: ["a"], order: 0 });
      expect(result[1]).toEqual({ data: [1], order: 1 });
    });
  });

  describe("updateColumns", () => {
    const cols = () => [{ name: "Name" }, { name: "Age" }, { name: "Location" }];

    it("first click on unsorted -> ASC", () => {
      expect(updateColumns(cols(), 1)[1].sort).toBe(SORT_ASC);
    });
    it("clears every other column to NONE", () => {
      const result = updateColumns(cols(), 1);
      expect(result.map((c) => c.sort)).toEqual([SORT_NONE, SORT_ASC, SORT_NONE]);
    });
    it("cycles NONE -> ASC -> DESC -> NONE", () => {
      let r = updateColumns(cols(), 0);
      expect(r[0].sort).toBe(SORT_ASC);
      r = updateColumns(r, 0);
      expect(r[0].sort).toBe(SORT_DESC);
      r = updateColumns(r, 0);
      expect(r[0].sort).toBe(SORT_NONE);
    });
    it("does not mutate", () => {
      const input = cols().map((c) => Object.freeze(c));
      const result = updateColumns(input, 0);
      expect(result).not.toBe(input);
      expect(input.every((c) => !("sort" in c))).toBe(true);
    });
    it("returns [] for non-arrays", () => {
      expect(updateColumns(null, 0)).toEqual([]);
    });
  });

  describe("sortRows", () => {
    const columnsWith = (nameSort, ageSort) => [
      { name: "Name", mapto: "name", sort: nameSort },
      { name: "Age", mapto: "age", sort: ageSort },
    ];
    const names = (rows) => rows.map((r) => r.data.name);
    const ages = (rows) => rows.map((r) => r.data.age);

    it("asc / desc strings", () => {
      expect(names(sortRows(people(), columnsWith(SORT_ASC), 0))).toEqual(["Alice", "Bob", "Charlie"]);
      expect(names(sortRows(people(), columnsWith(SORT_DESC), 0))).toEqual(["Charlie", "Bob", "Alice"]);
    });
    it("asc / desc numbers", () => {
      expect(ages(sortRows(people(), columnsWith(SORT_NONE, SORT_ASC), 1))).toEqual([25, 30, 35]);
      expect(ages(sortRows(people(), columnsWith(SORT_NONE, SORT_DESC), 1))).toEqual([35, 30, 25]);
    });
    it("SORT_NONE restores original order", () => {
      const asc = sortRows(people(), columnsWith(SORT_ASC), 0);
      expect(names(sortRows(asc, columnsWith(SORT_NONE), 0))).toEqual(["Charlie", "Alice", "Bob"]);
    });
    it("stamps originalOrder on rows that lack it", () => {
      const sorted = sortRows(people(), columnsWith(SORT_ASC), 0);
      expect(sorted.find((r) => r.data.name === "Charlie").originalOrder).toBe(0);
      expect(sorted.find((r) => r.data.name === "Alice").originalOrder).toBe(1);
    });
    it("does not mutate", () => {
      const input = people();
      sortRows(input, columnsWith(SORT_ASC), 0);
      expect(names(input)).toEqual(["Charlie", "Alice", "Bob"]);
      expect(input.every((r) => !("originalOrder" in r))).toBe(true);
    });
    it("returns [] for non-array rows/columns", () => {
      expect(sortRows(null, columnsWith(SORT_ASC), 0)).toEqual([]);
      expect(sortRows(people(), null, 0)).toEqual([]);
    });
    it("returns [] for empty rows", () => {
      expect(sortRows([], columnsWith(SORT_ASC), 0)).toEqual([]);
    });
    it("undefined sort returns rows (not undefined)", () => {
      expect(names(sortRows(people(), columnsWith(undefined), 0))).toEqual(["Charlie", "Alice", "Bob"]);
    });
    it("unknown sort logs and returns copies", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      const result = sortRows(people(), columnsWith("bogus"), 0);
      expect(names(result)).toEqual(["Charlie", "Alice", "Bob"]);
      expect(spy).toHaveBeenCalledWith("Unknown sort type:", "bogus");
      spy.mockRestore();
    });
  });

  describe("numberRows / getHeaderBackgroundColor", () => {
    it("numberRows assigns 0..n-1", () => {
      expect(numberRows([{ data: "a" }, { data: "b" }]).map((r) => r.order)).toEqual([0, 1]);
    });
    it("numberRows returns [] for non-arrays", () => {
      expect(numberRows(null)).toEqual([]);
    });
    it("getHeaderBackgroundColor falls back to transparent", () => {
      expect(getHeaderBackgroundColor({ backgroundColor: "red" })).toBe("red");
      expect(getHeaderBackgroundColor({})).toBe("transparent");
      expect(getHeaderBackgroundColor(undefined)).toBe("transparent");
    });
  });

  describe("selectColumns", () => {
    it("returns [] for non-arrays", () => {
      expect(selectColumns(null, false)).toEqual([]);
    });
    it("defaults to first two when none selected", () => {
      expect(selectColumns(threeColumns(), false).map((c) => !!c.selected)).toEqual([true, true, false]);
    });
    it("defaults to only the first when the action column is included", () => {
      expect(selectColumns(threeColumns(), true).map((c) => !!c.selected)).toEqual([true, false, false]);
    });
    it("preserves existing selections", () => {
      const input = threeColumns().map((c, i) => ({ ...c, selected: i === 2 }));
      expect(selectColumns(input, false).map((c) => !!c.selected)).toEqual([false, false, true]);
    });
    it("does not mutate", () => {
      const input = threeColumns().map((c) => Object.freeze(c));
      expect(() => selectColumns(input, false)).not.toThrow();
      expect(input.every((c) => !("selected" in c))).toBe(true);
    });
  });

  describe("computeInitiallyShowActionColumn", () => {
    it("returns false for missing prerequisites", () => {
      expect(computeInitiallyShowActionColumn(false, { name: "A" }, 3, threeColumns())).toBe(false);
      expect(computeInitiallyShowActionColumn(true, null, 3, threeColumns())).toBe(false);
      expect(computeInitiallyShowActionColumn(true, { name: "A" }, 3, null)).toBe(false);
    });
    it("true when selectedCount < maxMobileColumns", () => {
      const cols = threeColumns().map((c, i) => ({ ...c, selected: i < 2 }));
      expect(computeInitiallyShowActionColumn(true, { name: "A" }, 3, cols)).toBe(true);
    });
    it("false when selectedCount >= maxMobileColumns", () => {
      const cols = threeColumns().map((c) => ({ ...c, selected: true }));
      expect(computeInitiallyShowActionColumn(true, { name: "A" }, 2, cols)).toBe(false);
    });
    it("falls back to columns.length when maxMobileColumns is null", () => {
      const cols = threeColumns();
      expect(computeInitiallyShowActionColumn(true, { name: "A" }, null, cols)).toBe(true);
    });
  });
});