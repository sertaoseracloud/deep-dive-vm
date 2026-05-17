import React, { useRef, useEffect } from "react";
import { motion, MotionConfig } from "motion/react";

interface HeroMotionProps {
  children: React.ReactNode;
}

// Container variant: propaga staggerChildren para os filhos (caminho A — multi-child)
const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

// Item variant: cada filho anima de opacity:0/y:20 para opacity:1/y:0 (caminho A)
const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

export function HeroMotion({ children }: HeroMotionProps) {
  const childCount = React.Children.count(children);

  // Caminho A: multiplos children -> React.Children.map com motion.div por filho
  if (childCount > 1) {
    return (
      <MotionConfig reducedMotion="user">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={container}
        >
          {React.Children.map(children, (child, i) => (
            <motion.div key={i} variants={item}>
              {child}
            </motion.div>
          ))}
        </motion.div>
      </MotionConfig>
    );
  }

  // Caminho B: child unico (Hero.astro passa um unico <header>) ->
  // useRef + querySelectorAll para animar elementos internos com animationDelay CSS
  return <HeroMotionSingle>{children}</HeroMotionSingle>;
}

// Componente separado para usar hooks corretamente no caminho de child unico.
// Usa <div> simples como wrapper para nao interferir no layout — sem motion.div
// (animacoes CSS via hero-stagger-item + animationDelay ja tratam o stagger).
function HeroMotionSingle({ children }: HeroMotionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Respeitar preferencia do sistema — nao aplicar animacoes CSS se reduced-motion ativo
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    // Seleciona os elementos animaveis dentro do header do Hero
    const targets = containerRef.current.querySelectorAll<HTMLElement>(
      "h1, p.hero-sub, .hero-cta-row, .hero-points, .hero-meta, .eyebrow"
    );

    targets.forEach((el, i) => {
      el.style.animationDelay = `${i * 120}ms`;
      el.classList.add("hero-stagger-item");
    });
  }, []);

  return <div ref={containerRef}>{children}</div>;
}