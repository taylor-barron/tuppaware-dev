tests need to cover:


important data structures:

Example Columns:
  const [columns, setColumns] = useState([
    { name: "Name", mapto: "name", length: 150, index: 0 },
    { name: "Age", mapto: "age", index: 1 },
    { name: "Location", mapto: "location", index: 2 },
    { name: "Email", mapto: "email", index: 3 },
  ]);

Example Rows:
  const [rows, setRows] = useState([
    { data: { name: "John Doe", age: 30, location: "New York", email: "john@example.com" }, selected: false },
    { data: { name: "Jane Smith", age: 25, location: "Los Angeles", email: "jane@example.com" }, selected: false },
    { data: { name: "Sam Johnson", age: 35, location: "Chicago", email: "sam@example.com" }, selected: false },
    { data: { name: "Emily Davis", age: 28, location: "Houston", email: "emily@example.com" }, selected: false },
    { data: { name: "Michael Brown", age: 32, location: "Phoenix", email: "michael@example.com" }, selected: false },
  ]);

Example Action Column:
  const [actionColumn, setActionColumn] = useState({ name: "Actions", length: 175 });
```
This is the code block that represents the suggested code change:
```markdown
tests need to cover:

## table-service.js

### Constants
- [ ] `SORT_ASC`, `SORT_DESC`, `SORT_NONE`, `ACTION_COLUMN_MAPTO` have expected values

### useEmitColumnChanges
- [ ] returns a callback
- [ ] maps `widths[idx]` onto each column's `length`
- [ ] leaves a column unchanged when its width is not finite or <= 0
- [ ] returns the same column object when the length is unchanged
- [ ] sets the action column `length` from `widths[columns.length]` only when `useActionsColumn` is true
- [ ] calls `onColumnsChange({ columns, actionColumn })`
- [ ] does not call `onColumnsChange` twice for an identical signature
- [ ] calls `onColumnsChange` again when widths change

### getMeasuredWidth
- [ ] returns `offsetWidth` when it is a positive number
- [ ] returns `actionColWidth` for the last index when `useActionsColumn` is true
- [ ] returns `fallbackWidth` (default 160) otherwise
- [ ] respects a custom `fallbackWidth`

### useInitializeColumnWidths
- [ ] sets empty widths when `totalColumns` is 0
- [ ] prefers latest widths, then `column.length`, then `actionColumn.length`, then measured width, then fallback
- [ ] uses `actionColWidth` for the action column fallback
- [ ] does nothing while `isResizingRef.current` is true
- [ ] does not set state or emit when widths are unchanged
- [ ] sets state, updates `latestWidthsRef`, and emits when widths change

### handleResizeEvent
- [ ] does nothing without resize state or when neighbors are missing
- [ ] non-cascade: grows the dragged column and shrinks its right neighbor by the same amount
- [ ] non-cascade: clamps to `minColWidth` in both directions
- [ ] total width stays constant
- [ ] cascade right: takes from the nearest right column first, then continues outward
- [ ] cascade right: stops when all right columns are at `minColWidth`
- [ ] cascade left: shrinks the dragged column first, then columns further left
- [ ] cascade left: right neighbor grows by the applied amount
- [ ] reversing a drag restores the original widths
- [ ] updates `latestWidthsRef` and calls `setColumnWidths`

### startResizeInteraction / stopResizeInteraction
- [ ] start: prevents default and stops propagation
- [ ] start: does nothing for the last column index
- [ ] start: builds `startWidths` using the same priority as initialization
- [ ] start: sets `isResizingRef`, `resizeStateRef`, `latestWidthsRef`
- [ ] start: adds `mousemove`/`mouseup` listeners and sets body cursor and userSelect
- [ ] stop: clears refs, emits the latest widths, removes listeners, resets body styles

### renderCellValue
- [ ] `null`/`undefined` returns `""`
- [ ] object returns JSON string
- [ ] string/number/boolean are returned as is

