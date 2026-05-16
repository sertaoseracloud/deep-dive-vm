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
  const [motionEnabled] = useMotionEnabled();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (motionEnabled && isMotionSupported()) {
      // Stop any existing animation before starting a new one
      if (animationRef.current) {
        animationRef.current.stop();
      }

      // The track element (el) uses display:flex and each slide has minWidth:100% of the
      // outer viewport container. The track owns width = N x viewport width.
      // In motion animate(), x percentage is relative to the element OWN width.
      // To move from slide 0 to slide N-1: translate 0% to -((N-1)/N * 100)% of track.
      // repeatType mirror bounces from last slide back to first -- no blank screen.
      const endX = `-${((items.length - 1) / items.length) * 100}%`;
      animationRef.current = animate(
        el,
        { x: ["0%", endX] },
        {
          duration: items.length * 4,
          repeat: Infinity,
          repeatType: "mirror",
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
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();

      const nextIndex =
        e.key === "ArrowRight"
          ? (currentIndex + 1) % items.length
          : (currentIndex - 1 + items.length) % items.length;
      setCurrentIndex(nextIndex);

      const el = containerRef.current;
      if (!el) return;

      // Pause auto-scroll when user navigates via keyboard
      if (motionEnabled && animationRef.current) {
        animationRef.current.pause();
      }

      // Animate to the correct slide regardless of motion mode.
      // Position = -(nextIndex / items.length * 100)% of track width.
      const targetX = `-${(nextIndex / items.length) * 100}%`;
      animationRef.current = animate(el, { x: targetX }, { duration: 0.15, ease: [0.0, 0.0, 0.2, 1] });
    },
    [currentIndex, items.length, motionEnabled]
  );

  return (
    <div
      role="region"
      aria-label="Testimonials carousel"
      tabIndex={0}
      style={{ overflow: "hidden" }}
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
