import { useCallback, useLayoutEffect } from "react";

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

export function useInitializeColumnWidths({
  totalColumns,
  setColumnWidths,
  latestWidthsRef,
  isResizingRef,
  columns,
  useActionsColumn,
  actionColumn,
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
      const column = columns[idx];

      if (column && Number.isFinite(column.length) && column.length > 0) {
        return column.length;
      }

      if (
        useActionsColumn &&
        idx === totalColumns - 1 &&
        Number.isFinite(actionColumn?.length) &&
        actionColumn.length > 0
      ) {
        return actionColumn.length;
      }

      return getMeasuredWidthCallback(idx);
    });

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