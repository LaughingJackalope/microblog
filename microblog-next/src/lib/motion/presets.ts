import { Variants, Transition } from 'framer-motion';

/**
 * Motion Presets for MicroBlog
 *
 * Philosophy: Organic, intentional motion that enhances UX
 * - Fast micro-interactions (150ms)
 * - Base transitions (250ms)
 * - Slow layout changes (350ms)
 * - Playful moments use bounce easing
 */

// === EASING CURVES ===
// Matches design tokens from globals.css

export const easings = {
  inOut: [0.4, 0, 0.2, 1],      // Balanced
  out: [0, 0, 0.2, 1],          // Entering elements
  in: [0.4, 0, 1, 1],           // Exiting elements
  bounce: [0.68, -0.55, 0.265, 1.55],  // Playful interactions
} as const;

export const durations = {
  fast: 0.15,      // 150ms - Micro-interactions
  base: 0.25,      // 250ms - Default
  slow: 0.35,      // 350ms - Layout changes
  slower: 0.5,     // 500ms - Page transitions
} as const;

// === TRANSITION PRESETS ===

export const transitions = {
  fast: {
    duration: durations.fast,
    ease: easings.out,
  },
  base: {
    duration: durations.base,
    ease: easings.out,
  },
  slow: {
    duration: durations.slow,
    ease: easings.inOut,
  },
  bounce: {
    duration: durations.base,
    ease: easings.bounce,
  },
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },
  springBouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 20,
  },
} as const satisfies Record<string, Transition>;

// === FADE VARIANTS ===

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.base,
  },
};

export const fadeInOut: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.base,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

// === SLIDE VARIANTS ===

export const slideInFromLeft: Variants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: transitions.base,
  },
};

export const slideInFromRight: Variants = {
  hidden: { x: 20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: transitions.base,
  },
};

export const slideInFromTop: Variants = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: transitions.base,
  },
};

export const slideInFromBottom: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: transitions.base,
  },
};

// === SCALE VARIANTS ===

export const scaleIn: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: transitions.base,
  },
};

export const scaleInBounce: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: transitions.bounce,
  },
};

export const popIn: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: transitions.springBouncy,
  },
};

// === COMBINED VARIANTS ===

export const slideAndScale: Variants = {
  hidden: { y: 20, scale: 0.95, opacity: 0 },
  visible: {
    y: 0,
    scale: 1,
    opacity: 1,
    transition: transitions.slow,
  },
};

export const slideAndFade: Variants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: transitions.base,
  },
  exit: {
    y: -10,
    opacity: 0,
    transition: transitions.fast,
  },
};

// === LIST VARIANTS (Stagger children) ===

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: transitions.base,
  },
};

// === MICRO-INTERACTION VARIANTS ===

// Button press
export const buttonPress: Variants = {
  rest: { scale: 1 },
  pressed: {
    scale: 0.96,
    transition: { duration: durations.fast },
  },
};

// Hover lift
export const hoverLift: Variants = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -2,
    scale: 1.02,
    transition: transitions.fast,
  },
};

// Like animation (heart pop)
export const likeAnimation: Variants = {
  unliked: { scale: 1 },
  liked: {
    scale: [1, 1.3, 1],
    transition: {
      duration: durations.base,
      ease: easings.bounce,
    },
  },
};

// Notification badge pulse
export const badgePulse: Variants = {
  idle: { scale: 1 },
  pulse: {
    scale: [1, 1.2, 1],
    transition: {
      repeat: Infinity,
      duration: 1,
      ease: easings.inOut,
    },
  },
};

// === LAYOUT VARIANTS ===

// Collapse/Expand
export const collapse: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: transitions.base,
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: transitions.slow,
  },
};

// Modal
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.fast,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

export const modalContent: Variants = {
  hidden: {
    scale: 0.9,
    opacity: 0,
    y: 20,
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: transitions.slow,
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    y: 20,
    transition: transitions.fast,
  },
};

// Drawer (slide from side)
export const drawer: Variants = {
  closed: {
    x: '100%',
    transition: transitions.slow,
  },
  open: {
    x: 0,
    transition: transitions.slow,
  },
};

// === PAGE TRANSITION VARIANTS ===

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.slow,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: transitions.fast,
  },
};

// === LOADING VARIANTS ===

export const spinner: Variants = {
  animate: {
    rotate: 360,
    transition: {
      repeat: Infinity,
      duration: 1,
      ease: 'linear',
    },
  },
};

export const skeletonPulse: Variants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: easings.inOut,
    },
  },
};

// === GESTURE VARIANTS ===

// Swipeable card
export const swipeableCard: Variants = {
  center: {
    x: 0,
    opacity: 1,
    transition: transitions.spring,
  },
  left: {
    x: '-100%',
    opacity: 0,
    transition: transitions.slow,
  },
  right: {
    x: '100%',
    opacity: 0,
    transition: transitions.slow,
  },
};

// === UTILITY FUNCTION ===

/**
 * Create custom stagger container with configurable delays
 */
export function createStaggerContainer(
  staggerDelay = 0.1,
  delayChildren = 0.05
): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };
}

/**
 * Create custom fade + slide variant
 */
export function createSlideVariant(
  direction: 'left' | 'right' | 'up' | 'down',
  distance = 20
): Variants {
  const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';
  const value =
    direction === 'left' || direction === 'up' ? -distance : distance;

  return {
    hidden: { [axis]: value, opacity: 0 },
    visible: {
      [axis]: 0,
      opacity: 1,
      transition: transitions.base,
    },
  };
}