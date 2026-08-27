"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { replaceDefaults } from "../utils/replacedefaults";
import Button from "../buttons/button";
import DropdownButton from "../buttons/dropdownbutton";

export default function Table({
  writeable = true,
  mobileBreakPoint = 768,

  striped = true,
  stripeColor = "#f2f2f2",
  showSelected = true,
  showSelectedColor = "#d9edf7",

  useActionsColumn = true,
  actionColWidth = 140,
  actionFunction = () => {},
  actionColumn = { name: "Actions" },

  useActionButton = false,
  actionButtonData = {},
  useDropdownButton = false,
  dropdownButtonData = {},

  onColumnsChange = () => {},

  tableClassName = "",
  tableStyle = {},
  defaultTableStyle = { maxWidth: "100%", width: "100%", borderCollapse: "collapse", border: "1px 1px 0 0 solid #ddd" },

  tableHeadClassName = "",
  tableHeadStyle = {},
  defaultTableHeadStyle = { backgroundColor: "#f2f2f2", fontWeight: "bold", textAlign: "left" },

  columns = [],
  tableHeadCellClassName = "",
  tableHeadCellStyle = {},
  defaultTableHeadCellStyle = { padding: "8px", borderBottom: "1px solid #ddd", fontFamily: "system-ui" },

  rowData = [],
  minColWidth = 80,
  oddRowStyle = {},
  defaultOddRowStyle = { backgroundColor: "#ffffff", fontFamily: "system-ui" },
  evenRowStyle = {},
  defaultEvenRowStyle = { backgroundColor: "#f9f9f9", fontFamily: "system-ui" },
  selectedRowStyle = {},
  defaultSelectedRowStyle = { backgroundColor: "#d9edf7", fontFamily: "system-ui" },

  onRowClick = () => {},
}) {
  const tableStyleObject = replaceDefaults(defaultTableStyle, tableStyle);
  const tableHeadStyleObject = replaceDefaults(defaultTableHeadStyle, tableHeadStyle);
  const tableHeadCellStyleObject = replaceDefaults(defaultTableHeadCellStyle, tableHeadCellStyle);

  const rows = Array.isArray(rowData) ? rowData : Array.isArray(rowData?.data) ? rowData.data : [];

  const [selectedRowIndex, setSelectedRowIndex] = useState(() => {
    const i = rows.findIndex((r) => !!r?.selected);
    return i >= 0 ? i : null;
  });

  const totalColumns = columns.length + (useActionsColumn ? 1 : 0);
  const [columnWidths, setColumnWidths] = useState([]);
  const headerRefs = useRef([]);
  const resizeStateRef = useRef(null);
  const lastEmittedSignatureRef = useRef("");
  const isResizingRef = useRef(false);
  const latestWidthsRef = useRef([]);

  const emitColumnChanges = useCallback(
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
    [actionColumn, columns, onColumnsChange, useActionsColumn]
  );

  const getMeasuredWidth = useCallback(
    (idx) => {
      const w = headerRefs.current[idx]?.offsetWidth;
      if (typeof w === "number" && w > 0) return w;
      if (useActionsColumn && idx === totalColumns - 1) return actionColWidth;
      return 160;
    },
    [actionColWidth, totalColumns, useActionsColumn]
  );

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

      if (useActionsColumn && idx === totalColumns - 1 && Number.isFinite(actionColumn?.length) && actionColumn.length > 0) {
        return actionColumn.length;
      }

      return getMeasuredWidth(idx);
    });

    setColumnWidths(nextWidths);
    latestWidthsRef.current = nextWidths;
    emitColumnChanges(nextWidths);
  }, [
    actionColumn,
    columns,
    emitColumnChanges,
    getMeasuredWidth,
    totalColumns,
    useActionsColumn,
  ]);

  const handleResize = useCallback(
    (event) => {
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
    },
    [minColWidth]
  );

  const stopResize = useCallback(() => {
    resizeStateRef.current = null;
    isResizingRef.current = false;
    emitColumnChanges(latestWidthsRef.current);

    window.removeEventListener("mousemove", handleResize);
    window.removeEventListener("mouseup", stopResize);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [emitColumnChanges, handleResize]);

  const startResize = useCallback(
    (event, index) => {
      event.preventDefault();
      event.stopPropagation();

      if (index >= totalColumns - 1) return;

      const liveWidths = Array.from({ length: totalColumns }, (_, idx) => {
        const column = columns[idx];

        if (column && Number.isFinite(column.length) && column.length > 0) return column.length;
        if (useActionsColumn && idx === totalColumns - 1 && Number.isFinite(actionColumn?.length) && actionColumn.length > 0) {
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
    },
    [actionColumn, actionColWidth, columns, handleResize, stopResize, totalColumns, useActionsColumn]
  );

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleResize);
      window.removeEventListener("mouseup", stopResize);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [handleResize, stopResize]);

  const renderCellValue = (cell) => {
    if (cell == null) return "";
    if (typeof cell === "object") return JSON.stringify(cell);
    return cell;
  };

  const handleRowClick = (row, rowIndex) => {
    if (writeable && showSelected) {
      setSelectedRowIndex(rowIndex);
    }

    if (typeof onRowClick === "function") {
      onRowClick(row, rowIndex);
    }
  };

  const getHeaderStyle = (index) => ({
    ...tableHeadCellStyleObject,
    boxSizing: "border-box",
    position: "relative",
    width: columnWidths[index] ? `${columnWidths[index]}px` : undefined,
    borderRight: index < totalColumns - 1 ? "1px solid #ddd" : undefined,
    borderBottom: "1px solid #ddd",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  });

  const getBodyCellStyle = (index) => ({
    padding: "8px",
    boxSizing: "border-box",
    borderRight: index < totalColumns - 1 ? "1px solid #ddd" : undefined,
    borderBottom: "1px solid #ddd",
    width: columnWidths[index] ? `${columnWidths[index]}px` : undefined,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  });

  const getActionCellStyle = (index) => ({
    ...getBodyCellStyle(index),
    overflow: "visible",
    position: "relative",
  });

  return (
    <table className={tableClassName} style={{ tableLayout: "fixed", ...tableStyleObject }}>
      <thead className={tableHeadClassName} style={{ ...tableHeadStyleObject }}>
        <tr>
          {columns.map((header, index) => (
            <th
              key={index}
              ref={(el) => {
                headerRefs.current[index] = el;
              }}
              className={tableHeadCellClassName}
              style={getHeaderStyle(index)}
            >
              {header.name}
              {index < totalColumns - 1 && (
                <div
                  onMouseDown={(e) => startResize(e, index)}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "8px",
                    height: "100%",
                    cursor: "col-resize",
                    userSelect: "none",
                  }}
                />
              )}
            </th>
          ))}
          {useActionsColumn && (
            <th
              ref={(el) => {
                headerRefs.current[columns.length] = el;
              }}
              className={tableHeadCellClassName}
              style={getHeaderStyle(columns.length)}
            >
              {actionColumn.name}
            </th>
          )}
        </tr>
      </thead>

      <tbody>
        {rows.map((row, rowIndex) => {
          const isSelected = showSelected ? rowIndex === selectedRowIndex : false;
          const rowStyle = isSelected
            ? { ...defaultSelectedRowStyle, ...selectedRowStyle }
            : rowIndex % 2 === 0
              ? { ...defaultEvenRowStyle, ...evenRowStyle }
              : { ...defaultOddRowStyle, ...oddRowStyle };

          const cells = Array.isArray(row?.data) ? row.data : [];
          const rowDropdownItems = Array.isArray(dropdownButtonData.dropdownItems)
            ? dropdownButtonData.dropdownItems.map((item) => ({
                ...item,
                action:
                  typeof item?.action === "function"
                    ? () => item.action(row, rowIndex)
                    : item?.action,
              }))
            : [];

          return (
            <tr key={rowIndex} style={rowStyle} onClick={() => handleRowClick(row, rowIndex)}>
              {cells.map((cell, cellIndex) => (
                <td key={cellIndex} style={getBodyCellStyle(cellIndex)}>
                  {renderCellValue(cell)}
                </td>
              ))}

              {useActionsColumn && (
                <td style={getActionCellStyle(columns.length)}>
                  {useDropdownButton ? (
                    <DropdownButton
                      outerContainerStyle={dropdownButtonData.outerContainerStyle}
                      outerContainerClassName={dropdownButtonData.outerContainerClassName}
                      buttonContainerStyle={dropdownButtonData.buttonContainerStyle}
                      buttonContainerClassName={dropdownButtonData.buttonContainerClassName}
                      onButtonClick={(e) => {
                        e.stopPropagation();
                        dropdownButtonData.onButtonClick?.(row, rowIndex);
                      }}
                      buttonClassName={dropdownButtonData.buttonClassName}
                      buttonStyle={dropdownButtonData.buttonStyle}
                      leadingIconClassName={dropdownButtonData.leadingIconClassName}
                      leadingIconStyle={dropdownButtonData.leadingIconStyle}
                      trailingIconClassName={dropdownButtonData.trailingIconClassName}
                      trailingIconStyle={dropdownButtonData.trailingIconStyle}
                      dropdownContainerStyle={dropdownButtonData.dropdownContainerStyle}
                      dropdownContainerClassName={dropdownButtonData.dropdownContainerClassName}
                      dropdownIconStyle={dropdownButtonData.dropdownIconStyle}
                      showDropdown={dropdownButtonData.showDropdown}
                      bottomRowsToShowUpwardsDropdown={dropdownButtonData.bottomRowsToShowUpwardsDropdown}
                      dropdownItems={rowDropdownItems}
                      actionElementStyle={dropdownButtonData.actionElementStyle}
                      actionElementClassName={dropdownButtonData.actionElementClassName}
                      urlElementStyle={dropdownButtonData.urlElementStyle}
                      urlElementClassName={dropdownButtonData.urlElementClassName}
                    >
                      {dropdownButtonData.text}
                    </DropdownButton>
                  ) : useActionButton ? (
                    <Button
                      style={actionButtonData.style}
                      className={actionButtonData.className}
                      leadingIconClassName={actionButtonData.leadingIconClassName}
                      leadingIconStyle={actionButtonData.leadingIconStyle}
                      trailingIconClassName={actionButtonData.trailingIconClassName}
                      trailingIconStyle={actionButtonData.trailingIconStyle}
                      onClick={(e) => {
                        e.stopPropagation();
                        actionButtonData.onButtonClick?.(row, rowIndex);
                      }}
                    >
                      {actionButtonData.text}
                    </Button>
                  ) : null}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}