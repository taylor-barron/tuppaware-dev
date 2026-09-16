import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Table from "./table";
import { SORT_ASC, SORT_DESC, SORT_NONE, sortRows, updateColumns } from "./table-service";
import { useState } from "react";

const baseColumns = [{ name: "Name" }, { name: "Age" }];
const baseRows = [{ data: ["Taylor", "32"] }];
const stableActionColumn = { name: "Actions" };

describe("Table", () => {
  it("renders headers and row data", () => {
    render(
      <Table
        columns={baseColumns}
        rowData={baseRows}
        useActionsColumn={false}
      />
    );

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByText("Taylor")).toBeInTheDocument();
    expect(screen.getByText("32")).toBeInTheDocument();
  });

  it("calls onRowClick with row and rowIndex", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();

    render(
      <Table
        columns={baseColumns}
        rowData={baseRows}
        useActionsColumn={false}
        onRowClick={onRowClick}
      />
    );

    await user.click(screen.getByText("Taylor"));
    expect(onRowClick).toHaveBeenCalledWith(
      expect.objectContaining({ data: ["Taylor", "32"] }),
      0
    );
  });

  it("allows columns to be resized", () => {
    const { container } = render(
      <Table
        columns={baseColumns}
        rowData={baseRows}
        useActionsColumn={false}
      />
    );

    const headers = container.querySelectorAll("th");
    const firstHeader = headers[0];
    const resizeHandle = firstHeader.querySelector("div[style*='col-resize']");

    expect(firstHeader.style.width).toBe("160px");
    expect(resizeHandle).toBeTruthy();

    fireEvent.mouseDown(resizeHandle, { clientX: 100 });
    fireEvent.mouseMove(window, { clientX: 140 });
    fireEvent.mouseUp(window);

    expect(firstHeader.style.width).toBe("200px");
  });

  it("can display action button", () => {
    render(
      <Table
        columns={baseColumns}
        rowData={baseRows}
        useActionsColumn
        actionColumn={stableActionColumn}
        useActionButton
        actionButtonData={{ text: "Edit" }}
      />
    );

    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("displays icons and text in action button", () => {
    const { container } = render(
      <Table
        columns={baseColumns}
        rowData={baseRows}
        useActionsColumn
        actionColumn={stableActionColumn}
        useActionButton
        actionButtonData={{
          text: "Edit",
          leadingIconClassName: "fa fa-pencil",
          trailingIconClassName: "fa fa-angle-right",
        }}
      />
    );

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(container.querySelector(".fa-pencil")).toBeInTheDocument();
    expect(container.querySelector(".fa-angle-right")).toBeInTheDocument();
  });

  it("runs action button click callback with row + rowIndex", async () => {
    const user = userEvent.setup();
    const onButtonClick = vi.fn();

    render(
      <Table
        columns={baseColumns}
        rowData={baseRows}
        useActionsColumn
        actionColumn={stableActionColumn}
        useActionButton
        actionButtonData={{
          text: "Edit",
          onButtonClick,
        }}
      />
    );

    await user.click(screen.getByText("Edit"));
    expect(onButtonClick).toHaveBeenCalledWith(
      expect.objectContaining({ data: ["Taylor", "32"] }),
      0
    );
  });

  it("can open dropdown button menu", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Table
        columns={baseColumns}
        rowData={baseRows}
        useActionsColumn
        actionColumn={stableActionColumn}
        useDropdownButton
        dropdownButtonData={{
          text: "More",
          dropdownItems: [{ title: "Option 1", action: vi.fn() }],
        }}
      />
    );

    expect(screen.getByText("More")).toBeInTheDocument();

    const caret = container.querySelector(".fa-caret-down");
    expect(caret).toBeInTheDocument();

    await user.click(caret);
    expect(screen.getByText("Option 1")).toBeInTheDocument();
  });

  it("runs dropdown main button click callback with row + rowIndex", async () => {
    const user = userEvent.setup();
    const onButtonClick = vi.fn();

    render(
      <Table
        columns={baseColumns}
        rowData={baseRows}
        useActionsColumn
        actionColumn={stableActionColumn}
        useDropdownButton
        dropdownButtonData={{
          text: "More",
          onButtonClick,
          dropdownItems: [{ title: "Option 1", action: vi.fn() }],
        }}
      />
    );

    await user.click(screen.getByText("More"));
    expect(onButtonClick).toHaveBeenCalledWith(
      expect.objectContaining({ data: ["Taylor", "32"] }),
      0
    );
  });

  it("displays dropdown button text + icons + dropdown options", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Table
        columns={baseColumns}
        rowData={baseRows}
        useActionsColumn
        actionColumn={stableActionColumn}
        useDropdownButton
        dropdownButtonData={{
          text: "More",
          leadingIconClassName: "fa fa-gear",
          trailingIconClassName: "fa fa-chevron-right",
          dropdownItems: [
            { title: "Option 1", action: vi.fn() },
            { title: "Option 2", action: vi.fn() },
          ],
        }}
      />
    );

    expect(screen.getByText("More")).toBeInTheDocument();
    expect(container.querySelector(".fa-gear")).toBeInTheDocument();
    expect(container.querySelector(".fa-chevron-right")).toBeInTheDocument();

    const caret = container.querySelector(".fa-caret-down");
    await user.click(caret);

    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  it("runs dropdown item action with row + rowIndex", async () => {
    const user = userEvent.setup();
    const optionAction = vi.fn();

    render(
      <Table
        columns={baseColumns}
        rowData={baseRows}
        useActionsColumn
        actionColumn={stableActionColumn}
        useDropdownButton
        dropdownButtonData={{
          text: "More",
          dropdownItems: [{ title: "Option 2", action: optionAction }],
        }}
      />
    );

    await user.click(screen.getByText("More")); // main button (safe)
    const caret = document.querySelector(".fa-caret-down");
    if (caret) await user.click(caret); // ensure menu is open if main click didn't open it

    await user.click(screen.getByText("Option 2"));
    expect(optionAction).toHaveBeenCalledWith(
      expect.objectContaining({ data: ["Taylor", "32"] }),
      0
    );
  });

  it("applies style overrides from props", () => {
    const { container } = render(
      <Table
        columns={baseColumns}
        rowData={baseRows}
        useActionsColumn={false}
        tableStyle={{ width: "90%" }}
        tableHeadStyle={{ textAlign: "center" }}
        tableHeadCellStyle={{ padding: "20px" }}
        evenRowStyle={{ backgroundColor: "pink" }}
      />
    );

    const table = screen.getByRole("table");
    const thead = container.querySelector("thead");
    const firstHeader = container.querySelector("th");
    const firstRow = container.querySelector("tbody tr");

    expect(table).toHaveStyle("width: 90%");
    expect(thead).toHaveStyle("text-align: center");
    expect(firstHeader).toHaveStyle("padding: 20px");
    expect(firstRow).toHaveStyle("background-color: rgb(255, 192, 203)");
  });

  it.skip("changes to mobile style below mobile break point", () => {
    window.innerWidth = 500;
    window.dispatchEvent(new Event("resize"));

    render(
      <Table
        columns={baseColumns}
        rowData={baseRows}
        mobileBreakPoint={768}
        useActionsColumn={false}
      />
    );

    // Intentionally failing for now: mobile mode is not implemented yet.
    expect(screen.getByRole("table")).toHaveStyle("display: block");
  });

  it("sets default row order on initialization when missing", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();

    const rowsWithoutOrder = [
      { data: ["Taylor", "32"] },
      { data: ["Alex", "28"] },
    ];

    render(
      <Table
        columns={baseColumns}
        rowData={rowsWithoutOrder}
        useActionsColumn={false}
        onRowClick={onRowClick}
      />
    );

    await user.click(screen.getByText("Alex"));

    expect(onRowClick).toHaveBeenCalledTimes(1);
    const [clickedRow, clickedIndex] = onRowClick.mock.calls[0];

    expect(clickedIndex).toBe(1);
    expect(clickedRow).toMatchObject({
      data: ["Alex", "28"],
      order: 1,
    });
  });

  it("preserves existing row order on initialization", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();

    const rowsWithOrder = [{ data: ["Taylor", "32"], order: 99 }];

    render(
      <Table
        columns={baseColumns}
        rowData={rowsWithOrder}
        useActionsColumn={false}
        onRowClick={onRowClick}
      />
    );

    await user.click(screen.getByText("Taylor"));

    expect(onRowClick).toHaveBeenCalledTimes(1);
    const [clickedRow, clickedIndex] = onRowClick.mock.calls[0];

    expect(clickedIndex).toBe(0);
    expect(clickedRow).toMatchObject({
      data: ["Taylor", "32"],
      order: 99,
    });
  });
});

