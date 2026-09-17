"use client";

import { SORT_ASC, SORT_DESC, SORT_NONE } from './table-service';
import Button from "../../buttons/button";
import DropdownButton from "../../buttons/dropdownbutton";
import { renderCellValue } from "./table-service";
import FlexBox from "../../containers/flexbox";
import Icon from "../../text/icon";

export default function TableDesktop({
  tableClassName,
  tableStyleObject,
  tableHeadClassName,
  tableHeadStyleObject,
  tableHeadBackgroundStyle,
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
  headerRefs,
  totalColumns,
  getHeaderStyle,
  startResize,
  onColumnSort,
  sortDescendingIcon,
  sortAscendingIcon,
  unsortedIcon,

}) {
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
              <FlexBox direction="row" horizontal="space-between" onClick={() => onColumnSort(index)} style={{ cursor: "pointer", backgroundColor: tableHeadBackgroundStyle }}>
                {header.name}

                {header.sort === SORT_ASC && <Icon className={sortAscendingIcon} />}
                {header.sort === SORT_DESC && <Icon className={sortDescendingIcon} />}
                {(header.sort === SORT_NONE || header.sort == null || header.sort === undefined) && <Icon className={unsortedIcon} />}
              </FlexBox>
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
                action: typeof item?.action === "function" ? () => item.action(row, rowIndex) : item?.action,
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