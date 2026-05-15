// src/components/SettingsToggle.tsx
import React from "react";
import { useMotionEnabled } from "../lib/motion-utils";

export const SettingsToggle: React.FC = () => {
  const [motionEnabled, setMotionEnabledUI] = useMotionEnabled();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMotionEnabledUI(e.target.checked);
  };

  return (
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
    >
      <span
        style={{
          fontSize: "12px",
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.1em",
          color: "var(--texto-secundario, rgba(255,255,255,0.6))",
          userSelect: "none",
        }}
      >
        Animações
      </span>
      <label
        htmlFor="motion-toggle"
        style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
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
          <span
            style={{
              position: "absolute",
              top: "2px",
              left: motionEnabled ? "18px" : "2px",
              width: "16px",
              height: "16px",
              borderRadius: "8px",
              background: "#fff",
              transition: "left 0.15s ease-out",
            }}
          />
        </span>
        <input
          id="motion-toggle"
          type="checkbox"
          checked={motionEnabled}
          onChange={onChange}
          aria-label="Enable animations"
          style={{
            position: "absolute",
            opacity: 0,
            width: 0,
            height: 0,
          }}
        />
      </label>
    </div>
  );
};
