// src/components/SettingsToggle.tsx
import React from "react";
import { setMotionEnabled, useMotionEnabled } from "../lib/motion-utils";

export const SettingsToggle: React.FC = () => {
  const motionEnabled = useMotionEnabled();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMotionEnabled(e.target.checked);
  };

  return (
    <div>
      <label htmlFor="motion-toggle">Ativar animações</label>
      <input
        id="motion-toggle"
        type="checkbox"
        checked={motionEnabled}
        onChange={onChange}
        aria-label="Enable animations"
      />
    </div>
  );
};
