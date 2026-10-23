"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { SORT_ASC, SORT_DESC, SORT_NONE } from './table-service';
import Button from "../../buttons/button";
import DropdownButton from "../../buttons/dropdownbutton";
import FlexBox from "../../containers/flexbox";
import Icon from "../../text/icon";
import Modal from "../../modals/modal";
import { renderCellValue, selectColumns } from "./table-service";
import OverlayModal from "../../modals/overlaymodal";
import VerticalList from "../list/verticallist";

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

  const [showModal, setShowModal] = useState(false);
  const [listItems, setListItems] = useState([]);
  const [replaceMapTo, setReplaceMapTo] = useState(null);

  const buildListItems = () => {
    const items = columns
      .filter(column => !column.selected)
      .map(column => ({ name: column.name, mapto: column.mapto }));
    setListItems(items);
  };

  const columnSelect = (mapTo) => {
    setReplaceMapTo(mapTo);
    buildListItems();
    setShowModal(true);
  };

  const handleSelection = (selectedItem) => {
    if (!replaceMapTo || !selectedItem) return;

    const updatedColumns = columns.map((column) => {
      if (column.mapto === selectedItem.mapto) return { ...column, selected: true };
      if (column.mapto === replaceMapTo) return { ...column, selected: false };
      return column;
    });

    onColumnsChange?.({ columns: updatedColumns });
    setReplaceMapTo(null);
    setShowModal(false);
  };

  // TODO: + icon, action button, styling, testing

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
                  <FlexBox direction="row" horizontal="space-between" vertical="center">
                    <Icon className={columnSelectIconClass} style={{ marginRight: "0.75rem" }} onClick={() => {columnSelect(column.mapto)}} />

                    {column.name}
                  </FlexBox>

                  <FlexBox direction="row" horizontal="space-between" vertical="center">
                    {column.sort === SORT_ASC && <Icon className={sortAscendingIcon} />}
                    {column.sort === SORT_DESC && <Icon className={sortDescendingIcon} />}
                    {(column.sort === SORT_NONE || column.sort == null || column.sort === undefined) && <Icon className={unsortedIcon} />}
                  </FlexBox>
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