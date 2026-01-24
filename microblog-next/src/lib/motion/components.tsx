'use client';

import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import { ReactNode } from 'react';
import {
  fadeIn,
  slideInFromBottom,
  slideInFromTop,
  slideInFromLeft,
  slideInFromRight,
  scaleIn,
  popIn,
  slideAndFade,
  staggerContainer,
  staggerItem,
  pageTransition,
} from './presets';

// === FADE COMPONENTS ===

interface FadeInProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  delay?: number;
}

export function FadeIn({ children, delay = 0, ...props }: FadeInProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// === SLIDE COMPONENTS ===

interface SlideInProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  delay?: number;
}

export function SlideIn({
  children,
  direction = 'bottom',
  delay = 0,
  ...props
}: SlideInProps) {
  const variants: Record<string, Variants> = {
    left: slideInFromLeft,
    right: slideInFromRight,
    top: slideInFromTop,
    bottom: slideInFromBottom,
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants[direction]}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// === SCALE COMPONENTS ===

interface ScaleInProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  delay?: number;
}

export function ScaleIn({ children, delay = 0, ...props }: ScaleInProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={scaleIn}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function PopIn({ children, delay = 0, ...props }: ScaleInProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={popIn}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// === LIST COMPONENTS ===

interface StaggerListProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
}

export function StaggerList({
  children,
  staggerDelay = 0.1,
  delayChildren = 0.05,
  ...props
}: StaggerListProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      transition={{
        staggerChildren: staggerDelay,
        delayChildren,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
}

export function StaggerItem({ children, ...props }: StaggerItemProps) {
  return (
    <motion.div variants={staggerItem} {...props}>
      {children}
    </motion.div>
  );
}

// === PAGE TRANSITION ===

interface PageTransitionProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
}

export function PageTransition({ children, ...props }: PageTransitionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageTransition}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// === PRESENCE COMPONENTS (with exit animations) ===

interface PresenceProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  show: boolean;
}

export function FadePresence({ show, children, ...props }: PresenceProps) {
  if (!show) return null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={slideAndFade}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// === INTERACTIVE COMPONENTS ===

interface HoverScaleProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  scale?: number;
}

export function HoverScale({
  children,
  scale = 1.05,
  ...props
}: HoverScaleProps) {
  return (
    <motion.div whileHover={{ scale }} whileTap={{ scale: 0.95 }} {...props}>
      {children}
    </motion.div>
  );
}

interface HoverLiftProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  distance?: number;
}

export function HoverLift({
  children,
  distance = -4,
  ...props
}: HoverLiftProps) {
  return (
    <motion.div
      whileHover={{ y: distance }}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// === COLLAPSE/EXPAND ===

interface CollapseProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  isOpen: boolean;
}

export function Collapse({ isOpen, children, ...props }: CollapseProps) {
  return (
    <motion.div
      initial={false}
      animate={{
        height: isOpen ? 'auto' : 0,
        opacity: isOpen ? 1 : 0,
      }}
      transition={{
        duration: 0.35,
        ease: [0.4, 0, 0.2, 1],
      }}
      style={{ overflow: 'hidden' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// === GESTURE COMPONENTS ===

interface SwipeableProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function Swipeable({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  ...props
}: SwipeableProps) {
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.x < -threshold && onSwipeLeft) {
          onSwipeLeft();
        } else if (info.offset.x > threshold && onSwipeRight) {
          onSwipeRight();
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// === LOADING COMPONENTS ===

interface PulseProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
}

export function Pulse({ children, ...props }: PulseProps) {
  return (
    <motion.div
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        repeat: Infinity,
        duration: 1.5,
        ease: 'easeInOut',
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Spinner({ ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        repeat: Infinity,
        duration: 1,
        ease: 'linear',
      }}
      {...props}
    >
      <svg
        className="w-5 h-5 text-action"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );
}

// === NOTIFICATION BADGE ===

interface BadgeProps extends HTMLMotionProps<'span'> {
  count?: number;
  showPulse?: boolean;
}

export function NotificationBadge({
  count = 0,
  showPulse = true,
  ...props
}: BadgeProps) {
  if (count === 0) return null;

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className="absolute -top-1 -right-1 bg-danger-500 text-surface text-caption font-bold rounded-round min-w-[1.25rem] h-5 flex items-center justify-center px-tight"
      {...props}
    >
      {showPulse && (
        <motion.span
          className="absolute inset-0 rounded-round bg-danger-500"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: 'easeInOut',
          }}
        />
      )}
      <span className="relative z-10">{count > 99 ? '99+' : count}</span>
    </motion.span>
  );
}

// === LIKE BUTTON ===

interface LikeButtonProps extends HTMLMotionProps<'button'> {
  isLiked: boolean;
  count?: number;
  onToggle: () => void;
}

export function LikeButton({
  isLiked,
  count,
  onToggle,
  ...props
}: LikeButtonProps) {
  return (
    <motion.button
      onClick={onToggle}
      className="flex items-center gap-tight text-ink-muted hover:text-danger-500 transition-colors duration-fast"
      whileTap={{ scale: 0.9 }}
      {...props}
    >
      <motion.svg
        className="w-5 h-5"
        fill={isLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        animate={{
          scale: isLiked ? [1, 1.3, 1] : 1,
          fill: isLiked ? '#ef4444' : 'none',
        }}
        transition={{
          duration: 0.25,
          ease: [0.68, -0.55, 0.265, 1.55],
        }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </motion.svg>
      {count !== undefined && count > 0 && (
        <motion.span
          className="text-body-sm font-medium"
          animate={{ scale: isLiked ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.15 }}
        >
          {count}
        </motion.span>
      )}
    </motion.button>
  );
}