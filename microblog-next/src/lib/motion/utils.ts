'use client';

import { useReducedMotion } from 'framer-motion';
import { Variants, Transition } from 'framer-motion';
import { transitions } from './presets';

/**
 * Hook to respect user's motion preferences
 * Returns true if user prefers reduced motion
 */
export function useRespectMotionPreference() {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion;
}

/**
 * Create a variant that respects reduced motion preferences
 * If user prefers reduced motion, returns instant transition
 */
export function createAccessibleVariant(
  variant: Variants,
  shouldRespect = true
): Variants {
  if (!shouldRespect) return variant;

  const reducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  if (!reducedMotion) return variant;

  // Convert all transitions to instant
  const accessibleVariant: Variants = {};
  for (const key in variant) {
    const state = variant[key];
    if (typeof state === 'object') {
      accessibleVariant[key] = {
        ...state,
        transition: { duration: 0.01 },
      };
    }
  }

  return accessibleVariant;
}

/**
 * Get transition based on reduced motion preference
 */
export function getAccessibleTransition(
  transition: Transition = transitions.base,
  prefersReducedMotion = false
): Transition {
  if (!prefersReducedMotion) return transition;

  return { duration: 0.01 };
}

/**
 * Create stagger effect with configurable settings
 */
export function createStagger(
  staggerChildren = 0.1,
  delayChildren = 0
): Transition {
  return {
    staggerChildren,
    delayChildren,
  };
}

/**
 * Calculate stagger delay for nth item
 */
export function getStaggerDelay(index: number, baseDelay = 0.1): number {
  return index * baseDelay;
}

/**
 * Create viewport animation config
 * Element animates when it enters viewport
 */
export function createViewportAnimation(
  once = true,
  amount: number | 'some' | 'all' = 0.3
) {
  return {
    viewport: { once, amount },
  };
}

/**
 * Generate random animation delay for organic feel
 */
export function randomDelay(min = 0, max = 0.3): number {
  return Math.random() * (max - min) + min;
}

/**
 * Create layout animation config
 * For animating layout changes (size, position)
 */
export function createLayoutAnimation(type: 'position' | 'size' | true = true) {
  return {
    layout: type,
    transition: transitions.slow,
  };
}

/**
 * Create shared layout animation for route transitions
 */
export function createSharedLayout(layoutId: string) {
  return { layoutId };
}

/**
 * Exit animation helper
 * Ensures exit animations complete before component unmounts
 */
export function createExitAnimation(variants: Variants) {
  return {
    initial: 'hidden',
    animate: 'visible',
    exit: 'exit',
    variants,
  };
}

/**
 * Hover animation helper
 */
export function createHoverAnimation(
  scale = 1.05,
  duration = 0.15
): {
  whileHover: any;
  transition: Transition;
} {
  return {
    whileHover: { scale },
    transition: { duration },
  };
}

/**
 * Tap animation helper
 */
export function createTapAnimation(
  scale = 0.95,
  duration = 0.1
): {
  whileTap: any;
  transition: Transition;
} {
  return {
    whileTap: { scale },
    transition: { duration },
  };
}

/**
 * Focus animation helper
 */
export function createFocusAnimation(): {
  whileFocus: any;
  transition: Transition;
} {
  return {
    whileFocus: { scale: 1.02, borderColor: 'var(--action)' },
    transition: transitions.fast,
  };
}

/**
 * Drag animation helper
 */
export function createDragAnimation(
  dragConstraints = { left: 0, right: 0, top: 0, bottom: 0 },
  dragElastic = 0.2
) {
  return {
    drag: true,
    dragConstraints,
    dragElastic,
    dragTransition: transitions.spring,
  };
}

/**
 * Parallax scroll effect helper
 */
export function createParallaxEffect(distance = 50) {
  return {
    initial: { y: -distance },
    animate: { y: distance },
    transition: {
      repeat: Infinity,
      repeatType: 'reverse' as const,
      duration: 2,
      ease: 'easeInOut',
    },
  };
}

/**
 * Type-safe motion props builder
 */
export function buildMotionProps<T extends Record<string, any>>(
  props: T
): T {
  return props;
}

/**
 * Combine multiple variants
 */
export function combineVariants(...variants: Variants[]): Variants {
  return variants.reduce((acc, variant) => {
    return { ...acc, ...variant };
  }, {});
}

/**
 * Create loading skeleton animation
 */
export function createSkeletonAnimation() {
  return {
    animate: {
      opacity: [0.5, 1, 0.5],
    },
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'easeInOut',
    },
  };
}

/**
 * Create notification animation
 */
export function createNotificationAnimation(direction: 'top' | 'bottom' | 'left' | 'right' = 'top') {
  const offset = direction === 'top' || direction === 'bottom' ? 'y' : 'x';
  const value = direction === 'top' || direction === 'left' ? -100 : 100;

  return {
    initial: { [offset]: value, opacity: 0 },
    animate: { [offset]: 0, opacity: 1 },
    exit: { [offset]: value, opacity: 0 },
    transition: transitions.base,
  };
}

/**
 * Create modal animation with backdrop
 */
export function createModalAnimation() {
  return {
    backdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: transitions.fast,
    },
    content: {
      initial: { scale: 0.9, opacity: 0, y: 20 },
      animate: { scale: 1, opacity: 1, y: 0 },
      exit: { scale: 0.9, opacity: 0, y: 20 },
      transition: transitions.slow,
    },
  };
}

/**
 * Create drawer animation
 */
export function createDrawerAnimation(
  side: 'left' | 'right' | 'top' | 'bottom' = 'right'
) {
  const axis = side === 'left' || side === 'right' ? 'x' : 'y';
  const value = side === 'left' || side === 'top' ? '-100%' : '100%';

  return {
    initial: { [axis]: value },
    animate: { [axis]: 0 },
    exit: { [axis]: value },
    transition: transitions.slow,
  };
}

/**
 * Performance optimization: Skip animations during SSR
 */
export function isSSR(): boolean {
  return typeof window === 'undefined';
}

/**
 * Wrapper to conditionally apply animations
 */
export function conditionalMotion(
  shouldAnimate: boolean,
  animatedProps: any,
  staticProps: any = {}
) {
  return shouldAnimate ? { ...staticProps, ...animatedProps } : staticProps;
}