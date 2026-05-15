// src/components/CarouselMotion.tsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import { animate } from "motion";
import { useMotionEnabled, isMotionSupported, applyFallback } from "../lib/motion-utils";

// Simple carousel item type
interface Item {
  id: string;
  content: React.ReactNode;
}

export const CarouselMotion: React.FC<{ items: Item[] }> = ({ items }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const motionEnabled = useMotionEnabled();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (motionEnabled && isMotionSupported()) {
      // Stop any existing animation before starting a new one
      if (animationRef.current) {
        animationRef.current.stop();
      }

      // x property is the correct shorthand for translateX in motion's DOM API
      animationRef.current = animate(
        el,
        { x: ["0%", `${-(items.length) * 100}%`] },
        {
          duration: 4,
          repeat: Infinity,
          ease: "linear",
        }
      );
    } else {
      // Fallback: no animation, just show the first item
      applyFallback(el, { transform: "translateX(0)" });
    }

    // Cleanup on unmount
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, [motionEnabled, items.length]);

  const handleMouseEnter = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.pause();
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.play();
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowRight") {
        const nextIndex = (currentIndex + 1) % items.length;
        setCurrentIndex(nextIndex);
        const el = containerRef.current;
        if (el && (!motionEnabled || !isMotionSupported())) {
          applyFallback(el, { transform: `translateX(-${nextIndex * 100}%)` });
        }
      } else if (e.key === "ArrowLeft") {
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        setCurrentIndex(prevIndex);
        const el = containerRef.current;
        if (el && (!motionEnabled || !isMotionSupported())) {
          applyFallback(el, { transform: `translateX(-${prevIndex * 100}%)` });
        }
      }
    },
    [currentIndex, items.length, motionEnabled]
  );

  return (
    <div
      role="region"
      aria-label="Testimonials carousel"
      tabIndex={0}
      style={{ overflow: "hidden", outline: "none" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
    >
      <div
        className="carousel-track"
        ref={containerRef}
        style={{ display: "flex" }}
      >
        {items.map((item) => (
          <div key={item.id} className="carousel-item" style={{ minWidth: "100%" }}>
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
};