describe("updateColumns", () => {
  const cols = () => [{ name: "Name" }, { name: "Age" }, { name: "Location" }];

  it("sets a column with no sort value to ascending on first click", () => {
    expect(updateColumns(cols(), 1)[1].sort).toBe(SORT_ASC);
  });

  it("clears every other column to SORT_NONE", () => {
    const result = updateColumns(cols(), 1);
    expect(result[0].sort).toBe(SORT_NONE);
    expect(result[1].sort).toBe(SORT_ASC);
    expect(result[2].sort).toBe(SORT_NONE);
  });

  it("cycles SORT_NONE -> SORT_ASC -> SORT_DESC -> SORT_NONE", () => {
    let result = updateColumns(cols(), 0);
    expect(result[0].sort).toBe(SORT_ASC);
    result = updateColumns(result, 0);
    expect(result[0].sort).toBe(SORT_DESC);
    result = updateColumns(result, 0);
    expect(result[0].sort).toBe(SORT_NONE);
    result = updateColumns(result, 0);
    expect(result[0].sort).toBe(SORT_ASC);
  });

  it("does not mutate the input columns", () => {
    const input = cols().map((c) => Object.freeze(c));
    const result = updateColumns(input, 0);
    expect(result).not.toBe(input);
    expect(input.every((c) => !("sort" in c))).toBe(true);
  });

  it("returns an empty array for non-array input", () => {
    expect(updateColumns(null, 0)).toEqual([]);
    expect(updateColumns(undefined, 0)).toEqual([]);
  });
});

