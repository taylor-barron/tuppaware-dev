import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import Table from "../table";
import {
  baseColumns,
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
});