### handleRowClick (service)
- [ ] sets the selected index only when `writeable` and `showSelected` are both true
- [ ] does not set the selected index when either is false
- [ ] calls `onRowClick(row, rowIndex)` when it is a function
- [ ] tolerates a non-function `onRowClick`

### getHeaderStyle / getBodyCellStyle / getActionCellStyle
- [ ] width is `${px}px` when a width exists, `undefined` otherwise
- [ ] `borderRight` is present except on the last column
- [ ] header style merges `tableHeadCellStyleObject` and keeps its base properties
- [ ] body cell style includes padding and overflow rules
- [ ] action cell style has `overflow: visible` and `position: relative`

### ensureRowsHaveOrder
- [ ] returns `[]` for non-arrays
- [ ] adds the order key by index when missing
- [ ] keeps an existing finite order value
- [ ] uses a custom `rowOrderKey`
- [ ] wraps primitive/array rows as `{ data: [row], order }`
- [ ] does not mutate the input

### sortRows
- [ ] returns `[]` for non-array rows or columns
- [ ] adds `originalOrder` when missing
- [ ] `asc` sorts by `row.data[mapto]` ascending (strings and numbers)
- [ ] `desc` sorts descending
- [ ] `none` restores original order
- [ ] undefined sort returns rows (currently returns `undefined`, so this test should expose the bug)
- [ ] unknown sort logs an error and returns copies
- [ ] does not mutate input rows

### numberRows
- [ ] assigns `order` 0..n-1 in array order
- [ ] returns `[]` for non-arrays
- [ ] (documents that it currently mutates the input rows)

### updateColumns
- [ ] cycle: none/undefined → asc → desc → none
- [ ] all other columns are reset to `none`
- [ ] returns `[]` for non-arrays
- [ ] does not mutate input columns

### getHeaderBackgroundColor
- [ ] returns `backgroundColor` from the style object
- [ ] returns `"transparent"` when missing or the object is undefined

### selectColumns
- [ ] returns `[]` for non-arrays
- [ ] preserves existing `selected: true` values
- [ ] with none selected: selects the first two columns
- [ ] with none selected and `actionColumnIncluded`: selects only the first column
- [ ] sets `selected: false` on unselected columns
- [ ] `selected`/`removed` position arguments work
- [ ] does not mutate input

### computeInitiallyShowActionColumn
- [ ] false when `useActionsColumn` is false, `actionColumn` is missing, or `columns` is not an array
- [ ] true when selected count < `maxMobileColumns`
- [ ] false when selected count >= `maxMobileColumns`
- [ ] falls back to `columns.length` when `maxMobileColumns` is null

### validateTableProps (if added)
- [ ] error when both `useActionButton` and `useDropdownButton` are true
- [ ] error when a `mapto` equals `ACTION_COLUMN_MAPTO`
- [ ] error for missing or duplicate `mapto`
- [ ] error when `rowOrderKey` conflicts with a `mapto`
- [ ] no errors for valid props

## table-action-button.jsx

### Visibility
- [ ] renders nothing when `isVisible` is false
- [ ] renders a `<td>` when true

### Cell styling
- [ ] applies `getActionCellStyle(columns.length)`
- [ ] applies `rowBackground` as `backgroundColor` when provided
- [ ] no background override when `rowBackground` is null/undefined

### Dropdown button
- [ ] renders `DropdownButton` when `useDropdownButton` is true (takes priority over action button)
- [ ] passes every `dropdownButtonData` style/class prop through
- [ ] passes `rowDropdownItems` as `dropdownItems`
- [ ] renders `dropdownButtonData.text`
- [ ] click stops propagation and calls `onButtonClick(row, rowIndex)`
- [ ] click without `onButtonClick` does not throw

### Action button
- [ ] renders `Button` when `useActionButton` is true and `useDropdownButton` is false
- [ ] passes style, class, and icon props through
- [ ] renders `actionButtonData.text`
- [ ] click stops propagation (row click not fired) and calls `onClick(row, rowIndex)`
- [ ] click without `onClick` does not throw

