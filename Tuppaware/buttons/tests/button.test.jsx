import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "../src/button";
import { EMPTY_CLASS_NAME } from "../../utils/src/globaldefaults";
import {
  DEFAULT_BUTTON_STYLE,
  DEFAULT_LEADING_ICON_STYLE,
  DEFAULT_TRAILING_ICON_STYLE,
  
} from "../utils/button-defaults";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const LEADING_CLASS = "leading-icon";
const TRAILING_CLASS = "trailing-icon";

function renderButton(props = {}, children = "Click me") {
  return render(<Button {...props}>{children}</Button>);
}

// ---------------------------------------------------------------------------
// Sentinel contract
// ---------------------------------------------------------------------------
describe("Button – sentinel contract", () => {
  // Pins the assumption that "no icon" is signaled by the empty class sentinel.
  // If globaldefaults ever changes EMPTY_CLASS_NAME, this fails loudly.
  it("treats EMPTY_CLASS_NAME as the 'no icon' sentinel", () => {
    renderButton({ leadingIconClassName: EMPTY_CLASS_NAME });
    const btn = screen.getByRole("button");
    expect(btn.querySelector(`.${LEADING_CLASS}`)).toBeNull();
    expect(btn.querySelector(`.${TRAILING_CLASS}`)).toBeNull();
    // The string child is a text node, so there are no element children.
    expect(btn.children.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Rendering & semantics
// ---------------------------------------------------------------------------
describe("Button – rendering", () => {
  it("renders a native <button> element", () => {
    renderButton();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders children inside the button", () => {
    renderButton({}, "Save");
    expect(screen.getByRole("button")).toHaveTextContent("Save");
  });

  it("renders rich (non-string) children", () => {
    render(
      <Button>
        <span data-testid="inner">Rich</span>
      </Button>
    );
    expect(screen.getByTestId("inner")).toBeInTheDocument();
    expect(screen.getByRole("button")).toContainElement(
      screen.getByTestId("inner")
    );
  });

  it("applies the className prop", () => {
    renderButton({ className: "my-btn extra" });
    expect(screen.getByRole("button")).toHaveClass("my-btn", "extra");
  });
});

// ---------------------------------------------------------------------------
// Default styles
// ---------------------------------------------------------------------------
describe("Button – default styles", () => {
  it("applies all DEFAULT_BUTTON_STYLE values when no style prop is given", () => {
    renderButton();
    const { style } = screen.getByRole("button");

    expect(style.padding).toBe(DEFAULT_BUTTON_STYLE.padding);
    expect(style.fontSize).toBe(DEFAULT_BUTTON_STYLE.fontSize);
    expect(style.borderRadius).toBe(DEFAULT_BUTTON_STYLE.borderRadius);
    expect(style.cursor).toBe(DEFAULT_BUTTON_STYLE.cursor);
    // Hex is normalized to rgb() by jsdom.
    expect(style.backgroundColor).toBe("rgb(240, 240, 240)");
    expect(style.color).toBe("rgb(0, 0, 0)");
    // border is a shorthand; assert longhands.
    expect(style.borderWidth).toBe("1px");
    expect(style.borderStyle).toBe("solid");
    expect(style.borderColor).toBe("rgb(204, 204, 204)");
  });

  it("overrides only the conflicting styles from the style prop", () => {
    renderButton({ style: { color: "red" } });
    const { style } = screen.getByRole("button");

    // Overridden — named colors round-trip verbatim in jsdom.
    expect(style.color).toBe("red");

    // Non-conflicting defaults survive the merge
    expect(style.padding).toBe(DEFAULT_BUTTON_STYLE.padding);
    expect(style.fontSize).toBe(DEFAULT_BUTTON_STYLE.fontSize);
    expect(style.borderRadius).toBe(DEFAULT_BUTTON_STYLE.borderRadius);
    expect(style.backgroundColor).toBe("rgb(240, 240, 240)");
    expect(style.borderWidth).toBe("1px");
    expect(style.borderStyle).toBe("solid");
    expect(style.borderColor).toBe("rgb(204, 204, 204)");
  });

  it("fully overrides when every default key is supplied", () => {
    const custom = {
      padding: "2px",
      fontSize: "12px",
      border: "none",
      borderRadius: "0",
      cursor: "default",
      backgroundColor: "blue",
      color: "white",
    };
    renderButton({ style: custom });
    const { style } = screen.getByRole("button");

    expect(style.padding).toBe("2px");
    expect(style.fontSize).toBe("12px");
    expect(style.borderStyle).toBe("none");
    expect(style.borderRadius).toBe("0px"); // jsdom normalizes "0" -> "0px"
    expect(style.cursor).toBe("default");
    // Named colors round-trip verbatim in jsdom.
    expect(style.backgroundColor).toBe("blue");
    expect(style.color).toBe("white");
  });

  it("adds brand-new style keys not present in the defaults", () => {
    renderButton({ style: { margin: "10px" } });
    const { style } = screen.getByRole("button");

    expect(style.margin).toBe("10px");
    // defaults still intact
    expect(style.padding).toBe(DEFAULT_BUTTON_STYLE.padding);
  });
});

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------
describe("Button – icons", () => {
  it("does NOT render a leading icon when no leadingIconClassName is given", () => {
    renderButton();
    const btn = screen.getByRole("button");
    expect(btn.querySelector(`.${LEADING_CLASS}`)).toBeNull();
  });

  it("does NOT render a trailing icon when no trailingIconClassName is given", () => {
    renderButton();
    const btn = screen.getByRole("button");
    expect(btn.querySelector(`.${TRAILING_CLASS}`)).toBeNull();
  });

  it("renders the leading icon when leadingIconClassName is provided", () => {
    renderButton({ leadingIconClassName: LEADING_CLASS });
    const btn = screen.getByRole("button");
    expect(btn.querySelector(`.${LEADING_CLASS}`)).toBeInTheDocument();
  });

  it("applies the leading icon className to the rendered icon", () => {
    renderButton({ leadingIconClassName: LEADING_CLASS });
    const icon = screen.getByRole("button").querySelector(`.${LEADING_CLASS}`);
    expect(icon).toHaveClass(LEADING_CLASS);
  });

  it("renders the trailing icon when trailingIconClassName is provided", () => {
    renderButton({ trailingIconClassName: TRAILING_CLASS });
    const btn = screen.getByRole("button");
    expect(btn.querySelector(`.${TRAILING_CLASS}`)).toBeInTheDocument();
  });

  it("applies the trailing icon className to the rendered icon", () => {
    renderButton({ trailingIconClassName: TRAILING_CLASS });
    const icon = screen
      .getByRole("button")
      .querySelector(`.${TRAILING_CLASS}`);
    expect(icon).toHaveClass(TRAILING_CLASS);
  });

  it("renders both icons in correct DOM order: leading → children → trailing", () => {
    render(
      <Button leadingIconClassName="lead" trailingIconClassName="trail">
        <span data-testid="label">Label</span>
      </Button>
    );
    const btn = screen.getByRole("button");
    const lead = btn.querySelector(".lead");
    const label = btn.querySelector('[data-testid="label"]');
    const trail = btn.querySelector(".trail");

    expect(lead).toBeInTheDocument();
    expect(trail).toBeInTheDocument();

    // DOM order: lead before label, label before trail
    expect(
      lead.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      label.compareDocumentPosition(trail) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("renders only the trailing icon when only trailingIconClassName is given", () => {
    renderButton({ trailingIconClassName: TRAILING_CLASS });
    const btn = screen.getByRole("button");
    expect(btn.querySelector(`.${TRAILING_CLASS}`)).toBeInTheDocument();
    expect(btn.querySelector(`.${LEADING_CLASS}`)).toBeNull();
  });

  it("renders only the leading icon when only leadingIconClassName is given", () => {
    renderButton({ leadingIconClassName: LEADING_CLASS });
    const btn = screen.getByRole("button");
    expect(btn.querySelector(`.${LEADING_CLASS}`)).toBeInTheDocument();
    expect(btn.querySelector(`.${TRAILING_CLASS}`)).toBeNull();
  });

  it("applies default leading-icon style merged with provided style", () => {
    renderButton({
      leadingIconClassName: LEADING_CLASS,
      leadingIconStyle: { color: "red" },
    });
    const icon = screen.getByRole("button").querySelector(`.${LEADING_CLASS}`);

    // Named colors round-trip verbatim in jsdom.
    expect(icon.style.color).toBe("red");
    expect(icon.style.marginRight).toBe(DEFAULT_LEADING_ICON_STYLE.marginRight);
  });

  it("applies default trailing-icon style merged with provided style", () => {
    renderButton({
      trailingIconClassName: TRAILING_CLASS,
      trailingIconStyle: { color: "green" },
    });
    const icon = screen
      .getByRole("button")
      .querySelector(`.${TRAILING_CLASS}`);

    // Named colors round-trip verbatim in jsdom.
    expect(icon.style.color).toBe("green");
    expect(icon.style.marginLeft).toBe(DEFAULT_TRAILING_ICON_STYLE.marginLeft);
  });

  it("does NOT render an icon from an icon style alone (class is required by contract)", () => {
    renderButton({ leadingIconStyle: { color: "red" } });
    const btn = screen.getByRole("button");
    // Documenting the favicon contract: no class → no icon, style ignored.
    expect(btn.querySelector(`.${LEADING_CLASS}`)).toBeNull();
    expect(btn.querySelector(`.${TRAILING_CLASS}`)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------
describe("Button – interaction", () => {
  it("calls the provided onClick when clicked", () => {
    const onClick = vi.fn();
    renderButton({ onClick }, "Click");
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("passes the click event to onClick", () => {
    const onClick = vi.fn();
    renderButton({ onClick });
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ type: "click" })
    );
  });

  it("works with userEvent (realistic interaction)", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderButton({ onClick });
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not throw when clicked with the default NOOP onClick", () => {
    renderButton();
    expect(() => fireEvent.click(screen.getByRole("button"))).not.toThrow();
  });

  it("bubbles clicks from an icon child up to the button onClick", () => {
    const onClick = vi.fn();
    renderButton({ onClick, leadingIconClassName: LEADING_CLASS });
    const icon = screen.getByRole("button").querySelector(`.${LEADING_CLASS}`);
    fireEvent.click(icon);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});