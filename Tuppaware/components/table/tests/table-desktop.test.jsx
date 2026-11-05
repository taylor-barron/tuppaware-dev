import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Table from "../table";
import {
  SORT_ASC,
  SORT_DESC,
  SORT_NONE,
} from "../table-service";
import {
  baseColumns,
  baseRows,
  twoColumns,
  twoRows,
  useTableTestEnvironment,
} from "./table-test-utils";

const rowMatcher = expect.objectContaining({ data: { name: "Taylor", age: "32" } });

describe("table-desktop.jsx", () => {
  useTableTestEnvironment();

  const headerOf = (name) => screen.getByText(name).closest("th");

  describe("header", () => {
    it("renders headers and row data", () => {
      render(<Table columns={baseColumns()} rowData={baseRows()} useActionsColumn={false} />);
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Age")).toBeInTheDocument();
      expect(screen.getByText("Taylor")).toBeInTheDocument();
      expect(screen.getByText("32")).toBeInTheDocument();
    });

    it("applies class props", () => {
      const { container } = render(
        <Table
          columns={baseColumns()}
          rowData={baseRows()}
          tableClassName="my-table"
          tableHeadClassName="my-head"
          tableHeadCellClassName="my-cell"
          headerClassName="my-header"
        />
      );
      expect(container.querySelector("table")).toHaveClass("my-table");
      expect(container.querySelector("thead")).toHaveClass("my-head");
      expect(container.querySelector("th")).toHaveClass("my-cell");
      expect(container.querySelector(".my-header")).toBeInTheDocument();
    });

    it("uses fixed table layout", () => {
      render(<Table columns={baseColumns()} rowData={baseRows()} />);
      expect(screen.getByRole("table")).toHaveStyle("table-layout: fixed");
    });
  });

  describe("sort icons", () => {
    it("unsorted icon for no sort value", () => {
      render(<Table columns={twoColumns()} rowData={twoRows()} useActionsColumn={false} />);
      expect(headerOf("Name").querySelector(".fa-sort")).toBeInTheDocument();
      expect(headerOf("Age").querySelector(".fa-sort")).toBeInTheDocument();
    });

    it("ascending icon only on the SORT_ASC column", () => {
      render(
        <Table
          columns={[{ name: "Name", mapto: "name", sort: SORT_ASC }, { name: "Age", mapto: "age", sort: SORT_NONE }]}
          rowData={twoRows()}
          useActionsColumn={false}
        />
      );
      expect(headerOf("Name").querySelector(".fa-caret-up")).toBeInTheDocument();
      expect(headerOf("Age").querySelector(".fa-caret-up")).not.toBeInTheDocument();
    });

    it("descending icon only on the SORT_DESC column", () => {
      render(
        <Table
          columns={[{ name: "Name", mapto: "name", sort: SORT_DESC }, { name: "Age", mapto: "age", sort: SORT_ASC }]}
          rowData={twoRows()}
          useActionsColumn={false}
        />
      );
      expect(headerOf("Name").querySelector(".fa-caret-down")).toBeInTheDocument();
      expect(headerOf("Age").querySelector(".fa-caret-down")).not.toBeInTheDocument();
    });

    it("custom icons override defaults", () => {
      render(
        <Table
          columns={[{ name: "Name", mapto: "name", sort: SORT_ASC }, { name: "Age", mapto: "age" }]}
          rowData={twoRows()}
          useActionsColumn={false}
          sortAscendingIcon="custom-asc"
          unsortedIcon="custom-unsorted"
        />
      );
      expect(headerOf("Name").querySelector(".custom-asc")).toBeInTheDocument();
      expect(headerOf("Age").querySelector(".custom-unsorted")).toBeInTheDocument();
    });

    it("calls onColumnSort(index) and does not sort itself", async () => {
      const user = userEvent.setup();
      const onColumnSort = vi.fn();
      const { container } = render(
        <Table columns={twoColumns()} rowData={twoRows()} useActionsColumn={false} onColumnSort={onColumnSort} />
      );
      await user.click(screen.getByText("Age"));
      expect(onColumnSort).toHaveBeenCalledWith(1);
      const names = [...container.querySelectorAll("tbody tr")].map((tr) => tr.querySelectorAll("td")[0].textContent);
      expect(names).toEqual(["Charlie", "Alice", "Bob"]);
    });
  });

  describe("resize handles", () => {
    it("allows columns to be resized", () => {
      const { container } = render(<Table columns={baseColumns()} rowData={baseRows()} useActionsColumn={false} />);
      const firstHeader = container.querySelectorAll("th")[0];
      const handle = firstHeader.querySelector("div[style*='col-resize']");
      expect(firstHeader.style.width).toBe("160px");
      fireEvent.mouseDown(handle, { clientX: 100 });
      fireEvent.mouseMove(window, { clientX: 140 });
      fireEvent.mouseUp(window);
      expect(firstHeader.style.width).toBe("200px");
    });

    it("does not render a handle on the final data column", () => {
      const { container } = render(<Table columns={baseColumns()} rowData={baseRows()} useActionsColumn={false} />);
      const headers = container.querySelectorAll("th");
      expect(headers[headers.length - 1].querySelector("div[style*='col-resize']")).toBeNull();
    });
  });

  describe("body", () => {
    it("calls onRowClick with row and rowIndex", async () => {
      const user = userEvent.setup();
      const onRowClick = vi.fn();
      render(<Table columns={baseColumns()} rowData={baseRows()} useActionsColumn={false} onRowClick={onRowClick} />);
      await user.click(screen.getByText("Taylor"));
      await waitFor(() => expect(onRowClick).toHaveBeenCalledWith(rowMatcher, 0));
    });

    it("sets default row order on init when missing", async () => {
      const user = userEvent.setup();
      const onRowClick = vi.fn();
      render(
        <Table
          columns={baseColumns()}
          rowData={[
            { data: { name: "Taylor", age: "32" } },
            { data: { name: "Alex", age: "28" } },
          ]}
          useActionsColumn={false}
          onRowClick={onRowClick}
        />
      );
      await user.click(screen.getByText("Alex"));
      await waitFor(() => expect(onRowClick).toHaveBeenCalledTimes(1));
      const [clickedRow, clickedIndex] = onRowClick.mock.calls[0];
      expect(clickedIndex).toBe(1);
      expect(clickedRow).toMatchObject({ data: { name: "Alex", age: "28" }, order: 1 });
    });

    it("preserves existing row order", async () => {
      const user = userEvent.setup();
      const onRowClick = vi.fn();
      render(
        <Table
          columns={baseColumns()}
          rowData={[{ data: { name: "Taylor", age: "32" }, order: 99 }]}
          useActionsColumn={false}
          onRowClick={onRowClick}
        />
      );
      await user.click(screen.getByText("Taylor"));
      await waitFor(() => expect(onRowClick).toHaveBeenCalledTimes(1));
      const [clickedRow] = onRowClick.mock.calls[0];
      expect(clickedRow).toMatchObject({ order: 99 });
    });

    it("missing values empty, objects as JSON", () => {
      const { container } = render(
        <Table columns={baseColumns()} rowData={[{ data: { name: { nested: true } } }]} useActionsColumn={false} />
      );
      const cells = container.querySelectorAll("tbody tr td");
      expect(cells[0].textContent).toBe(JSON.stringify({ nested: true }));
      expect(cells[1].textContent).toBe("");
    });

    it("applies even/odd default styles", () => {
      const { container } = render(
        <Table columns={baseColumns()} rowData={[{ data: { name: "A" } }, { data: { name: "B" } }]} />
      );
      const rows = container.querySelectorAll("tbody tr");
      expect(rows[0]).toHaveStyle("background-color: rgb(249, 249, 249)");
      expect(rows[1]).toHaveStyle("background-color: rgb(255, 255, 255)");
    });

    it("applies selected row style after click", async () => {
      const user = userEvent.setup();
      const { container } = render(<Table columns={baseColumns()} rowData={baseRows()} />);
      await user.click(screen.getByText("Taylor"));
      expect(container.querySelector("tbody tr")).toHaveStyle("background-color: rgb(217, 237, 247)");
    });

    it("applies textClassName", () => {
      const { container } = render(
        <Table columns={baseColumns()} rowData={baseRows()} textClassName="cell-text" textStyle={{ color: "red" }} />
      );
      expect(container.querySelector(".cell-text")).toBeInTheDocument();
    });
  });
});