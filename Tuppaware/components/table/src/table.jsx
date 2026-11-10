"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { replaceDefaults } from "../../../utils/src/replacedefaults";
import useIsBelowBreakPoint from "../../../utils/src/watchmobilebreakpoint";

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
  defaultOnColumnSort,

} from "../utils/table-service";

import { EMPTY_ARRAY, EMPTY_STYLE, EMPTY_OBJECT, EMPTY_CLASS_NAME, NOOP } from "../../../utils/src/globaldefaults";

import {
  ACTION_COLUMN,
  DEFAULT_TABLE_STYLE,
  DEFAULT_TABLE_HEAD_STYLE,
  DEFAULT_HEADER_STYLE,
  DEFAULT_TEXT_STYLE,
  DEFAULT_TABLE_HEAD_CELL_STYLE,
  DEFAULT_ADD_COLUMN_ICON_STYLE,
  DEFAULT_ADD_COLUMN_ICON_CONTAINER_STYLE,
  DEFAULT_ODD_ROW_STYLE,
  DEFAULT_EVEN_ROW_STYLE,
  DEFAULT_SELECTED_ROW_STYLE

} from "../utils/table-defaults";

import TableDesktop from "./table-desktop";
import TableMobile from "./table-mobile";

export default function Table({
  writeable = true,
  mobileBreakPoint = 768,

  columns = EMPTY_ARRAY,
  setColumns = NOOP,

  rowData = EMPTY_ARRAY,
  setRows = NOOP,

  onColumnsChange = NOOP,
  onColumnSort = (columnIndex) => { defaultOnColumnSort(columnIndex, columns, rowData, setColumns, setRows); },
  onRowClick = NOOP,

  useActionsColumn = false,
  actionColWidth = 250,
  actionColumn = ACTION_COLUMN,
  useActionButton = false,
  actionButtonData = EMPTY_STYLE,
  useDropdownButton = false,
  dropdownButtonData = EMPTY_OBJECT,

  tableClassName = EMPTY_CLASS_NAME,
  tableStyle = EMPTY_STYLE,

  tableHeadClassName = EMPTY_CLASS_NAME,
  tableHeadStyle = EMPTY_STYLE,

  headerClassName = EMPTY_CLASS_NAME,
  headerStyle = EMPTY_STYLE,

  textClassName = EMPTY_CLASS_NAME,
  textStyle = EMPTY_STYLE,

  tableHeadCellClassName = EMPTY_CLASS_NAME,
  tableHeadCellStyle = EMPTY_STYLE,

  columnSelectIconClass = "fa fa-bars",
  columnAddIconClass = "fa fa-plus",
  addColumnIconStyle = EMPTY_STYLE,
  addColumnIconContainerStyle = EMPTY_STYLE,
  maxMobileColumns = 3,

  rowOrderKey = "order",
  minColWidth = 80,
  cascadeResize = false,

  showSelected = true,
  oddRowStyle = EMPTY_STYLE,
  evenRowStyle = EMPTY_STYLE,
  selectedRowStyle = EMPTY_STYLE,

  sortDescendingIcon = "fa fa-caret-down",
  sortAscendingIcon = "fa fa-caret-up",
  unsortedIcon = "fa fa-sort",

}) {
  const shouldBeMobile = useIsBelowBreakPoint(mobileBreakPoint);

  const tableStyleObject = replaceDefaults(DEFAULT_TABLE_STYLE, tableStyle);
  const tableHeadStyleObject = replaceDefaults(DEFAULT_TABLE_HEAD_STYLE, tableHeadStyle);
  const headerStyleObject = replaceDefaults(DEFAULT_HEADER_STYLE, headerStyle);
  const tableHeadCellStyleObject = replaceDefaults(DEFAULT_TABLE_HEAD_CELL_STYLE, tableHeadCellStyle);
  const addColumnIconStyleObject = replaceDefaults(DEFAULT_ADD_COLUMN_ICON_STYLE, addColumnIconStyle);
  const textStyleObject = replaceDefaults(DEFAULT_TEXT_STYLE, textStyle);
  const addColumnIconContainerStyleObject = replaceDefaults(DEFAULT_ADD_COLUMN_ICON_CONTAINER_STYLE, addColumnIconContainerStyle);
  const tableHeadBackgroundStyle = getHeaderBackgroundColor(tableHeadStyleObject);
  const oddRowStyleObject = replaceDefaults(DEFAULT_ODD_ROW_STYLE, oddRowStyle);
  const evenRowStyleObject = replaceDefaults(DEFAULT_EVEN_ROW_STYLE, evenRowStyle);
  const selectedRowStyleObject = replaceDefaults(DEFAULT_SELECTED_ROW_STYLE, selectedRowStyle);

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