### Neither
- [ ] renders an empty `<td>` when both flags are false

## table-desktop.jsx

### Header
- [ ] renders one `<th>` per column with `column.name`
- [ ] applies `tableClassName`, `tableHeadClassName`, `tableHeadCellClassName`, `headerClassName`
- [ ] applies `tableStyleObject` (with `tableLayout: fixed`), `tableHeadStyleObject`, and `headerStyleObject`
- [ ] applies `getHeaderStyle(index)` to each `<th>`
- [ ] header background uses `tableHeadBackgroundStyle`
- [ ] registers each `<th>` in `headerRefs`
- [ ] renders the action `<th>` with `actionColumn.name` only when `useActionsColumn` is true

### Sort icons
- [ ] `asc` shows `sortAscendingIcon`
- [ ] `desc` shows `sortDescendingIcon`
- [ ] `none`/undefined shows `unsortedIcon`
- [ ] clicking a header calls `onColumnSort(index)`

### Resize handles
- [ ] rendered for every column except the last
- [ ] `mousedown` calls `startResize(event, index)`
- [ ] not rendered on the final column or when the action column is last

### Body
- [ ] one row per entry in `rows`, one cell per column
- [ ] cell values come from `row.data[column.mapto]` through `renderCellValue`
- [ ] missing values render empty, objects render as JSON
- [ ] even/odd rows use `evenRowStyleObject`/`oddRowStyleObject`
- [ ] selected row uses `selectedRowStyleObject` only when `showSelected` is true
- [ ] `textClassName` and `textStyleObject` are applied to cell text
- [ ] `getBodyCellStyle` is applied to each cell
- [ ] row click calls `handleRowClick(row, rowIndex)`
- [ ] `rowDropdownItems` binds each `action` to `(row, rowIndex)` and tolerates a missing `dropdownItems`
- [ ] `TableActionButton` is visible only when `useActionsColumn` is true

## table-mobile.jsx

### Initial state
- [ ] `showActionColumn` is initialized from `computeInitiallyShowActionColumn`
- [ ] with no selections, `setColumns` is called with normalized selections
- [ ] `setColumns` is not called when nothing changed (no render loop)

### Header
- [ ] only selected columns render a `<th>`
- [ ] action `<th>` renders only when `showActionColumn` is true
- [ ] header class and style props are applied (same as desktop)
- [ ] column select icon uses `columnSelectIconClass`
- [ ] sort icons match `sort` state and clicking calls `onColumnSort(columnIndex)`

### Body
- [ ] only selected columns render cells
- [ ] row styles (even/odd/selected) apply to `<tr>` and to each cell background
- [ ] row click calls `handleRowClick`
- [ ] action cell receives `rowBackground`
- [ ] `rowDropdownItems` binds actions to the row

### Add column tab
- [ ] shown only when `canAddColumn` is true
- [ ] hidden when selected count reaches `maxMobileColumns`
- [ ] with the action column shown, the limit is `maxMobileColumns - 1` data columns
- [ ] applies `addColumnIconContainerStyleObject`, `addColumnIconStyleObject`, `columnAddIconClass`
- [ ] click opens the modal

### Modal and selection
- [ ] clicking a header icon opens the modal with unselected columns
- [ ] the action column appears in the list only when `useActionsColumn` is true and it is not shown
- [ ] "Remove X" appears only when more than one column is selected
- [ ] "Remove Actions" appears when replacing the action column
- [ ] "Remove" items have `backgroundColor` and `hoverColor`
- [ ] selecting an item swaps `selected` flags by `mapto` and calls `setColumns`
- [ ] adding (no `replaceMapTo`) selects the new column only
- [ ] selecting the action column sets `showActionColumn` true; replacing it sets false
- [ ] the modal closes after selection
- [ ] the modal can be reopened after closing
- [ ] does not mutate the `columns` prop

## table.jsx

