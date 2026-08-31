"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { replaceDefaults } from "../../utils/replacedefaults";
import useIsBelowBreakPoint from "../../utils/watchmobilebreakpoint";
import {
  useEmitColumnChanges,
  getMeasuredWidth,
  useInitializeColumnWidths,
  handleResizeEvent,
  stopResizeInteraction,
  startResizeInteraction,
  handleRowClick as handleRowClickHelper,
  getHeaderStyle as getHeaderStyleHelper,
  getBodyCellStyle as getBodyCellStyleHelper,
  getActionCellStyle as getActionCellStyleHelper,
  ensureRowsHaveOrder,
  
} from "./table-service";
import TableDesktop from "./table-desktop";
import TableMobile from "./table-mobile";

const NOOP = () => {};

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
  rowOrderKey = "order",
  minColWidth = 80,
  oddRowStyle = {},
  defaultOddRowStyle = { backgroundColor: "#ffffff", fontFamily: "system-ui" },
  evenRowStyle = {},
  defaultEvenRowStyle = { backgroundColor: "#f9f9f9", fontFamily: "system-ui" },
  selectedRowStyle = {},
  defaultSelectedRowStyle = { backgroundColor: "#d9edf7", fontFamily: "system-ui" },

  sortDescendingIcon = "fa fa-caret-down",
  sortAscendingIcon = "fa fa-caret-up",
  unsortedIcon = "fa fa-sort",

  onColumnsChange = NOOP,
  onColumnSort = NOOP,
  onRowClick = NOOP,

}) {
  const shouldBeMobile = useIsBelowBreakPoint(mobileBreakPoint);

  const tableStyleObject = replaceDefaults(defaultTableStyle, tableStyle);
  const tableHeadStyleObject = replaceDefaults(defaultTableHeadStyle, tableHeadStyle);
  const tableHeadCellStyleObject = replaceDefaults(defaultTableHeadCellStyle, tableHeadCellStyle);

  const rows = useMemo(() => {
    const sourceRows = Array.isArray(rowData)
      ? rowData
      : Array.isArray(rowData?.data)
        ? rowData.data
        : [];

    return ensureRowsHaveOrder(sourceRows, rowOrderKey);
  }, [rowData, rowOrderKey]);

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
    (idx) => getMeasuredWidth(idx, headerRefs, useActionsColumn, totalColumns, actionColWidth),
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

  const commonProps = {
    tableClassName,
    tableStyleObject,
    tableHeadClassName,
    tableHeadStyleObject,
    columns,
    tableHeadCellClassName,
    useActionsColumn,
    actionColumn,
    rows,
    selectedRowIndex,
    showSelected,
    defaultSelectedRowStyle,
    selectedRowStyle,
    defaultEvenRowStyle,
    evenRowStyle,
    defaultOddRowStyle,
    oddRowStyle,
    handleRowClick,
    getBodyCellStyle,
    getActionCellStyle,
    useDropdownButton,
    dropdownButtonData,
    useActionButton,
    actionButtonData,
  };

  return (
    shouldBeMobile ? 
    <TableMobile {...commonProps} />
    : (
    <TableDesktop
      {...commonProps}
      headerRefs={headerRefs}
      totalColumns={totalColumns}
      getHeaderStyle={getHeaderStyle}
      startResize={startResize}
    />
  ));
}