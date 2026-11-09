import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Table from "../src/table";
import {
  DefaultSortHarness,
  MobileHarness,
  baseColumns,
  baseRows,
  renderMobile,
  setViewportWidth,
  useTableTestEnvironment,
} from "./table-test-utils";

describe("table.jsx", () => {
  useTableTestEnvironment();

  describe("defaults", () => {
    it("desktop above, mobile below the default breakpoint", async () => {
      const desktop = render(<Table columns={baseColumns()} rowData={baseRows()} />);
      expect(desktop.container.querySelector(".fa-bars")).not.toBeInTheDocument();
      desktop.unmount();

      const { container } = await renderMobile(
        <MobileHarness initialColumns={baseColumns()} rowData={baseRows()} />,
        ".fa-bars"
      );
      expect(container.querySelector(".fa-bars")).toBeInTheDocument();
    });

    it("respects a custom mobileBreakPoint", async () => {
      setViewportWidth(900);
      const { container } = render(
        <MobileHarness
          initialColumns={baseColumns()}
          rowData={baseRows()}
          mobileBreakPoint={1200}
        />
      );
      await waitFor(() => expect(container.querySelector(".fa-bars")).toBeInTheDocument());
    });

    it("applies default styles and icon classes", () => {
      const { container } = render(<Table columns={baseColumns()} rowData={baseRows()} />);
      expect(screen.getByRole("table")).toHaveStyle("border-collapse: collapse");
      expect(container.querySelector("thead")).toHaveStyle("background-color: rgb(242, 242, 242)");
      expect(container.querySelector("th")).toHaveStyle("padding-left: 8px");
      expect(container.querySelector("th .fa-sort")).toBeInTheDocument();
    });

    it("default minColWidth=80, initial width=160, writeable+showSelected=true", async () => {
      const user = userEvent.setup();
      const { container } = render(<Table columns={baseColumns()} rowData={baseRows()} />);
      const firstHeader = container.querySelectorAll("th")[0];
      expect(firstHeader.style.width).toBe("160px");
      const handle = firstHeader.querySelector("div[style*='col-resize']");
      fireEvent.mouseDown(handle, { clientX: 100 });
      fireEvent.mouseMove(window, { clientX: -200 });
      fireEvent.mouseUp(window);
      expect(firstHeader.style.width).toBe("80px");

      await user.click(screen.getByText("Taylor"));
      expect(container.querySelector("tbody tr")).toHaveStyle("background-color: rgb(217, 237, 247)");
    });
  });

  describe("style overrides", () => {
    it("applies overrides", () => {
      const { container } = render(
        <Table
          columns={baseColumns()}
          rowData={baseRows()}
          useActionsColumn={false}
          tableStyle={{ width: "90%" }}
          tableHeadStyle={{ textAlign: "center" }}
          tableHeadCellStyle={{ padding: "20px" }}
          evenRowStyle={{ backgroundColor: "pink" }}
        />
      );
      expect(screen.getByRole("table")).toHaveStyle("width: 90%");
      expect(container.querySelector("thead")).toHaveStyle("text-align: center");
      expect(container.querySelector("th")).toHaveStyle("padding: 20px");
      expect(container.querySelector("tbody tr")).toHaveStyle("background-color: rgb(255, 192, 203)");
    });

    it("keeps other defaults when overriding one key", () => {
      const { container } = render(
        <Table
          columns={baseColumns()}
          rowData={baseRows()}
          tableStyle={{ width: "90%" }}
          evenRowStyle={{ color: "red" }}
        />
      );
      expect(screen.getByRole("table")).toHaveStyle("border-collapse: collapse");
      expect(container.querySelector("tbody tr")).toHaveStyle("background-color: rgb(249, 249, 249)");
    });

    it("merges *Style overrides on top of the DEFAULT_* base; no prop can remove a base key", () => {
      const { container } = render(
        <Table
          columns={baseColumns()}
          rowData={baseRows()}
          tableStyle={{ width: "50%" }}
          tableHeadStyle={{ textAlign: "right" }}
          evenRowStyle={{ backgroundColor: "rgb(1, 2, 3)" }}
        />
      );

      expect(screen.getByRole("table")).toHaveStyle("width: 50%");
      expect(container.querySelector("thead")).toHaveStyle("text-align: right");
      expect(container.querySelector("tbody tr")).toHaveStyle("background-color: rgb(1, 2, 3)");

      expect(screen.getByRole("table").style.borderCollapse).toBe("collapse");
      expect(container.querySelector("thead").style.backgroundColor).toBe("rgb(242, 242, 242)");
    });

    it("className props applied", () => {
      const { container } = render(
        <Table
          columns={baseColumns()}
          rowData={baseRows()}
          tableClassName="t"
          tableHeadClassName="h"
          tableHeadCellClassName="c"
        />
      );
      expect(container.querySelector("table")).toHaveClass("t");
      expect(container.querySelector("thead")).toHaveClass("h");
      expect(container.querySelector("th")).toHaveClass("c");
    });

    it("odd and selected row overrides", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Table
          columns={baseColumns()}
          rowData={[{ data: { name: "A" } }, { data: { name: "B" } }]}
          oddRowStyle={{ backgroundColor: "rgb(10, 20, 30)" }}
          selectedRowStyle={{ backgroundColor: "rgb(40, 50, 60)" }}
        />
      );
      const rows = container.querySelectorAll("tbody tr");
      expect(rows[1]).toHaveStyle("background-color: rgb(10, 20, 30)");
      await user.click(screen.getByText("A"));
      expect(rows[0]).toHaveStyle("background-color: rgb(40, 50, 60)");
    });
  });

  describe("rows", () => {
    it("accepts array or { data: [...] }", () => {
      const a = render(<Table columns={baseColumns()} rowData={baseRows()} />);
      expect(screen.getByText("Taylor")).toBeInTheDocument();
      a.unmount();
      render(<Table columns={baseColumns()} rowData={{ data: baseRows() }} />);
      expect(screen.getByText("Taylor")).toBeInTheDocument();
    });

    it("renders no rows for invalid rowData", () => {
      const { container } = render(<Table columns={baseColumns()} rowData={null} />);
      expect(container.querySelectorAll("tbody tr")).toHaveLength(0);
    });

    it("uses custom rowOrderKey", async () => {
      const user = userEvent.setup();
      const onRowClick = vi.fn();
      render(
        <Table
          columns={baseColumns()}
          rowData={[{ data: { name: "A" } }, { data: { name: "B" } }]}
          rowOrderKey="position"
          onRowClick={onRowClick}
        />
      );
      await user.click(screen.getByText("B"));
      await waitFor(() => expect(onRowClick).toHaveBeenCalled());
      expect(onRowClick.mock.calls[0][0]).toMatchObject({ position: 1 });
    });
  });

  describe("row selection and click", () => {
    it("starts with rows[].selected", () => {
      const { container } = render(
        <Table
          columns={baseColumns()}
          rowData={[{ data: { name: "A" } }, { data: { name: "B" }, selected: true }]}
        />
      );
      expect(container.querySelectorAll("tbody tr")[1]).toHaveStyle("background-color: rgb(217, 237, 247)");
    });

    it("does not select when writeable=false", async () => {
      const user = userEvent.setup();
      const { container } = render(<Table columns={baseColumns()} rowData={baseRows()} writeable={false} />);
      await user.click(screen.getByText("Taylor"));
      expect(container.querySelector("tbody tr")).toHaveStyle("background-color: rgb(249, 249, 249)");
    });

    it("does not select when showSelected=false", async () => {
      const user = userEvent.setup();
      const { container } = render(<Table columns={baseColumns()} rowData={baseRows()} showSelected={false} />);
      await user.click(screen.getByText("Taylor"));
      expect(container.querySelector("tbody tr")).toHaveStyle("background-color: rgb(249, 249, 249)");
    });

    it("paints selection before onRowClick", async () => {
      const user = userEvent.setup();
      let bg;
      const { container } = render(
        <Table
          columns={baseColumns()}
          rowData={baseRows()}
          onRowClick={() => {
            bg = container.querySelector("tbody tr").style.backgroundColor;
          }}
        />
      );
      await user.click(screen.getByText("Taylor"));
      await waitFor(() => expect(bg).toBeDefined());
      expect(bg).toBe("rgb(217, 237, 247)");
    });

    it("cancels pending onRowClick on unmount", async () => {
      const onRowClick = vi.fn();
      const { unmount } = render(<Table columns={baseColumns()} rowData={baseRows()} onRowClick={onRowClick} />);
      fireEvent.click(screen.getByText("Taylor"));
      unmount();
      await new Promise((r) => setTimeout(r, 100));
      expect(onRowClick).not.toHaveBeenCalled();
    });
  });

  describe("sorting (default handler)", () => {
    const headerOf = (name) => screen.getByText(name).closest("th");
    const colValues = (container, i) =>
      [...container.querySelectorAll("tbody tr")].map((tr) => tr.querySelectorAll("td")[i].textContent);

    it("cycles icons and sorts strings", async () => {
      const user = userEvent.setup();
      const { container } = render(<DefaultSortHarness />);
      expect(headerOf("Name").querySelector(".fa-sort")).toBeInTheDocument();
      await user.click(screen.getByText("Name"));
      expect(headerOf("Name").querySelector(".fa-caret-up")).toBeInTheDocument();
      expect(colValues(container, 0)).toEqual(["Alice", "Bob", "Charlie"]);
      await user.click(screen.getByText("Name"));
      expect(headerOf("Name").querySelector(".fa-caret-down")).toBeInTheDocument();
      expect(colValues(container, 0)).toEqual(["Charlie", "Bob", "Alice"]);
      await user.click(screen.getByText("Name"));
      expect(headerOf("Name").querySelector(".fa-sort")).toBeInTheDocument();
      expect(colValues(container, 0)).toEqual(["Charlie", "Alice", "Bob"]);
    });

    it("sorts numeric columns", async () => {
      const user = userEvent.setup();
      const { container } = render(<DefaultSortHarness />);
      await user.click(screen.getByText("Age"));
      expect(colValues(container, 1)).toEqual(["25", "30", "35"]);
      await user.click(screen.getByText("Age"));
      expect(colValues(container, 1)).toEqual(["35", "30", "25"]);
    });

    it("moves the sort indicator", async () => {
      const user = userEvent.setup();
      render(<DefaultSortHarness />);
      await user.click(screen.getByText("Name"));
      expect(headerOf("Name").querySelector(".fa-caret-up")).toBeInTheDocument();
      await user.click(screen.getByText("Age"));
      expect(headerOf("Name").querySelector(".fa-sort")).toBeInTheDocument();
      expect(headerOf("Age").querySelector(".fa-caret-up")).toBeInTheDocument();
    });

    it("renumbers order in the rows passed to setRows", async () => {
      const user = userEvent.setup();
      const setRows = vi.fn();
      const setColumns = vi.fn();
      render(
        <Table
          columns={[
            { name: "Name", mapto: "name" },
            { name: "Age", mapto: "age" },
          ]}
          rowData={[
            { data: { name: "Charlie", age: 35 } },
            { data: { name: "Alice", age: 25 } },
            { data: { name: "Bob", age: 30 } },
          ]}
          setRows={setRows}
          setColumns={setColumns}
        />
      );
      await user.click(screen.getByText("Name"));
      const sorted = setRows.mock.calls[0][0];
      expect(sorted.map((r) => r.data.name)).toEqual(["Alice", "Bob", "Charlie"]);
      expect(sorted.map((r) => r.order)).toEqual([0, 1, 2]);
    });
  });

  describe("column widths and resizing", () => {
    const widthOf = (container, i) => container.querySelectorAll("th")[i].style.width;
    const drag = (container, i, from, to) => {
      const handle = container.querySelectorAll("th")[i].querySelector("div[style*='col-resize']");
      fireEvent.mouseDown(handle, { clientX: from });
      fireEvent.mouseMove(window, { clientX: to });
      fireEvent.mouseUp(window);
    };

    it("uses column.length for initial widths", () => {
      const columns = [
        { name: "Name", mapto: "name", length: 220 },
        { name: "Age", mapto: "age", length: 130 },
      ];
      const { container } = render(<Table columns={columns} rowData={baseRows()} />);
      expect(widthOf(container, 0)).toBe("220px");
      expect(widthOf(container, 1)).toBe("130px");
    });

    it("uses actionColumn.length then actionColWidth", () => {
      const a = render(
        <Table
          columns={baseColumns()}
          rowData={baseRows()}
          useActionsColumn
          actionColumn={{ name: "Actions", length: 200 }}
        />
      );
      expect(widthOf(a.container, 2)).toBe("200px");
      a.unmount();
      const b = render(
        <Table
          columns={baseColumns()}
          rowData={baseRows()}
          useActionsColumn
          actionColumn={{ name: "Actions" }}
          actionColWidth={150}
        />
      );
      expect(widthOf(b.container, 2)).toBe("150px");
    });

    it("cascadeResize false only takes from neighbor", () => {
      const cols = [
        { name: "Name", mapto: "name" },
        { name: "Age", mapto: "age" },
        { name: "Location", mapto: "location" },
      ];
      const { container } = render(
        <Table columns={cols} rowData={[{ data: { name: "A" } }]} minColWidth={100} cascadeResize={false} />
      );
      drag(container, 0, 100, 300);
      expect(widthOf(container, 0)).toBe("220px");
      expect(widthOf(container, 1)).toBe("100px");
      expect(widthOf(container, 2)).toBe("160px");
    });

    it("cascadeResize true takes from further columns", () => {
      const cols = [
        { name: "Name", mapto: "name" },
        { name: "Age", mapto: "age" },
        { name: "Location", mapto: "location" },
      ];
      const { container } = render(
        <Table columns={cols} rowData={[{ data: { name: "A" } }]} minColWidth={100} cascadeResize />
      );
      drag(container, 0, 100, 200);
      expect(widthOf(container, 0)).toBe("260px");
      expect(widthOf(container, 1)).toBe("100px");
      expect(widthOf(container, 2)).toBe("120px");
    });

    it("emits onColumnsChange on mouse up with updated lengths", async () => {
      const onColumnsChange = vi.fn();
      const { container } = render(
        <Table columns={baseColumns()} rowData={baseRows()} onColumnsChange={onColumnsChange} />
      );
      await waitFor(() => expect(onColumnsChange).toHaveBeenCalled());
      onColumnsChange.mockClear();

      drag(container, 0, 100, 140);
      await waitFor(() => expect(onColumnsChange).toHaveBeenCalled());
      const { columns } = onColumnsChange.mock.calls.at(-1)[0];
      expect(columns.map((c) => c.length)).toEqual([200, 120]);
    });

    it("cleans up listeners and body styles on unmount", () => {
      const removeSpy = vi.spyOn(window, "removeEventListener");
      const { container, unmount } = render(<Table columns={baseColumns()} rowData={baseRows()} />);
      const handle = container.querySelector("th div[style*='col-resize']");
      fireEvent.mouseDown(handle, { clientX: 100 });
      expect(document.body.style.cursor).toBe("col-resize");
      unmount();
      expect(removeSpy).toHaveBeenCalledWith("mousemove", expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith("mouseup", expect.any(Function));
      expect(document.body.style.cursor).toBe("");
      removeSpy.mockRestore();
    });
  });

  describe("action column", () => {
    it("shows/hides with useActionsColumn", () => {
      const shown = render(
        <Table columns={baseColumns()} rowData={baseRows()} useActionsColumn actionColumn={{ name: "Ops" }} />
      );
      expect(screen.getByText("Ops")).toBeInTheDocument();
      expect(shown.container.querySelectorAll("th")).toHaveLength(3);
      shown.unmount();

      const hidden = render(<Table columns={baseColumns()} rowData={baseRows()} useActionsColumn={false} />);
      expect(hidden.container.querySelectorAll("th")).toHaveLength(2);
    });

    it("no resize handle after the final data column when action column is last", () => {
      const { container } = render(<Table columns={baseColumns()} rowData={baseRows()} useActionsColumn />);
      const headers = container.querySelectorAll("th");
      expect(headers[1].querySelector("div[style*='col-resize']")).toBeInTheDocument();
      expect(headers[2].querySelector("div[style*='col-resize']")).toBeNull();
    });
  });
});