import React, { useRef, useEffect } from "react";
import { motion, MotionConfig } from "motion/react";

interface HeroMotionProps {
  children: React.ReactNode;
}

// Container variant: propaga staggerChildren para os filhos
const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

// Item variant: cada filho anima de opacity:0/y:20 para opacity:1/y:0
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

  // Caminho A: múltiplos children → React.Children.map com motion.div por filho
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

  // Caminho B: child único (Hero.astro passa um único <header>) →
  // useRef + querySelectorAll para animar elementos internos com animationDelay CSS
  // Estratégia adotada porque React.Children.count(children) === 1 em produção
  return <HeroMotionSingle>{children}</HeroMotionSingle>;
}

// Componente separado para usar hooks corretamente no caminho de child único
function HeroMotionSingle({ children }: HeroMotionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Respeitar preferência do sistema — não aplicar animações CSS se reduced-motion ativo
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    // Seleciona os elementos animáveis dentro do header do Hero
    const targets = containerRef.current.querySelectorAll<HTMLElement>(
      "h1, p.hero-sub, .hero-cta-row, .hero-points, .hero-meta, .eyebrow"
    );

    targets.forEach((el, i) => {
      el.style.animationDelay = `${i * 120}ms`;
      el.classList.add("hero-stagger-item");
    });
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        ref={containerRef}
        initial="hidden"
        animate="visible"
        variants={container}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
