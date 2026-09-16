import { useCallback, useLayoutEffect } from "react";

export const SORT_ASC = "asc";
export const SORT_DESC = "desc";
export const SORT_NONE = "none";

export function useEmitColumnChanges(
  columns,
  actionColumn,
  useActionsColumn,
  onColumnsChange,
  lastEmittedSignatureRef
) {
  return useCallback(
    (widths) => {
      const nextColumns = columns.map((column, idx) => {
        const nextLength = widths[idx];
        if (!column || !Number.isFinite(nextLength) || nextLength <= 0) return column;
        return column.length === nextLength ? column : { ...column, length: nextLength };
      });

      const nextActionColumn =
        useActionsColumn && Number.isFinite(widths[columns.length]) && widths[columns.length] > 0
          ? { ...actionColumn, length: widths[columns.length] }
          : actionColumn;

      const nextSignature = JSON.stringify({
        columns: nextColumns.map((c) => c?.length ?? null),
        actionLength: nextActionColumn?.length ?? null,
      });

      if (nextSignature === lastEmittedSignatureRef.current) return;
      lastEmittedSignatureRef.current = nextSignature;

      onColumnsChange({
        columns: nextColumns,
        actionColumn: nextActionColumn,
      });
    },
    [actionColumn, columns, onColumnsChange, useActionsColumn, lastEmittedSignatureRef]
  );
}

export function getMeasuredWidth(
  idx,
  headerRefs,
  useActionsColumn,
  totalColumns,
  actionColWidth,
  fallbackWidth = 160
) {
  const w = headerRefs.current[idx]?.offsetWidth;
  if (typeof w === "number" && w > 0) return w;
  if (useActionsColumn && idx === totalColumns - 1) return actionColWidth;
  return fallbackWidth;
}

function areWidthsEqual(a = [], b = []) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function useInitializeColumnWidths({
  totalColumns,
  setColumnWidths,
  latestWidthsRef,
  isResizingRef,
  columns,
  useActionsColumn,
  actionColumn,
  headerRefs,
  actionColWidth,
  getMeasuredWidthCallback,
  emitColumnChangesCallback,
}) {
  useLayoutEffect(() => {
    if (totalColumns === 0) {
      setColumnWidths([]);
      latestWidthsRef.current = [];
      return;
    }

    if (isResizingRef.current) return;

    const nextWidths = Array.from({ length: totalColumns }, (_, idx) => {
      const latest = latestWidthsRef.current[idx];
      if (Number.isFinite(latest) && latest > 0) return latest;

      const column = columns[idx];

      if (column && Number.isFinite(column.length) && column.length > 0) return column.length;
      if (
        useActionsColumn &&
        idx === totalColumns - 1 &&
        Number.isFinite(actionColumn?.length) &&
        actionColumn.length > 0
      ) {
        return actionColumn.length;
      }

      const w = headerRefs.current[idx]?.offsetWidth;
      if (typeof w === "number" && w > 0) return w;

      return idx === totalColumns - 1 && useActionsColumn ? actionColWidth : 160;
    });

    if (areWidthsEqual(latestWidthsRef.current, nextWidths)) return;

    setColumnWidths(nextWidths);
    latestWidthsRef.current = nextWidths;
    emitColumnChangesCallback(nextWidths);
  }, [
    totalColumns,
    setColumnWidths,
    latestWidthsRef,
    isResizingRef,
    columns,
    useActionsColumn,
    actionColumn,
    headerRefs,
    actionColWidth,
    getMeasuredWidthCallback,
    emitColumnChangesCallback,
  ]);
}

export function handleResizeEvent(event, resizeStateRef, minColWidth, latestWidthsRef, setColumnWidths) {
  const state = resizeStateRef.current;
  if (!state) return;

  const { index, startX, startWidths } = state;
  const leftStart = startWidths[index];
  const rightStart = startWidths[index + 1];
  if (leftStart == null || rightStart == null) return;

  const delta = event.clientX - startX;
  const maxGrow = rightStart - minColWidth;
  const maxShrink = leftStart - minColWidth;
  const appliedDelta = Math.max(-maxShrink, Math.min(delta, maxGrow));

  const next = [...startWidths];
  next[index] = leftStart + appliedDelta;
  next[index + 1] = rightStart - appliedDelta;

  latestWidthsRef.current = next;
  setColumnWidths(next);
}

export function stopResizeInteraction({
  resizeStateRef,
  isResizingRef,
  emitColumnChangesCallback,
  latestWidthsRef,
  handleResize,
  stopResize,
}) {
  resizeStateRef.current = null;
  isResizingRef.current = false;
  emitColumnChangesCallback(latestWidthsRef.current);

  window.removeEventListener("mousemove", handleResize);
  window.removeEventListener("mouseup", stopResize);
  document.body.style.cursor = "";
  document.body.style.userSelect = "";
}

