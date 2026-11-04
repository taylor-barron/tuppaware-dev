"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { SORT_ASC, SORT_DESC, SORT_NONE } from './table-service';
import Button from "../../buttons/button";
import DropdownButton from "../../buttons/dropdownbutton";
import FlexBox from "../../containers/flexbox";
import Icon from "../../text/icon";
import Modal from "../../modals/modal";
import { renderCellValue, selectColumns, computeInitiallyShowActionColumn, ACTION_COLUMN_MAPTO } from "./table-service";
import OverlayModal from "../../modals/overlaymodal";
import VerticalList from "../list/verticallist";
import TableActionButton from "./table-action-button";

export default function TableMobile({
  tableClassName,
  tableStyleObject,
  tableHeadClassName,
  tableHeadStyleObject,
  columns,
  setColumns,
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
  getHeaderStyle,
  onColumnSort,
  addColumnIconStyle,
  tableHeadBackgroundStyle,
  columnSelectIconClass,
  sortAscendingIcon,
  sortDescendingIcon,
  unsortedIcon,
  addColumnIconContainerStyle,
  columnAddIconClass,
  maxMobileColumns,

}) {
  const [showActionColumn, setShowActionColumn] = useState(() =>
    computeInitiallyShowActionColumn(useActionsColumn, actionColumn, maxMobileColumns, columns)
  );

  const normalizedColumns = useMemo(
    () => selectColumns(columns, showActionColumn),
    [columns, showActionColumn]
  );

  const selectedCount = useMemo(
    () => columns.filter((column) => column.selected === true).length,
    [columns]
  );

  useLayoutEffect(() => {
    const selectionChanged = normalizedColumns.some(
      (column, index) => column.selected !== columns[index]?.selected
    );

    if (selectionChanged) {
      setColumns?.(normalizedColumns);
    }
  }, [normalizedColumns, columns, setColumns]);

  const [showModal, setShowModal] = useState(false);
  const [listItems, setListItems] = useState([]);
  const [replaceMapTo, setReplaceMapTo] = useState(null);

  const buildListItems = (mapTo, actionColumnIncluded) => {
    const items = columns
      .filter(column => !column.selected)
      .map(column => ({ name: column.name, mapto: column.mapto }));

    if (!actionColumnIncluded && useActionsColumn) {
      items.push({ name: actionColumn.name, mapto: ACTION_COLUMN_MAPTO });
    }

    if (mapTo) {
      const selectedColumn = columns.find(column => column.mapto === mapTo);
      const selectedColumnsCount = columns.filter(column => column.selected === true).length;
      if (selectedColumn && selectedColumnsCount > 1) { // should not be able to remove last column or reduce to just the action column
        items.push({ name: "Remove " + selectedColumn.name, mapto: "remove", backgroundColor: "#f8d7da", hoverColor: "#f5c6cb" });

      } else if (mapTo === ACTION_COLUMN_MAPTO) {
        items.push({ name: "Remove " + actionColumn.name, mapto: "remove", backgroundColor: "#f8d7da", hoverColor: "#f5c6cb" });
      }
    }

    setListItems(items);
  };

  const columnSelect = (mapTo) => {
    setReplaceMapTo(mapTo);
    buildListItems(mapTo, showActionColumn);
    setShowModal(true);
  };

  const handleSelection = (selectedItem) => {
    if (!selectedItem) return;

    if (selectedItem.mapto === ACTION_COLUMN_MAPTO) {
      setShowActionColumn(true);
    }

    if (replaceMapTo === ACTION_COLUMN_MAPTO) {
      setShowActionColumn(false);
    }

    const updatedColumns = columns.map((column) => {
      if (column.mapto === selectedItem.mapto) return { ...column, selected: true };
      if (column.mapto === replaceMapTo) return { ...column, selected: false };
      return column;
    });

    setColumns?.(updatedColumns);
    setReplaceMapTo(null);
    setShowModal(false);
  };

  const canAddColumn = showActionColumn ? selectedCount < (maxMobileColumns ?? columns.length) - 1 : selectedCount < (maxMobileColumns ?? columns.length);

  return (
    <>
      <FlexBox direction="row" vertical="flex-start">
        <table
          className={tableClassName}
          style={tableStyleObject}
        >
          <thead className={tableHeadClassName} style={tableHeadStyleObject}>
            <tr>
              {columns.map((column, columnIndex) => column.selected ? (
                <th key={columnIndex} className={tableHeadCellClassName}>
                  <FlexBox direction="row" horizontal="space-between" style={{ cursor: "pointer", backgroundColor: tableHeadBackgroundStyle }}>
                    <FlexBox direction="row" horizontal="space-between" vertical="center" style={{ backgroundColor: tableHeadBackgroundStyle}}>
                      <Icon className={columnSelectIconClass} style={{ marginRight: "0.75rem" }} onClick={() => {columnSelect(column.mapto)}} />

                      {column.name}
                    </FlexBox>

                    <FlexBox direction="row" horizontal="space-between" vertical="center" style={{ backgroundColor: tableHeadBackgroundStyle }} onClick={() => onColumnSort(columnIndex)}>
                      {column.sort === SORT_ASC && <Icon className={sortAscendingIcon} />}
                      {column.sort === SORT_DESC && <Icon className={sortDescendingIcon} />}
                      {(column.sort === SORT_NONE || column.sort == null || column.sort === undefined) && <Icon className={unsortedIcon} />}
                    </FlexBox>
                  </FlexBox>
                </th>
              ) : null)}

              {showActionColumn && (
                <th className={tableHeadCellClassName}>
                  <FlexBox direction="row" horizontal="left" vertical="center" style={{ backgroundColor: tableHeadBackgroundStyle }}>
                    <Icon className={columnSelectIconClass} style={{ marginRight: "0.75rem" }} onClick={() => columnSelect(ACTION_COLUMN_MAPTO)}/>

                    {actionColumn.name}
                  </FlexBox>
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => {
              const rowStyle = showSelected && selectedRowIndex === rowIndex
                ? { ...defaultSelectedRowStyle, ...selectedRowStyle }
                : rowIndex % 2 === 0
                  ? { ...defaultEvenRowStyle, ...evenRowStyle }
                  : { ...defaultOddRowStyle, ...oddRowStyle };

              const rowBackground = rowStyle.backgroundColor;

              const rowDropdownItems = (dropdownButtonData?.dropdownItems ?? []).map((item) => ({
                ...item,
                action: item.action ? () => item.action(row, rowIndex) : undefined,
              }));

              return (
                <tr
                  key={rowIndex}
                  style={rowStyle}
                  onClick={() => handleRowClick?.(row, rowIndex)}
                >
                  {columns.map((column, columnIndex) =>
                    column.selected ? (
                      <td
                        key={columnIndex}
                        style={{
                          ...getBodyCellStyle?.(columnIndex),
                          ...(rowBackground != null && { backgroundColor: rowBackground }),
                        }}
                      >
                        {renderCellValue(row?.data?.[column.mapto])}
                      </td>
                    ) : null
                  )}

                  <TableActionButton
                    isVisible={showActionColumn}
                    columns={columns}
                    getActionCellStyle={getActionCellStyle}
                    rowBackground={rowBackground}
                    useDropdownButton={useDropdownButton}
                    dropdownButtonData={dropdownButtonData}
                    rowDropdownItems={rowDropdownItems}
                    useActionButton={useActionButton}
                    actionButtonData={actionButtonData}
                    row={row}
                    rowIndex={rowIndex}
                  />
                </tr>
              );
            })}
          </tbody>
        </table>

        {canAddColumn && (
          <FlexBox direction="row" horizontal="space-between" vertical="center" style={addColumnIconContainerStyle} onClick={() => columnSelect(null)}>
            <Icon className={columnAddIconClass} style={addColumnIconStyle} />
          </FlexBox>
        )}
      </FlexBox>

      {showModal && (
        <OverlayModal isOpen={showModal} onClose={() => setShowModal(false)}>
          <VerticalList
            listItems={listItems}
            onSelection={handleSelection}
          ></VerticalList>
        </OverlayModal>
      )}
    </>
  );
}