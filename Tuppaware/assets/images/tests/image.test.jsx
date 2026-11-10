import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Image from "../src/Image";
import { resolveSrc } from "../utils/image-service";
import { DEFAULT_IMAGE_STYLE } from "../utils/image-defaults";
import {
  EMPTY_STRING,
  EMPTY_CLASS_NAME,
  EMPTY_STYLE,
} from "../../../utils/src/globaldefaults";

// ---------------------------------------------------------------------------
// resolveSrc — pure function tests
// ---------------------------------------------------------------------------
describe("resolveSrc", () => {
  it("returns EMPTY_STRING for falsy input", () => {
    expect(resolveSrc(undefined)).toBe(EMPTY_STRING);
    expect(resolveSrc(null)).toBe(EMPTY_STRING);
    expect(resolveSrc("")).toBe(EMPTY_STRING);
  });

  it("returns a plain string unchanged when there's no query", () => {
    expect(resolveSrc("photo.png")).toBe("photo.png");
  });

  it("strips the query string from a string src", () => {
    expect(resolveSrc("photo.png?v=2&x=1")).toBe("photo.png");
  });

  it("extracts src from a StaticImageData-like object", () => {
    expect(
      resolveSrc({ src: "/_next/static/photo.png", width: 100, height: 100 })
    ).toBe("/_next/static/photo.png");
  });

  it("strips query string from StaticImageData src", () => {
    expect(resolveSrc({ src: "/img/photo.png?w=200" })).toBe("/img/photo.png");
  });

  it("unwraps an ESM default export string", () => {
    expect(resolveSrc({ default: "photo.png" })).toBe("photo.png");
  });

  it("unwraps a nested ESM default export object", () => {
    expect(resolveSrc({ default: { src: "photo.png" } })).toBe("photo.png");
  });

  it("returns EMPTY_STRING for an unrecognizable object", () => {
    expect(resolveSrc({ foo: "bar" })).toBe(EMPTY_STRING);
    expect(resolveSrc({ src: 123 })).toBe(EMPTY_STRING);
  });
});

// ---------------------------------------------------------------------------
// Image component
// ---------------------------------------------------------------------------
describe("Image", () => {
  let warnSpy;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe("type validation", () => {
    it.each(["png", "jpg", "jpeg", "gif", "svg", "webp"])(
      "renders an <img> for .%s files",
      (ext) => {
        render(<Image src={`photo.${ext}`} alt="pic" />);
        expect(screen.getByRole("img")).toBeInTheDocument();
        expect(warnSpy).not.toHaveBeenCalled();
      }
    );

    it("accepts uppercase extensions", () => {
      render(<Image src="photo.PNG" alt="pic" />);
      expect(screen.getByRole("img")).toBeInTheDocument();
      expect(screen.getByRole("img")).toHaveAttribute("src", "photo.PNG");
    });

    it.each(["txt", "bmp", "pdf"])(
      "warns and renders nothing for .%s files",
      (ext) => {
        const { container } = render(<Image src={`doc.${ext}`} alt="pic" />);
        expect(container).toBeEmptyDOMElement();
        expect(screen.queryByRole("img")).not.toBeInTheDocument();
        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining(`Unsupported image type: ${ext}`)
        );
      }
    );

    it("warns and renders nothing when src is empty (default)", () => {
      const { container } = render(<Image alt="pic" />);
      expect(container).toBeEmptyDOMElement();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Unsupported image type")
      );
    });

    it("warns and renders nothing when src has no extension", () => {
      const { container } = render(<Image src="image" alt="pic" />);
      expect(container).toBeEmptyDOMElement();
      expect(warnSpy).toHaveBeenCalled();
    });
  });

  describe("rendering", () => {
    it("renders an <img> without an <a> when url is not provided", () => {
      render(<Image src="photo.png" alt="a cat" />);
      expect(screen.getByRole("img")).toBeInTheDocument();
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("wraps the <img> in a self-target link when url is provided", () => {
      render(<Image src="photo.png" alt="a cat" url="https://example.com" />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "https://example.com");
      expect(link).toHaveAttribute("target", "_self");
      expect(link.querySelector("img")).toBe(screen.getByRole("img"));
    });

    it("does not render a link when url is an empty string", () => {
      render(<Image src="photo.png" alt="a cat" url="" />);
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("passes alt, className and uses resolved src", () => {
      render(
        <Image
          src="photo.png?v=99"
          alt="a cat"
          className="thumb"
        />
      );
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "photo.png");
      expect(img).toHaveAttribute("alt", "a cat");
      expect(img).toHaveClass("thumb");
    });

    it("forwards arbitrary props to the <img>", () => {
      render(
        <Image
          src="photo.png"
          alt="a cat"
          loading="lazy"
          data-testid="thumb"
        />
      );
      const img = screen.getByTestId("thumb");
      expect(img).toHaveAttribute("loading", "lazy");
    });

    it("renders src from a StaticImageData object", () => {
      render(
        <Image
          src={{ src: "/_next/static/photo.png?w=100", width: 100, height: 50 }}
          alt="a cat"
        />
      );
      expect(screen.getByRole("img")).toHaveAttribute(
        "src",
        "/_next/static/photo.png"
      );
    });
  });

  describe("styles", () => {
    it("applies DEFAULT_IMAGE_STYLE when no style is given", () => {
      render(<Image src="photo.png" alt="a cat" />);
      const img = screen.getByRole("img");
      Object.entries(DEFAULT_IMAGE_STYLE).forEach(([k, v]) => {
        expect(img.style[k]).toBe(v);
      });
    });

    it("merges caller style over the defaults", () => {
      render(
        <Image
          src="photo.png"
          alt="a cat"
          style={{ width: "50%", border: "1px solid red" }}
        />
      );
      const img = screen.getByRole("img");
      expect(img.style.width).toBe("50%");       // overridden
      expect(img.style.height).toBe("auto");     // default preserved
      expect(img.style.border).toBe("1px solid red");
    });
  });
});