describe("sortRows", () => {
  const stringRows = () => [
    { data: ["Charlie", 35] },
    { data: ["Alice", 25] },
    { data: ["Bob", 30] },
  ];
  const namesOf = (rows) => rows.map((r) => r.data[0]);
  const agesOf = (rows) => rows.map((r) => r.data[1]);

  it("sorts string values ascending", () => {
    expect(namesOf(sortRows(stringRows(), [{ sort: SORT_ASC }], 0))).toEqual(["Alice", "Bob", "Charlie"]);
  });

  it("sorts string values descending", () => {
    expect(namesOf(sortRows(stringRows(), [{ sort: SORT_DESC }], 0))).toEqual(["Charlie", "Bob", "Alice"]);
  });

  it("sorts numeric values ascending", () => {
    expect(agesOf(sortRows(stringRows(), [null, { sort: SORT_ASC }], 1))).toEqual([25, 30, 35]);
  });

  it("sorts numeric values descending", () => {
    expect(agesOf(sortRows(stringRows(), [null, { sort: SORT_DESC }], 1))).toEqual([35, 30, 25]);
  });

  it("SORT_NONE restores the original order after sorting", () => {
    const asc = sortRows(stringRows(), [{ sort: SORT_ASC }], 0);
    expect(namesOf(sortRows(asc, [{ sort: SORT_NONE }], 0))).toEqual(["Charlie", "Alice", "Bob"]);
  });

  it("stamps originalOrder on rows that do not have it", () => {
    const sorted = sortRows(stringRows(), [{ sort: SORT_ASC }], 0);
    expect(sorted.find((r) => r.data[0] === "Charlie").originalOrder).toBe(0);
    expect(sorted.find((r) => r.data[0] === "Alice").originalOrder).toBe(1);
  });

  it("does not mutate the input rows", () => {
    const input = stringRows();
    sortRows(input, [{ sort: SORT_ASC }], 0);
    expect(namesOf(input)).toEqual(["Charlie", "Alice", "Bob"]);
    expect(input.every((r) => !("originalOrder" in r))).toBe(true);
  });

  it("returns an empty array for non-array input", () => {
    expect(sortRows(null, [{ sort: SORT_ASC }], 0)).toEqual([]);
    expect(sortRows(stringRows(), null, 0)).toEqual([]);
  });

  it("returns an empty array for empty rows instead of throwing", () => {
    // FAILS until the firstRow guard is fixed (see note below)
    expect(sortRows([], [{ sort: SORT_ASC }], 0)).toEqual([]);
  });

  it("returns rows unchanged for an unknown sort value", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = sortRows(stringRows(), [{ sort: "bogus" }], 0);
    expect(namesOf(result)).toEqual(["Charlie", "Alice", "Bob"]);
    expect(errorSpy).toHaveBeenCalledWith("Unknown sort type:", "bogus");
    errorSpy.mockRestore();
  });
});

