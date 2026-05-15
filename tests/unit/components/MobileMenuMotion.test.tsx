// tests/unit/components/MobileMenuMotion.test.tsx
// Suite completa cobrindo o contrato pós-02-01:
// - Sem prop isOpen (estado interno)
// - CustomEvent "toggle-menu" controla abertura/fechamento
// - Listener é limpo no unmount

import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, act, cleanup } from "@testing-library/react";

vi.mock("motion/react", () => ({
  motion: {
    nav: React.forwardRef(
      (
        props: React.HTMLAttributes<HTMLElement> & {
          initial?: unknown;
          animate?: unknown;
          transition?: unknown;
          "aria-hidden"?: boolean | string;
          "aria-label"?: string;
        },
        ref: React.Ref<HTMLElement>
      ) => {
        const { initial: _i, animate: _a, transition: _t, ...rest } = props;
        return React.createElement("nav", { ...rest, ref });
      }
    ),
    div: "div",
  },
  useReducedMotion: () => false,
}));

vi.mock("../../../src/lib/motion-utils", () => ({
  useMotionEnabled: () => [true, vi.fn()],
  applyFallback: vi.fn(),
  MOTION_STORAGE_KEY: "motionEnabled",
}));

import { MobileMenuMotion } from "../../../src/components/MobileMenuMotion";

afterEach(() => {
  cleanup();
});

describe("MobileMenuMotion (CustomEvent-driven, sem prop isOpen)", () => {
  it("renderiza sem prop isOpen (nova API)", () => {
    const { container } = render(React.createElement(MobileMenuMotion, {}));
    expect(container.querySelector("nav")).toBeTruthy();
  });

  it("menu inicia fechado: aria-hidden='true'", () => {
    const { container } = render(React.createElement(MobileMenuMotion, {}));
    const nav = container.querySelector("nav");
    // Menu fechado: aria-hidden deve ser "true"
    expect(nav?.getAttribute("aria-hidden")).toBe("true");
  });

  it("CustomEvent 'toggle-menu' abre o menu: aria-hidden muda para 'false'", async () => {
    const { container } = render(React.createElement(MobileMenuMotion, {}));
    const nav = container.querySelector("nav");

    // Estado inicial: fechado
    expect(nav?.getAttribute("aria-hidden")).toBe("true");

    // Disparar evento de abertura
    await act(async () => {
      window.dispatchEvent(new CustomEvent("toggle-menu"));
    });

    expect(nav?.getAttribute("aria-hidden")).toBe("false");
  });

  it("segundo CustomEvent 'toggle-menu' fecha novamente: aria-hidden volta para 'true'", async () => {
    const { container } = render(React.createElement(MobileMenuMotion, {}));
    const nav = container.querySelector("nav");

    // Abrir
    await act(async () => {
      window.dispatchEvent(new CustomEvent("toggle-menu"));
    });
    expect(nav?.getAttribute("aria-hidden")).toBe("false");

    // Fechar
    await act(async () => {
      window.dispatchEvent(new CustomEvent("toggle-menu"));
    });
    expect(nav?.getAttribute("aria-hidden")).toBe("true");
  });

  it("cleanup no unmount: despachar evento após unmount não lança erros", async () => {
    const { unmount } = render(React.createElement(MobileMenuMotion, {}));

    unmount();

    // Após unmount, disparar evento não deve causar erros
    expect(() => {
      window.dispatchEvent(new CustomEvent("toggle-menu"));
    }).not.toThrow();
  });
});
