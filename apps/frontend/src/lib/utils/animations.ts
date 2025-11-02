import type { Variants } from "framer-motion";

// Page transitions
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.3,
    },
  },
};

// Stagger container
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Stagger item
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

// Card hover animation
export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },
};

// Button press animation
export const buttonPress = {
  scale: 0.95,
  transition: {
    duration: 0.1,
  },
};

// Fade in up
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96],
    },
  },
};

// Fade in scale
export const fadeInScale: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

// Slide in from left
export const slideInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

// Slide in from right
export const slideInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 60,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

// Modal animation
export const modalAnimation: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

// Bounce animation
export const bounceAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 0.6,
    ease: "easeInOut" as const,
    repeat: Infinity,
    repeatDelay: 1,
  },
};

// Pulse animation
export const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    ease: "easeInOut" as const,
    repeat: Infinity,
  },
};

// Rotate animation
export const rotateAnimation = {
  rotate: 360,
  transition: {
    duration: 2,
    ease: "linear" as const,
    repeat: Infinity,
  },
};

// Number counter animation
export const counterAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.1,
      duration: 0.5,
    },
  }),
};

// Loading dots animation
export const loadingDots: Variants = {
  start: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export const loadingDot: Variants = {
  start: {
    y: ["0%", "-50%", "0%"],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};
