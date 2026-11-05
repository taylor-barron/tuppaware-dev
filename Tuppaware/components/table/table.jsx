"use client";

// TODO: throw errors for invalid states like true for both buttons or "actionColumn" being used as a mapTo, order key?,
// TODO: update tests
// TODO: update documentation

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
  getHeaderBackgroundColor,
  updateColumns,
  sortRows,
  numberRows,

} from "./table-service";
import TableDesktop from "./table-desktop";
import TableMobile from "./table-mobile";

const NOOP = () => {};

export default function Table({
  writeable = true,
  mobileBreakPoint = 768,

  columns = [],
  setColumns = NOOP,

  rowData = [],
  setRows = NOOP,

  onColumnsChange = NOOP,
  onColumnSort = (columnIndex) => {
    const updatedColumns = updateColumns(columns, columnIndex);
    setColumns(updatedColumns);

    const reorderedRows = sortRows(rowData, updatedColumns, columnIndex);
    const updatedRows = numberRows(reorderedRows);
    setRows(updatedRows);
  },
  onRowClick = NOOP,

  useActionsColumn = false,
  actionColWidth = 140,
  actionColumn = { name: "Actions" },
  useActionButton = false,
  actionButtonData = {},
  useDropdownButton = false,
  dropdownButtonData = {},

  tableClassName = "",
  tableStyle = {},
  defaultTableStyle = { maxWidth: "100%", width: "100%", borderCollapse: "collapse", border: "1px 1px 0 0 solid #ddd", fontFamily: "system-ui" },

  tableHeadClassName = "",
  tableHeadStyle = {},
  defaultTableHeadStyle = { backgroundColor: "#f2f2f2", textAlign: "left", fontFamily: "system-ui" },

  headerClassName = "",
  headerStyle = {},
  defaultHeaderStyle = { fontFamily: "system-ui", margin: 0, fontSize: "inherit", fontWeight: "inherit" },

  textClassName = "",
  textStyle = {},
  defaultTextStyle = { fontFamily: "system-ui", margin: 0, fontSize: "inherit", fontWeight: "inherit" },

  tableHeadCellClassName = "",
  tableHeadCellStyle = {},
  defaultTableHeadCellStyle = { margin: 0, paddingLeft: "8px", borderBottom: "1px solid #ddd", fontFamily: "system-ui" },

  columnSelectIconClass = "fa fa-bars",
  columnAddIconClass = "fa fa-plus",
  defaultAddColumnIconStyle = {},
  addColumnIconStyle = {},
  addColumnIconContainerStyle = {},
  defaultAddColumnIconContainerStyle = {
    borderRadius: "0 8px 8px 0",
    padding: "6px 4px",
    cursor: "pointer",
    alignSelf: "flex-start",
    backgroundColor: "#f2f2f2",
  },
  maxMobileColumns = 3,

  rowOrderKey = "order",
  minColWidth = 80,
  cascadeResize = false,

  showSelected = true,
  oddRowStyle = {},
  evenRowStyle = {},
  defaultOddRowStyle = { backgroundColor: "#ffffff", fontFamily: "system-ui" },
  defaultEvenRowStyle = { backgroundColor: "#f9f9f9", fontFamily: "system-ui" },
  selectedRowStyle = {},
  defaultSelectedRowStyle = { backgroundColor: "#d9edf7", fontFamily: "system-ui" },

  sortDescendingIcon = "fa fa-caret-down",
  sortAscendingIcon = "fa fa-caret-up",
  unsortedIcon = "fa fa-sort",

}) {
  const shouldBeMobile = useIsBelowBreakPoint(mobileBreakPoint);

  const tableStyleObject = replaceDefaults(defaultTableStyle, tableStyle);
  const tableHeadStyleObject = replaceDefaults(defaultTableHeadStyle, tableHeadStyle);
  const headerStyleObject = replaceDefaults(defaultHeaderStyle, headerStyle);
  const tableHeadCellStyleObject = replaceDefaults(defaultTableHeadCellStyle, tableHeadCellStyle);
  const addColumnIconStyleObject = replaceDefaults(defaultAddColumnIconStyle, addColumnIconStyle);
  const textStyleObject = replaceDefaults(defaultTextStyle, textStyle);
  const addColumnIconContainerStyleObject = replaceDefaults(defaultAddColumnIconContainerStyle, addColumnIconContainerStyle);
  const tableHeadBackgroundStyle = getHeaderBackgroundColor(tableHeadStyleObject);
  const oddRowStyleObject = replaceDefaults(defaultOddRowStyle, oddRowStyle);
  const evenRowStyleObject = replaceDefaults(defaultEvenRowStyle, evenRowStyle);
  const selectedRowStyleObject = replaceDefaults(defaultSelectedRowStyle, selectedRowStyle);

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

  const [pendingRowClick, setPendingRowClick] = useState(null);

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
    headerRefs,
    actionColWidth,
    getMeasuredWidthCallback,
    emitColumnChangesCallback,
  });

  const handleResize = useCallback(
    (event) => {
      handleResizeEvent(event, resizeStateRef, minColWidth, latestWidthsRef, setColumnWidths, cascadeResize);
    },
    [minColWidth, cascadeResize]
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
      handleRowClickHelper(
        row,
        rowIndex,
        writeable,
        showSelected,
        setSelectedRowIndex,
        (clickedRow, clickedRowIndex) => {
          setPendingRowClick({ row: clickedRow, rowIndex: clickedRowIndex });
        }
      );
    },
    [writeable, showSelected]
  );

  useEffect(() => {
    if (!pendingRowClick) return;

    let secondFrame;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        onRowClick(pendingRowClick.row, pendingRowClick.rowIndex);
        setPendingRowClick(null);
      });
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame !== undefined) cancelAnimationFrame(secondFrame);
    };
  }, [pendingRowClick, onRowClick]);

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
    columns,
    rows,
    totalColumns,
    
    useActionsColumn,
    actionColumn,
    useActionButton,
    actionButtonData,
    useDropdownButton,
    dropdownButtonData,

    tableClassName,
    tableStyleObject,

    tableHeadClassName,
    tableHeadStyleObject,
    tableHeadBackgroundStyle,
    tableHeadCellClassName,

    headerClassName,
    headerStyleObject,

    textClassName,
    textStyleObject,

    showSelected,
    oddRowStyleObject,
    evenRowStyleObject,
    selectedRowStyleObject,
    selectedRowIndex,
    
    handleRowClick,
    getBodyCellStyle,
    getActionCellStyle,
    onColumnSort,
    getHeaderStyle,

    sortAscendingIcon,
    sortDescendingIcon,
    unsortedIcon,
  };

  return (
    shouldBeMobile ? 
      <TableMobile
        {...commonProps}
        setColumns={setColumns}
        columnSelectIconClass={columnSelectIconClass}
        addColumnIconContainerStyleObject={addColumnIconContainerStyleObject}
        addColumnIconStyleObject={addColumnIconStyleObject}
        columnAddIconClass={columnAddIconClass}
        maxMobileColumns={maxMobileColumns}
      />
    : (
      <TableDesktop
        {...commonProps}
        headerRefs={headerRefs}
        startResize={startResize}
      />
  ));
}