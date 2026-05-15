// src/components/MobileMenuMotion.tsx
import React, { useRef, useEffect, useState } from "react";
import { motion } from "motion/react";
import { useMotionEnabled, applyFallback } from "../lib/motion-utils";

export const MobileMenuMotion: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [motionEnabled] = useMotionEnabled();
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Listen for toggle-menu CustomEvent dispatched by NavBar hamburger button
  useEffect(() => {
    const handler = () => setIsOpen(prev => !prev);
    window.addEventListener("toggle-menu", handler);
    return () => window.removeEventListener("toggle-menu", handler);
  }, []);

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
        ref={navRef}
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
