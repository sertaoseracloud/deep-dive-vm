// src/components/SettingsToggle.tsx
import React from "react";
import { useMotionEnabled } from "../lib/motion-utils";

export const SettingsToggle: React.FC = () => {
  const [motionEnabled, setMotionEnabledUI] = useMotionEnabled();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMotionEnabledUI(e.target.checked);
  };

  return (
    <div>
      <label htmlFor="motion-toggle">Ativar animacoes</label>
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
