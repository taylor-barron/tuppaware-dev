"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { replaceDefaults } from "../../utils/replacedefaults";
import {
  useEmitColumnChanges,
  getMeasuredWidth,
  useInitializeColumnWidths,
  handleResizeEvent,
  stopResizeInteraction,
  startResizeInteraction,
  renderCellValue,
  handleRowClick as handleRowClickHelper,
  getHeaderStyle as getHeaderStyleHelper,
  getBodyCellStyle as getBodyCellStyleHelper,
  getActionCellStyle as getActionCellStyleHelper,
  
} from "./table-helper";
import Button from "../../buttons/button";
import DropdownButton from "../../buttons/dropdownbutton";

export default function Table({
  writeable = true,
  mobileBreakPoint = 768,
  showSelected = true,

  useActionsColumn = true,
  actionColWidth = 140,
  actionColumn = { name: "Actions" },
  
  useActionButton = false,
  actionButtonData = {},
  useDropdownButton = false,
  dropdownButtonData = {},
  
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
  
  onColumnsChange = () => {},
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

  const emitColumnChangesCallback = useEmitColumnChanges(
    columns,
    actionColumn,
    useActionsColumn,
    onColumnsChange,
    lastEmittedSignatureRef
  );

  const getMeasuredWidthCallback = useCallback(
    (idx) =>
      getMeasuredWidth(idx, headerRefs, useActionsColumn, totalColumns, actionColWidth),
    [actionColWidth, totalColumns, useActionsColumn]
  );

  useInitializeColumnWidths({
    totalColumns,
    setColumnWidths,
    latestWidthsRef,
    isResizingRef,
    columns,
    useActionsColumn,
    actionColumn,
    getMeasuredWidthCallback,
    emitColumnChangesCallback,
  });

  const handleResize = useCallback(
    (event) => {
      handleResizeEvent(event, resizeStateRef, minColWidth, latestWidthsRef, setColumnWidths);
    },
    [minColWidth]
  );

  const stopResize = useCallback(() => {
    stopResizeInteraction({
      resizeStateRef,
      isResizingRef,
      emitColumnChangesCallback,
      latestWidthsRef,
      handleResize,
      stopResize,
    });
  }, [emitColumnChangesCallback, handleResize]);

  const startResize = useCallback(
    (event, index) => {
      startResizeInteraction({
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
      });
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

  const handleRowClick = useCallback(
    (row, rowIndex) => {
      handleRowClickHelper(row, rowIndex, writeable, showSelected, setSelectedRowIndex, onRowClick);
    },
    [writeable, showSelected, onRowClick]
  );

  const getHeaderStyle = useCallback(
    (index) => getHeaderStyleHelper(index, tableHeadCellStyleObject, columnWidths, totalColumns),
    [tableHeadCellStyleObject, columnWidths, totalColumns]
  );

  const getBodyCellStyle = useCallback(
    (index) => getBodyCellStyleHelper(index, columnWidths, totalColumns),
    [columnWidths, totalColumns]
  );

  const getActionCellStyle = useCallback(
    (index) => getActionCellStyleHelper(index, columnWidths, totalColumns),
    [columnWidths, totalColumns]
  );

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