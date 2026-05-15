// src/components/MobileMenuMotion.tsx
import React, { useRef, useEffect } from "react";
import { motion } from "motion/react";
import { useMotionEnabled, applyFallback } from "../lib/motion-utils";

interface MobileMenuMotionProps {
  isOpen: boolean;
  children?: React.ReactNode;
}

export const MobileMenuMotion: React.FC<MobileMenuMotionProps> = ({ isOpen, children }) => {
  const motionEnabled = useMotionEnabled();
  const navRef = useRef<HTMLElement>(null);

  // Fallback: apply CSS transform synchronously when motion is disabled
  useEffect(() => {
    if (!motionEnabled && navRef.current) {
      applyFallback(navRef.current, {
        transform: isOpen ? "translateX(0)" : "translateX(-100%)",
      });
    }
  }, [isOpen, motionEnabled]);

  if (motionEnabled) {
    return (
      <motion.nav
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? "0%" : "-100%" }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        aria-hidden={!isOpen}
        aria-label="Mobile navigation menu"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "280px",
          height: "100vh",
          background: "#fff",
          zIndex: 100,
        }}
      >
        {children}
      </motion.nav>
    );
  }

  return (
    <nav
      ref={navRef}
      aria-hidden={!isOpen}
      aria-label="Mobile navigation menu"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "280px",
        height: "100vh",
        background: "#fff",
        zIndex: 100,
        transform: isOpen ? "translateX(0)" : "translateX(-100%)",
      }}
    >
      {children}
    </nav>
  );
};
