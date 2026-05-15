import React from "react";
import { motion, MotionConfig } from "motion/react";

interface HeroMotionProps {
  children: React.ReactNode;
}

export function HeroMotion({ children }: HeroMotionProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.3 }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
