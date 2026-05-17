// tests/unit/components/HeroMotion.test.tsx
// Cobre: renderizacao de children, variants API (stagger), animate trigger, sem easeOut string

import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import * as fs from "fs";
import * as path from "path";

// Mock expandido: captura variants, initial, animate alem das props anteriores
const capturedProps: Array<Record<string, unknown>> = [];

vi.mock("motion/react", () => ({
  motion: {
    div: React.forwardRef(
      (
        props: React.HTMLAttributes<HTMLDivElement> & {
          initial?: unknown;
          animate?: unknown;
          whileInView?: unknown;
          transition?: unknown;
          viewport?: unknown;
          variants?: unknown;
        },
        ref: React.Ref<HTMLDivElement>
      ) => {
        // Capturar TODAS as props para inspecao nos testes
        capturedProps.push({
          initial: props.initial,
          animate: props.animate,
          whileInView: props.whileInView,
          transition: props.transition,
          viewport: props.viewport,
          variants: props.variants,
        });

        const {
          initial: _i,
          animate: _a,
          whileInView: _w,
          transition: _t,
          viewport: _v,
          variants: _vars,
          ...rest
        } = props;
        return React.createElement(
          "div",
          { "data-testid": "motion-div", ref, ...rest },
          props.children
        );
      }
    ),
  },
  MotionConfig: ({ children }: { children: React.ReactNode }) => children,
}));

import { HeroMotion } from "../../../src/components/HeroMotion";

afterEach(() => {
  cleanup();
  capturedProps.length = 0;
});

describe("HeroMotion", () => {
  // --- Testes base ---

  it("renderiza children passados como prop", () => {
    render(
      React.createElement(
        HeroMotion,
        null,
        React.createElement("h1", null, "Conteudo do Hero")
      )
    );
    expect(screen.getByText("Conteudo do Hero")).toBeTruthy();
  });

  it("existe elemento com data-testid='motion-div' quando ha multiplos children (Path A)", () => {
    const { container } = render(
      React.createElement(
        HeroMotion,
        null,
        React.createElement("span", null, "Filho 1"),
        React.createElement("span", null, "Filho 2")
      )
    );
    expect(container.querySelector("[data-testid='motion-div']")).toBeTruthy();
  });

  it("renderiza sem erros em ambiente sem browser (happy-dom)", () => {
    expect(() => {
      render(
        React.createElement(
          HeroMotion,
          null,
          React.createElement("p", null, "Texto de teste")
        )
      );
    }).not.toThrow();
  });

  it("children are visible regardless of reduced-motion preference", () => {
    const { container } = render(
      React.createElement(
        HeroMotion,
        null,
        React.createElement(
          "p",
          { "data-testid": "hero-child" },
          "Texto visivel mesmo com reduced-motion"
        )
      )
    );
    const child = container.querySelector("[data-testid='hero-child']");
    expect(child).toBeTruthy();
    expect(child?.textContent).toBe("Texto visivel mesmo com reduced-motion");
    // Path B (single child) usa <div> simples — motion.div ausente e esperado
  });

  // --- Testes ANIM-01 / ANIM-03 (Path A — multiplos children) ---

  it("container motion.div tem variants.visible.transition.staggerChildren === 0.12 (Path A)", () => {
    render(
      React.createElement(
        HeroMotion,
        null,
        React.createElement("h1", null, "Filho 1"),
        React.createElement("p", null, "Filho 2")
      )
    );

    // O container e o primeiro motion.div capturado
    const containerProps = capturedProps[0];
    expect(containerProps).toBeTruthy();

    const variants = containerProps.variants as Record<string, unknown>;
    expect(variants).toBeTruthy();

    const visible = variants.visible as Record<string, unknown>;
    expect(visible).toBeTruthy();

    const transition = visible.transition as Record<string, unknown>;
    expect(transition).toBeTruthy();
    expect(transition.staggerChildren).toBe(0.12);
  });

  it("renderiza um motion.div filho por child recebido (3 children -> 3 motion.div filhos alem do container)", () => {
    const { container } = render(
      React.createElement(
        HeroMotion,
        null,
        React.createElement("h1", null, "Titulo"),
        React.createElement("p", null, "Subtitulo"),
        React.createElement("div", null, "CTA")
      )
    );

    // Deve ter: 1 container + 3 filhos = 4 motion.div no total
    const allMotionDivs = container.querySelectorAll("[data-testid='motion-div']");
    expect(allMotionDivs.length).toBeGreaterThanOrEqual(4);
  });

  it("item variant tem hidden.opacity === 0 e hidden.y === 20", () => {
    render(
      React.createElement(
        HeroMotion,
        null,
        React.createElement("h1", null, "Filho 1"),
        React.createElement("p", null, "Filho 2")
      )
    );

    // O segundo motion.div capturado deve ser um item wrapper
    // (index 0 = container, index 1+ = itens)
    const itemProps = capturedProps[1];
    expect(itemProps).toBeTruthy();

    const variants = itemProps.variants as Record<string, unknown>;
    expect(variants).toBeTruthy();

    const hidden = variants.hidden as Record<string, unknown>;
    expect(hidden).toBeTruthy();
    expect(hidden.opacity).toBe(0);
    expect(hidden.y).toBe(20);
  });

  it("container tem animate='visible' e NAO tem prop whileInView (Path A)", () => {
    render(
      React.createElement(
        HeroMotion,
        null,
        React.createElement("h1", null, "Hero content"),
        React.createElement("p", null, "Segundo filho")
      )
    );

    const containerProps = capturedProps[0];
    expect(containerProps).toBeTruthy();

    // animate deve ser 'visible'
    expect(containerProps.animate).toBe("visible");

    // whileInView NAO deve estar definido
    expect(containerProps.whileInView).toBeUndefined();
  });

  it("HeroMotion.tsx nao contem a string 'easeOut' (verificacao estatica)", () => {
    const heroMotionPath = path.resolve(
      __dirname,
      "../../../src/components/HeroMotion.tsx"
    );
    const source = fs.readFileSync(heroMotionPath, "utf-8");
    expect(source).not.toContain("easeOut");
  });
});