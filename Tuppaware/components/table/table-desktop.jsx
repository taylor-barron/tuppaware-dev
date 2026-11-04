"use client";

import { SORT_ASC, SORT_DESC, SORT_NONE } from './table-service';
import { renderCellValue } from "./table-service";
import FlexBox from "../../containers/flexbox";
import Header from "../../text/header";
import Icon from "../../text/icon";
import TableActionButton from "./table-action-button";

export default function TableDesktop({
  tableClassName,
  tableStyleObject,
  tableHeadClassName,
  tableHeadStyleObject,
  tableHeadBackgroundStyle,
  headerClassName,
  headerStyleObject,
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
                <Header className={headerClassName} style={headerStyleObject }>{header.name}</Header>

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
              <Header className={headerClassName} style={headerStyleObject}>{actionColumn.name}</Header>
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

          const rowDropdownItems = Array.isArray(dropdownButtonData.dropdownItems)
            ? dropdownButtonData.dropdownItems.map((item) => ({
                ...item,
                action: typeof item?.action === "function" ? () => item.action(row, rowIndex) : item?.action,
              }))
            : [];
          return (
            <tr key={rowIndex} style={rowStyle} onClick={() => handleRowClick(row, rowIndex)}>
              {columns.map((column, cellIndex) => (
                <td key={cellIndex} style={getBodyCellStyle(cellIndex)}>
                  {renderCellValue(row?.data?.[column.mapto])}
                </td>
              ))}

              <TableActionButton
                isVisible={useActionsColumn}
                columns={columns}
                getActionCellStyle={getActionCellStyle}
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
  );
}