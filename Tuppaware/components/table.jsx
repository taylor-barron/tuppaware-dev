"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  actionColunName = "Actions",
  useButton = false,
  actionButtonData = {},
  useDropdownButton = false,
  dropdownButtonData = {},
  actionText = "Action",

  tableClassName = "",
  tableStyle = {},
  defaultTableStyle = { width: "100%", borderCollapse: "collapse", border: "1px 1px 0 0 solid #ddd" },

  tableHeadClassName = "",
  tableHeadStyle = {},
  defaultTableHeadStyle = { backgroundColor: "#f2f2f2", fontWeight: "bold", textAlign: "left" },

  columnHeaders = [],
  tableHeadCellClassName = "",
  tableHeadCellStyle = {},
  defaultTableHeadCellStyle = { padding: "8px", borderBottom: "1px solid #ddd" },

  rowData = [],
  minColWidth = 80,
  oddRowStyle = {},
  defaultOddRowStyle = { backgroundColor: "#ffffff" },
  evenRowStyle = {},
  defaultEvenRowStyle = { backgroundColor: "#f9f9f9" },
  selectedRowStyle = {},
  defaultSelectedRowStyle = { backgroundColor: "#d9edf7" },

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

  const totalColumns = columnHeaders.length + (useActionsColumn ? 1 : 0);
  const [columnWidths, setColumnWidths] = useState([]);
  const headerRefs = useRef([]);
  const resizeStateRef = useRef(null);

  useEffect(() => {
    const i = rows.findIndex((r) => !!r?.selected);
    setSelectedRowIndex(i >= 0 ? i : null);
  }, [rowData]);

  useEffect(() => {
    if (totalColumns === 0) {
      setColumnWidths([]);
      return;
    }

    const raf = requestAnimationFrame(() => {
      const measured = Array.from({ length: totalColumns }, (_, idx) => {
        const w = headerRefs.current[idx]?.offsetWidth;
        if (typeof w === "number" && w > 0) return w;
        if (useActionsColumn && idx === totalColumns - 1) return actionColWidth;
        return 160;
      });

      setColumnWidths((prev) => {
        if (prev.length === totalColumns && prev.every((w) => typeof w === "number" && w > 0)) {
          return prev;
        }
        return measured;
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [totalColumns, useActionsColumn]);

  const stopResize = useCallback(() => {
    resizeStateRef.current = null;
    window.removeEventListener("mousemove", handleResize);
    window.removeEventListener("mouseup", stopResize);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  const handleResize = useCallback((event) => {
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

    setColumnWidths(next);
  }, []);

  const startResize = useCallback(
    (event, index) => {
      event.preventDefault();
      event.stopPropagation();

      if (index >= totalColumns - 1) return;

      const liveWidths = Array.from({ length: totalColumns }, (_, idx) => {
        const w = headerRefs.current[idx]?.offsetWidth;
        if (typeof w === "number" && w > 0) return w;
        return columnWidths[idx] ?? (useActionsColumn && idx === totalColumns - 1 ? actionColWidth : 160);
      });

      resizeStateRef.current = {
        index,
        startX: event.clientX,
        startWidths: liveWidths,
      };

      setColumnWidths(liveWidths);

      window.addEventListener("mousemove", handleResize);
      window.addEventListener("mouseup", stopResize);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [columnWidths, handleResize, stopResize, totalColumns, useActionsColumn]
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
    borderRight: index < totalColumns - 1 ? "1px solid #ddd" : undefined,
    borderBottom: "1px solid #ddd",
    width: columnWidths[index] ? `${columnWidths[index]}px` : undefined,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  });

  return (
    <table className={tableClassName} style={{ tableLayout: "fixed", ...tableStyleObject }}>
      <thead className={tableHeadClassName} style={{ ...tableHeadStyleObject }}>
        <tr>
          {columnHeaders.map((header, index) => (
            <th
              key={index}
              ref={(el) => {
                headerRefs.current[index] = el;
              }}
              className={tableHeadCellClassName}
              style={getHeaderStyle(index)}
            >
              {header}
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
                headerRefs.current[columnHeaders.length] = el;
              }}
              className={tableHeadCellClassName}
              style={getHeaderStyle(columnHeaders.length)}
            >
              {actionColunName}
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

          return (
            <tr key={rowIndex} style={rowStyle} onClick={() => handleRowClick(row, rowIndex)}>
              {cells.map((cell, cellIndex) => (
                <td key={cellIndex} style={getBodyCellStyle(cellIndex)}>
                  {renderCellValue(cell)}
                </td>
              ))}

              {useActionsColumn && (
                useDropdownButton ? (
                  <td style={getBodyCellStyle(columnHeaders.length)}>
                    <DropdownButton
                      outerContainerStyle={dropdownButtonData.outerContainerStyle}
                      outerContainerClassName={dropdownButtonData.outerContainerClassName}

                      buttonContainerStyle={dropdownButtonData.buttonContainerStyle}
                      buttonContainerClassName={dropdownButtonData.buttonContainerClassName}

                      onButtonClick={(e) => {
                        e.stopPropagation();
                        dropdownButtonData.onButtonClick(row, rowIndex);
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
                      dropdownItems={dropdownButtonData.dropdownItems}
                      actionElementStyle={dropdownButtonData.actionElementStyle}
                      actionElementClassName={dropdownButtonData.actionElementClassName}
                      urlElementStyle={dropdownButtonData.urlElementStyle}
                      urlElementClassName={dropdownButtonData.urlElementClassName}
                      
                    >{dropdownButtonData.text}</DropdownButton>
                  </td>
                ) : useButton ? (
                  <td style={getBodyCellStyle(columnHeaders.length)}>
                    <Button
                      style={actionButtonData.style}
                      className={actionButtonData.className}
                      leadingIconClassName={actionButtonData.leadingIconClassName}
                      leadingIconStyle={actionButtonData.leadingIconStyle}
                      trailingIconClassName={actionButtonData.trailingIconClassName}
                      trailingIconStyle={actionButtonData.trailingIconStyle}
                      onClick={actionButtonData.onClick}

                    >{actionButtonData.text}</Button>
                  </td>
                ) : (
                  <td style={getBodyCellStyle(columnHeaders.length)}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Action for row ${rowIndex + 1}`);
                      }}
                    >
                      Action
                    </button>
                  </td>
                )
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}