export function startResizeInteraction({
  event,
  index,
  totalColumns,
  columns,
  useActionsColumn,
  actionColumn,
  headerRefs,
  actionColWidth,
  handleResize,
  stopResize,
  resizeStateRef,
  isResizingRef,
  latestWidthsRef,
}) {
  event.preventDefault();
  event.stopPropagation();

  if (index >= totalColumns - 1) return;

  const liveWidths = Array.from({ length: totalColumns }, (_, idx) => {
    const latest = latestWidthsRef.current[idx];
    if (Number.isFinite(latest) && latest > 0) return latest;

    const column = columns[idx];
    if (column && Number.isFinite(column.length) && column.length > 0) return column.length;
    if (
      useActionsColumn &&
      idx === totalColumns - 1 &&
      Number.isFinite(actionColumn?.length) &&
      actionColumn.length > 0
    ) {
      return actionColumn.length;
    }

    const w = headerRefs.current[idx]?.offsetWidth;
    if (typeof w === "number" && w > 0) return w;

    return idx === totalColumns - 1 && useActionsColumn ? actionColWidth : 160;
  });

  isResizingRef.current = true;
  latestWidthsRef.current = liveWidths;

  resizeStateRef.current = {
    index,
    startX: event.clientX,
    startWidths: liveWidths,
  };

  window.addEventListener("mousemove", handleResize);
  window.addEventListener("mouseup", stopResize);
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
}

export function renderCellValue(cell) {
  if (cell == null) return "";
  if (typeof cell === "object") return JSON.stringify(cell);
  return cell;
}

export function handleRowClick(row, rowIndex, writeable, showSelected, setSelectedRowIndex, onRowClick) {
  if (writeable && showSelected) {
    setSelectedRowIndex(rowIndex);
  }

  if (typeof onRowClick === "function") {
    onRowClick(row, rowIndex);
  }
}

export function getHeaderStyle(index, tableHeadCellStyleObject, columnWidths, totalColumns) {
  return {
    ...tableHeadCellStyleObject,
    boxSizing: "border-box",
    position: "relative",
    width: columnWidths[index] ? `${columnWidths[index]}px` : undefined,
    borderRight: index < totalColumns - 1 ? "1px solid #ddd" : undefined,
    borderBottom: "1px solid #ddd",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  };
}

export function getBodyCellStyle(index, columnWidths, totalColumns) {
  return {
    padding: "8px",
    boxSizing: "border-box",
    borderRight: index < totalColumns - 1 ? "1px solid #ddd" : undefined,
    borderBottom: "1px solid #ddd",
    width: columnWidths[index] ? `${columnWidths[index]}px` : undefined,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  };
}

export function getActionCellStyle(index, columnWidths, totalColumns) {
  return {
    ...getBodyCellStyle(index, columnWidths, totalColumns),
    overflow: "visible",
    position: "relative",
  };
}

export function ensureRowsHaveOrder(rows = [], rowOrderKey = "order") {
  if (!Array.isArray(rows)) return [];

  return rows.map((row, index) => {
    if (row && typeof row === "object" && !Array.isArray(row)) {
      const hasOrder = Number.isFinite(row[rowOrderKey]);
      return hasOrder ? row : { ...row, [rowOrderKey]: index };
    }

    return {
      data: [row],
      [rowOrderKey]: index,
    };
  });
}

/**
 * not used by default, must be incorporated manually
 */
export function sortRows(rows = [], columns = [], columnIndex) {
  if (!Array.isArray(rows)) return [];
  if (!Array.isArray(columns)) return [];

  const firstRow = rows[0];
  if (!Number.isFinite(firstRow?.originalOrder)) {
    rows = rows.map((row, index) => ({ ...row, originalOrder: index }));
  }

  const currentSort = columns[columnIndex]?.sort;
  if (currentSort === SORT_NONE) {
    return rows
      .map((row) => ({ ...row, order: row.originalOrder }))
      .sort((a, b) => a.originalOrder - b.originalOrder);

  } else if (currentSort === SORT_ASC) {
    return rows.map((row) => ({ ...row })).sort((a, b) => {
      const aValue = a.data[columnIndex];
      const bValue = b.data[columnIndex];
      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    });

  } else if (currentSort === SORT_DESC) {
    return rows.map((row) => ({ ...row })).sort((a, b) => {
      const aValue = a.data[columnIndex];
      const bValue = b.data[columnIndex];
      if (aValue > bValue) return -1;
      if (aValue < bValue) return 1;
      return 0;
    });

  } else {
    console.error("Unknown sort type:", currentSort);
    return rows.map((row) => ({ ...row }));
  }
}

/**
 * order of update: SORT_NONE -> SORT_ASC -> SORT_DESC -> SORT_NONE
*/
export function updateColumns(columns = [], columnIndex) {
  if (!Array.isArray(columns)) return [];

  const selectedColumn = columns[columnIndex];
  const currentSort = selectedColumn?.sort;

  let nextSort;
  if (currentSort === SORT_NONE) {
    nextSort = SORT_ASC;
  } else if (currentSort === SORT_ASC) {
    nextSort = SORT_DESC;
  } else if (currentSort === SORT_DESC) {
    nextSort = SORT_NONE;
  } else {
    nextSort = SORT_ASC;
  }

  return columns.map((column, index) => {
    if (index === columnIndex) {
      return { ...column, sort: nextSort };

    } else {
      return { ...column, sort: SORT_NONE };
    }
  });
}