describe("Table column sorting", () => {
  const initialColumns = () => [{ name: "Name" }, { name: "Age" }];
  const initialRows = () => [
    { data: ["Charlie", 35] },
    { data: ["Alice", 25] },
    { data: ["Bob", 30] },
  ];

  function SortableHarness() {
    const [columns, setColumns] = useState(initialColumns());
    const [rows, setRows] = useState(initialRows());
    return (
      <Table
        columns={columns}
        rowData={rows}
        useActionsColumn={false}
        onColumnSort={(columnIndex) => {
          const nextColumns = updateColumns(columns, columnIndex);
          setColumns(nextColumns);
          setRows(sortRows(rows, nextColumns, columnIndex));
        }}
      />
    );
  }

  const columnValues = (container, colIndex) =>
    [...container.querySelectorAll("tbody tr")].map(
      (tr) => tr.querySelectorAll("td")[colIndex].textContent
    );

  const headerOf = (name) => screen.getByText(name).closest("th");

  it("runs the provided onColumnSort instead of any default behavior", async () => {
    const user = userEvent.setup();
    const onColumnSort = vi.fn();
    const { container } = render(
      <Table columns={initialColumns()} rowData={initialRows()} useActionsColumn={false} onColumnSort={onColumnSort} />
    );

    await user.click(screen.getByText("Age"));

    expect(onColumnSort).toHaveBeenCalledWith(1);
    // the table does not sort on its own — the parent controls it
    expect(columnValues(container, 0)).toEqual(["Charlie", "Alice", "Bob"]);
  });

  it("shows the unsorted icon for columns without a sort value", () => {
    render(<Table columns={initialColumns()} rowData={initialRows()} useActionsColumn={false} />);
    expect(headerOf("Name").querySelector(".fa-sort")).toBeInTheDocument();
    expect(headerOf("Age").querySelector(".fa-sort")).toBeInTheDocument();
  });

  it("shows the ascending icon only on the SORT_ASC column", () => {
    render(
      <Table columns={[{ name: "Name", sort: SORT_ASC }, { name: "Age", sort: SORT_NONE }]} rowData={initialRows()} useActionsColumn={false} />
    );
    expect(headerOf("Name").querySelector(".fa-caret-up")).toBeInTheDocument();
    expect(headerOf("Age").querySelector(".fa-caret-up")).not.toBeInTheDocument();
  });

  it("shows the descending icon only on the SORT_DESC column", () => {
    render(
      <Table columns={[{ name: "Name", sort: SORT_DESC }, { name: "Age", sort: SORT_ASC }]} rowData={initialRows()} useActionsColumn={false} />
    );
    expect(headerOf("Name").querySelector(".fa-caret-down")).toBeInTheDocument();
    expect(headerOf("Age").querySelector(".fa-caret-down")).not.toBeInTheDocument();
  });

  it("uses custom sort icons when provided", () => {
    render(
      <Table
        columns={[{ name: "Name", sort: SORT_ASC }, { name: "Age" }]}
        rowData={initialRows()}
        useActionsColumn={false}
        sortAscendingIcon="custom-asc"
        unsortedIcon="custom-unsorted"
      />
    );
    expect(headerOf("Name").querySelector(".custom-asc")).toBeInTheDocument();
    expect(headerOf("Age").querySelector(".custom-unsorted")).toBeInTheDocument();
  });

  it("cycles the icon unsorted -> ascending -> descending -> unsorted as the header is clicked", async () => {
    const user = userEvent.setup();
    render(<SortableHarness />);

    expect(headerOf("Name").querySelector(".fa-sort")).toBeInTheDocument();
    await user.click(screen.getByText("Name"));
    expect(headerOf("Name").querySelector(".fa-caret-up")).toBeInTheDocument();
    await user.click(screen.getByText("Name"));
    expect(headerOf("Name").querySelector(".fa-caret-down")).toBeInTheDocument();
    await user.click(screen.getByText("Name"));
    expect(headerOf("Name").querySelector(".fa-sort")).toBeInTheDocument();
  });

  it("sorts string columns asc/desc and restores original order through the UI", async () => {
    const user = userEvent.setup();
    const { container } = render(<SortableHarness />);

    await user.click(screen.getByText("Name")); // asc
    expect(columnValues(container, 0)).toEqual(["Alice", "Bob", "Charlie"]);

    await user.click(screen.getByText("Name")); // desc
    expect(columnValues(container, 0)).toEqual(["Charlie", "Bob", "Alice"]);

    await user.click(screen.getByText("Name")); // none -> original
    // FAILS until the firstRow guard is fixed (see note below)
    expect(columnValues(container, 0)).toEqual(["Charlie", "Alice", "Bob"]);
  });

  it("sorts numeric columns asc/desc through the UI", async () => {
    const user = userEvent.setup();
    const { container } = render(<SortableHarness />);

    await user.click(screen.getByText("Age"));
    expect(columnValues(container, 1)).toEqual(["25", "30", "35"]);

    await user.click(screen.getByText("Age"));
    expect(columnValues(container, 1)).toEqual(["35", "30", "25"]);
  });

  it("moves the sort indicator when a different column is clicked", async () => {
    const user = userEvent.setup();
    render(<SortableHarness />);

    await user.click(screen.getByText("Name"));
    expect(headerOf("Name").querySelector(".fa-caret-up")).toBeInTheDocument();

    await user.click(screen.getByText("Age"));
    expect(headerOf("Name").querySelector(".fa-sort")).toBeInTheDocument();
    expect(headerOf("Age").querySelector(".fa-caret-up")).toBeInTheDocument();
  });
});