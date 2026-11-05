import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import Table from "../table";
import {
  baseColumns,
  baseRows,
  stableActionColumn,
  setViewportWidth,
  useTableTestEnvironment,
  
} from "./table-test-utils";

function Parent() {
  const [columns, setColumns] = useState(baseColumns().map((c) => ({ ...c })));
  const [rows, setRows] = useState([
    { data: { name: "Charlie", age: 35 } },
    { data: { name: "Alice", age: 25 } },
  ]);
  const [showActions, setShowActions] = useState(false);
  const [lengths, setLengths] = useState("");
  return (
    <>
      <button onClick={() => setShowActions((v) => !v)}>toggle actions</button>
      <button onClick={() => setRows([{ data: { name: "Zed", age: 1 } }])}>replace rows</button>
      <output data-testid="lengths">{lengths}</output>
      <Table
        columns={columns}
        setColumns={setColumns}
        rowData={rows}
        setRows={setRows}
        useActionsColumn={showActions}
        actionColumn={stableActionColumn}
        onColumnsChange={({ columns: next }) => setLengths(next.map((c) => c.length).join(","))}
      />
    </>
  );
}

describe("table integration (parent-controlled)", () => {
  useTableTestEnvironment();

  it("a parent owning columns and rows can drive sorting", async () => {
    const user = userEvent.setup();
    const { container } = render(<Parent />);
    await user.click(screen.getByText("Name"));
    const names = [...container.querySelectorAll("tbody tr")].map((tr) => tr.querySelector("td").textContent);
    expect(names).toEqual(["Alice", "Charlie"]);
  });

  it("changing parent state updates the table", async () => {
    const user = userEvent.setup();
    render(<Parent />);
    await user.click(screen.getByText("replace rows"));
    expect(screen.getByText("Zed")).toBeInTheDocument();
    expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
  });

  it("toggling useActionsColumn changes rendered output", async () => {
    const user = userEvent.setup();
    render(<Parent />);
    expect(screen.queryByText("Actions")).not.toBeInTheDocument();
    await user.click(screen.getByText("toggle actions"));
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("parent receives resize updates through onColumnsChange", async () => {
    const { container } = render(<Parent />);
    await waitFor(() => expect(screen.getByTestId("lengths").textContent).not.toBe(""));
    const handle = container.querySelector("th div[style*='col-resize']");
    fireEvent.mouseDown(handle, { clientX: 100 });
    fireEvent.mouseMove(window, { clientX: 140 });
    fireEvent.mouseUp(window);
    await waitFor(() => expect(screen.getByTestId("lengths").textContent).toBe("200,120"));
  });

  it("switches layouts across the breakpoint while keeping data", async () => {
    const { container } = render(<Parent />);
    expect(container.querySelector(".fa-bars")).not.toBeInTheDocument();
    act(() => setViewportWidth(500));
    await waitFor(() => expect(container.querySelector(".fa-bars")).toBeInTheDocument());
    expect(screen.getByText("Charlie")).toBeInTheDocument();
    act(() => setViewportWidth(1024));
    await waitFor(() => expect(container.querySelector(".fa-bars")).not.toBeInTheDocument());
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("full flow: sort, select a row, resize a column", async () => {
    const user = userEvent.setup();
    const { container } = render(<Parent />);

    await user.click(screen.getByText("Age"));
    await user.click(screen.getByText("Alice"));
    const firstRow = container.querySelector("tbody tr");
    expect(firstRow.querySelector("td").textContent).toBe("Alice");
    expect(firstRow).toHaveStyle("background-color: rgb(217, 237, 247)");

    const handle = container.querySelector("th div[style*='col-resize']");
    fireEvent.mouseDown(handle, { clientX: 100 });
    fireEvent.mouseMove(window, { clientX: 120 });
    fireEvent.mouseUp(window);
    expect(container.querySelectorAll("th")[0].style.width).toBe("180px");
  });

  it("parent's columns state reflects updated lengths after resize, and the table stays at those widths", async () => {
    function ColumnsOwner() {
      const [columns, setColumns] = useState(baseColumns().map((c) => ({ ...c })));
      return (
        <>
          <output data-testid="lengths">
            {columns.map((c) => c.length ?? "u").join(",")}
          </output>
          <Table
            columns={columns}
            setColumns={setColumns}
            rowData={baseRows()}
            onColumnsChange={({ columns: next }) => setColumns(next)}
          />
        </>
      );
    }

    const { container } = render(<ColumnsOwner />);
    await waitFor(() => expect(screen.getByTestId("lengths").textContent).toBe("160,160"));

    const handle = container.querySelectorAll("th")[0].querySelector("div[style*='col-resize']");
    fireEvent.mouseDown(handle, { clientX: 100 });
    fireEvent.mouseMove(window, { clientX: 140 });
    fireEvent.mouseUp(window);

    await waitFor(() => expect(screen.getByTestId("lengths").textContent).toBe("200,120"));

    // After the parent's state round-trip, the table must still render at the
    // new widths — not fall back to a measured/default width.
    const headers = container.querySelectorAll("th");
    expect(headers[0].style.width).toBe("200px");
    expect(headers[1].style.width).toBe("120px");

    // Other column fields must survive the emit→setColumns→re-render cycle.
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByText("Taylor")).toBeInTheDocument();
  });

  it("emits the action column's length on mouse up when useActionsColumn is on", async () => {
    const onColumnsChange = vi.fn();
    const { container } = render(
      <Table
        columns={baseColumns()}
        rowData={baseRows()}
        useActionsColumn
        actionColumn={{ name: "Actions", length: 140 }}
        onColumnsChange={onColumnsChange}
      />
    );
    await waitFor(() => expect(onColumnsChange).toHaveBeenCalled());
    onColumnsChange.mockClear();

    // Drag the handle between the last data column and the action column.
    const handle = container.querySelectorAll("th")[1].querySelector("div[style*='col-resize']");
    fireEvent.mouseDown(handle, { clientX: 100 });
    fireEvent.mouseMove(window, { clientX: 120 });
    fireEvent.mouseUp(window);

    await waitFor(() => expect(onColumnsChange).toHaveBeenCalled());
    const { actionColumn } = onColumnsChange.mock.calls.at(-1)[0];
    expect(actionColumn.length).toBe(120);
  });
});