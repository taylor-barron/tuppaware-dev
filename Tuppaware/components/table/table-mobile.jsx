"use client";

import { useLayoutEffect, useMemo } from "react";
import { SORT_ASC, SORT_DESC, SORT_NONE } from './table-service';
import Button from "../../buttons/button";
import DropdownButton from "../../buttons/dropdownbutton";
import FlexBox from "../../containers/flexbox";
import Icon from "../../text/icon";
import { renderCellValue, selectColumns } from "./table-service";

export default function TableMobile({
  tableClassName,
  tableStyleObject,
  tableHeadClassName,
  tableHeadStyleObject,
  columns,
  tableHeadCellClassName,
  useActionsColumn,
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
  tableHeadBackgroundStyle,
  columnSelectIconClass,
  onColumnsChange,
  sortAscendingIcon,
  sortDescendingIcon,
  unsortedIcon,

}) {
  const normalizedColumns = useMemo(
    () => selectColumns(columns),
    [columns]
  );

  useLayoutEffect(() => {
    const selectionChanged = normalizedColumns.some(
      (column, index) => column.selected !== columns[index]?.selected
    );

    if (selectionChanged) {
      onColumnsChange?.({ columns: normalizedColumns });
    }
  }, [normalizedColumns, columns, onColumnsChange]);

  return (
    <>
      <table
        className={tableClassName}
        style={tableStyleObject}
      >
        <thead className={tableHeadClassName} style={tableHeadStyleObject}>
          <tr>
            {columns.map((column, columnIndex) => column.selected ? (
              <th key={columnIndex} className={tableHeadCellClassName}>
                <FlexBox direction="row" horizontal="space-between" style={{ cursor: "pointer", backgroundColor: tableHeadBackgroundStyle }}>
                  {column.name}

                  <FlexBox direction="row" horizontal="space-between" vertical="center"></FlexBox>
                    <Icon className={columnSelectIconClass} />

                    {column.sort === SORT_ASC && <Icon className={sortAscendingIcon} />}
                    {column.sort === SORT_DESC && <Icon className={sortDescendingIcon} />}
                    {(column.sort === SORT_NONE || column.sort == null || column.sort === undefined) && <Icon className={unsortedIcon} />}
                  </FlexBox>
              </th>
            ) : null)}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              style={
                showSelected && selectedRowIndex === rowIndex
                  ? selectedRowStyle || defaultSelectedRowStyle
                  : rowIndex % 2 === 0
                  ? evenRowStyle || defaultEvenRowStyle
                  : oddRowStyle || defaultOddRowStyle
              }
              onClick={() => handleRowClick?.(row, rowIndex)}
            >
              {columns.map((column, columnIndex) =>
                column.selected ? (
                  <td key={columnIndex} style={getBodyCellStyle?.(columnIndex)}>
                    {renderCellValue(row?.data?.[column.mapto])}
                  </td>
                ) : null
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* put modal for column selection */}
    </>
  );
}