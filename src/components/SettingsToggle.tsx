// src/components/SettingsToggle.tsx
import React, { useState } from "react";
import { motion, MotionConfig, AnimatePresence, useReducedMotion } from "motion/react";
import { useMotionEnabled } from "../lib/motion-utils";

export const SettingsToggle: React.FC = () => {
  const [motionEnabled, setMotionEnabledUI] = useMotionEnabled();
  const prefersReduced = useReducedMotion();
  const [showHint, setShowHint] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMotionEnabledUI(e.target.checked);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div
        role="group"
        aria-label="Controle de animações"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 16px",
          background: "rgba(10, 15, 30, 0.92)",
          border: "1px solid var(--hairline, rgba(255,255,255,0.12))",
          borderRadius: "4px",
          backdropFilter: "blur(10px)",
        }}
        onMouseEnter={() => prefersReduced && setShowHint(true)}
        onMouseLeave={() => setShowHint(false)}
        onFocus={() => prefersReduced && setShowHint(true)}
        onBlur={() => setShowHint(false)}
      >
        {/* CR-01 fix: renderização condicional com AnimatePresence evita
            aria-live no DOM quando invisível — leitores de tela não anunciam
            conteúdo oculto por opacity:0 */}
        <AnimatePresence>
          {prefersReduced && showHint && (
            <motion.div
              key="hint"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              role="tooltip"
              style={{
                position: "absolute",
                bottom: "calc(100% + 10px)",
                right: 0,
                width: "220px",
                padding: "10px 12px",
                background: "rgba(10, 15, 30, 0.97)",
                border: "1px solid var(--hairline-strong, rgba(0,255,255,0.32))",
                borderRadius: "4px",
                fontSize: "11px",
                lineHeight: "1.5",
                color: "var(--texto-secundario, rgba(255,255,255,0.6))",
                fontFamily: "'JetBrains Mono', monospace",
                pointerEvents: "none",
              }}
            >
              Animações desativadas pela preferência do sistema.
              <br />
              <span style={{ color: "var(--nucleo-eletrico, #00FFFF)" }}>
                Ative em: Sistema → Acessibilidade → Efeitos visuais
              </span>
              {/* caret apontando para baixo */}
              <span
                style={{
                  position: "absolute",
                  bottom: "-6px",
                  right: "28px",
                  width: 0,
                  height: 0,
                  borderLeft: "6px solid transparent",
                  borderRight: "6px solid transparent",
                  borderTop: "6px solid var(--hairline-strong, rgba(0,255,255,0.32))",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.span
          data-testid="motion-label"
          animate={{ opacity: motionEnabled ? 1 : 0.4 }}
          transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
          style={{
            fontSize: "12px",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.1em",
            color: "var(--texto-secundario, rgba(255,255,255,0.6))",
            userSelect: "none",
          }}
        >
          Animações
        </motion.span>
        <label
          htmlFor="motion-toggle"
          style={{
            cursor: prefersReduced ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            opacity: prefersReduced ? 0.5 : 1,
          }}
          title={prefersReduced ? "Desativado pela preferência do sistema" : undefined}
        >
          <span
            style={{
              display: "inline-block",
              width: "36px",
              height: "20px",
              borderRadius: "10px",
              background: motionEnabled
                ? "var(--nucleo-eletrico, #00FFFF)"
                : "var(--hairline-strong, rgba(255,255,255,0.24))",
              position: "relative",
              transition: "background 0.15s ease-out",
            }}
          >
            <motion.span
              data-testid="motion-indicator"
              animate={{ x: motionEnabled ? 16 : 0 }}
              transition={
                motionEnabled
                  ? { type: "spring", stiffness: 400, damping: 30 }
                  : { duration: 0 }
              }
              style={{
                position: "absolute",
                top: "2px",
                left: "2px",
                width: "16px",
                height: "16px",
                borderRadius: "8px",
                background: "#fff",
              }}
            />
          </span>
          {/* WR-01 fix: disabled quando sistema bloqueia → impede ilusão de controle
              WR-02 fix: aria-label em português */}
          <input
            id="motion-toggle"
            type="checkbox"
            checked={motionEnabled}
            onChange={onChange}
            disabled={!!prefersReduced}
            aria-label="Ativar animações"
            aria-describedby={prefersReduced ? "motion-system-hint" : undefined}
            style={{
              position: "absolute",
              opacity: 0,
              width: 0,
              height: 0,
            }}
          />
        </label>
        {/* Texto oculto para leitores de tela quando bloqueado pelo sistema */}
        {prefersReduced && (
          <span
            id="motion-system-hint"
            style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}
          >
            Animações desativadas pela configuração do sistema operacional.
          </span>
        )}
      </div>
    </MotionConfig>
  );
};