### Defaults (render with only `columns` and `rowData`)
- [ ] renders desktop when above the breakpoint and mobile when below
- [ ] default `mobileBreakPoint` is 768 and a custom value is respected
- [ ] default styles are applied for table, head, header, text, head cell, odd/even/selected rows, add-column container
- [ ] default icon classes: `fa fa-caret-up`, `fa fa-caret-down`, `fa fa-sort`, `fa fa-bars`, `fa fa-plus`
- [ ] defaults for `maxMobileColumns` (3), `minColWidth` (80), `rowOrderKey` ("order"), `cascadeResize` (false), `writeable` (true), `showSelected` (true)

### Style overrides
- [ ] each of `tableStyle`, `tableHeadStyle`, `headerStyle`, `textStyle`, `tableHeadCellStyle`, `oddRowStyle`, `evenRowStyle`, `selectedRowStyle`, `addColumnIconStyle`, `addColumnIconContainerStyle` overrides only the keys provided and keeps the other defaults
- [ ] each `default*Style` prop replaces the defaults
- [ ] each className prop is applied
- [ ] `tableHeadStyle.backgroundColor` flows into header backgrounds and the mobile add tab if applicable
- [ ] icon class props override the defaults

### Rows
- [ ] `rowData` as an array or as `{ data: [...] }` both work
- [ ] invalid `rowData` renders no rows
- [ ] rows missing the order key get one; a custom `rowOrderKey` is used

### Row selection and click
- [ ] initial selected row comes from `rows[].selected`
- [ ] clicking selects the row when `writeable` and `showSelected`
- [ ] no selection when `writeable` is false or `showSelected` is false
- [ ] `onRowClick` is called with `(row, rowIndex)` after the selected style is painted (two animation frames)
- [ ] pending click is cancelled on unmount

### Sorting
- [ ] default `onColumnSort` cycles none → asc → desc → none
- [ ] default handler calls `setColumns` with updated sort values and `setRows` with reordered, renumbered rows
- [ ] sorting a different column resets the others to `none`
- [ ] a custom `onColumnSort` replaces the default and receives the column index
- [ ] works in both desktop and mobile layouts

### Column widths and resizing
- [ ] initial widths use `column.length`, falling back to measured/160
- [ ] action column uses `actionColumn.length`, then `actionColWidth`
- [ ] dragging a handle changes widths and respects `minColWidth`
- [ ] `cascadeResize` true takes space from further columns; false only from the neighbor
- [ ] `onColumnsChange` fires on mouse up with updated `length` values and the action column length
- [ ] not emitted repeatedly for unchanged widths
- [ ] listeners and body styles are cleaned up on unmount

### Action column and buttons
- [ ] `useActionsColumn` shows/hides the action column and `totalColumns` includes it
- [ ] `actionColumn.name` is displayed
- [ ] `useActionButton` renders a button wired to `actionButtonData`
- [ ] `useDropdownButton` renders a dropdown wired to `dropdownButtonData`
- [ ] both flags true produces an error (validation)

### Mobile-specific props
- [ ] `setColumns` receives selection changes
- [ ] `maxMobileColumns`, `columnSelectIconClass`, `columnAddIconClass`, and add-column style props are respected

### Validation (if added)
- [ ] throws in development for invalid props, logs in production
- [ ] reserved `mapto` "actionColumn" is rejected
- [ ] no error for valid props

## Top-level control (integration, parent component owning state)
- [ ] a parent with `useState` for columns, rows, and action column can fully drive the table
- [ ] parent `setColumns` receives sort, selection, and normalization updates and re-renders correctly
- [ ] parent `setRows` receives sorted rows
- [ ] parent `onColumnsChange` receives resize updates
- [ ] changing parent state (columns, rows, flags, styles) updates the table
- [ ] toggling `useActionsColumn`, `useActionButton`, `useDropdownButton` changes the rendered output
- [ ] resizing the viewport across the breakpoint switches layouts while keeping data
- [ ] full flow: sort, select a row, resize a column, switch columns on mobile, all driven by props


