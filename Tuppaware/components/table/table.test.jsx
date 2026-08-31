import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Table from "./table";

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
    expect(onRowClick).toHaveBeenCalledWith({ data: ["Taylor", "32"] }, 0);
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
    const resizeHandle = firstHeader.querySelector("div");

    expect(firstHeader.style.width).toBe("160px");
    expect(resizeHandle).toBeTruthy();

    fireEvent.mouseDown(resizeHandle, { clientX: 100 });
    fireEvent.mouseMove(window, { clientX: 140 });
    fireEvent.mouseUp(window);

    expect(firstHeader.style.width).toBe("200px");
  });

  it("emits updated column width info for parent model", () => {
    const onColumnsChange = vi.fn();
    const { container } = render(
      <Table
        columns={[{ name: "Name" }, { name: "Age" }]}
        actionColumn={{ name: "Actions" }}
        rowData={baseRows}
        useActionsColumn
        onColumnsChange={onColumnsChange}
      />
    );

    // Initial emit on mount
    expect(onColumnsChange).toHaveBeenCalled();
    const initialPayload = onColumnsChange.mock.calls[0][0];
    expect(initialPayload.columns[0].length).toBeTypeOf("number");
    expect(initialPayload.columns[1].length).toBeTypeOf("number");
    expect(initialPayload.actionColumn.length).toBeTypeOf("number");

    // Resize and ensure an updated emit happens
    const firstHeader = container.querySelectorAll("th")[0];
    const resizeHandle = firstHeader.querySelector("div");

    fireEvent.mouseDown(resizeHandle, { clientX: 100 });
    fireEvent.mouseMove(window, { clientX: 150 });
    fireEvent.mouseUp(window);

    const lastPayload = onColumnsChange.mock.calls.at(-1)[0];
    expect(lastPayload.columns[0].length).toBeGreaterThan(initialPayload.columns[0].length);
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
    expect(onButtonClick).toHaveBeenCalledWith({ data: ["Taylor", "32"] }, 0);
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
    expect(onButtonClick).toHaveBeenCalledWith({ data: ["Taylor", "32"] }, 0);
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
    expect(optionAction).toHaveBeenCalledWith({ data: ["Taylor", "32"] }, 0);
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
});