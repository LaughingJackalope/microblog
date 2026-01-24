# Motion System

**Philosophy:** Organic, intentional motion that enhances UX without being distracting.

Built on Framer Motion with design tokens integration.

---

## Quick Start

```tsx
import { FadeIn, SlideIn, StaggerList, StaggerItem } from '@/lib/motion';

// Simple fade in
<FadeIn>
  <Card>Content fades in on mount</Card>
</FadeIn>

// Slide from direction
<SlideIn direction="bottom">
  <Post />
</SlideIn>

// Stagger list animation
<StaggerList>
  {posts.map(post => (
    <StaggerItem key={post.id}>
      <PostCard post={post} />
    </StaggerItem>
  ))}
</StaggerList>
```

---

## Core Principles

1. **Respect User Preferences** - All animations respect `prefers-reduced-motion`
2. **Intentional Timing** - Fast (150ms), Base (250ms), Slow (350ms), Slower (500ms)
3. **Organic Easing** - Bounce for playful moments, ease-out for entering
4. **Performance First** - GPU-accelerated transforms (opacity, scale, translate)

---

## Components

### FadeIn

Simple fade-in animation on mount.

```tsx
<FadeIn delay={0.2}>
  <Card>Fades in after 200ms</Card>
</FadeIn>
```

**Props:**
- `delay?: number` - Delay in seconds (default: `0`)
- All `motion.div` props

---

### SlideIn

Slide from specified direction.

```tsx
<SlideIn direction="left">
  <Notification />
</SlideIn>

<SlideIn direction="bottom" delay={0.1}>
  <Modal />
</SlideIn>
```

**Props:**
- `direction?: 'left' | 'right' | 'top' | 'bottom'` (default: `'bottom'`)
- `delay?: number` (default: `0`)
- All `motion.div` props

---

### ScaleIn / PopIn

Scale animations for emphasizing elements.

```tsx
// Gentle scale
<ScaleIn>
  <Button>Click me</Button>
</ScaleIn>

// Bouncy pop
<PopIn>
  <NotificationBadge count={5} />
</PopIn>
```

**Props:**
- `delay?: number` (default: `0`)
- All `motion.div` props

---

### StaggerList / StaggerItem

Animate list items with staggered delay.

```tsx
<StaggerList staggerDelay={0.1} delayChildren={0.05}>
  {items.map(item => (
    <StaggerItem key={item.id}>
      <Card>{item.content}</Card>
    </StaggerItem>
  ))}
</StaggerList>
```

**StaggerList Props:**
- `staggerDelay?: number` - Delay between items (default: `0.1`)
- `delayChildren?: number` - Initial delay before first item (default: `0.05`)
- All `motion.div` props

**StaggerItem Props:**
- All `motion.div` props

---

### PageTransition

Full-page transition animations.

```tsx
export default function MyPage() {
  return (
    <PageTransition>
      <h1>Page content</h1>
      {/* Page fades and slides in/out on navigation */}
    </PageTransition>
  );
}
```

**Note:** Requires `<AnimatePresence mode="wait">` wrapper in parent layout.

---

### HoverScale / HoverLift

Interactive hover effects.

```tsx
// Scale on hover
<HoverScale scale={1.05}>
  <Card>Scales up on hover</Card>
</HoverScale>

// Lift on hover
<HoverLift distance={-8}>
  <Button>Lifts up on hover</Button>
</HoverLift>
```

**HoverScale Props:**
- `scale?: number` (default: `1.05`)
- All `motion.div` props

**HoverLift Props:**
- `distance?: number` - Negative for upward (default: `-4`)
- All `motion.div` props

---

### Collapse

Expand/collapse with height animation.

```tsx
const [isOpen, setIsOpen] = useState(false);

<Collapse isOpen={isOpen}>
  <div>Collapsible content</div>
</Collapse>
```

**Props:**
- `isOpen: boolean` - Control open/closed state
- All `motion.div` props

---

### Swipeable

Add swipe gestures.

```tsx
<Swipeable
  onSwipeLeft={() => console.log('Swiped left')}
  onSwipeRight={() => console.log('Swiped right')}
  threshold={100}
>
  <PostCard />
</Swipeable>
```

**Props:**
- `onSwipeLeft?: () => void`
- `onSwipeRight?: () => void`
- `threshold?: number` - Distance in pixels (default: `50`)
- All `motion.div` props

---

### LikeButton

Animated like button with heart pop.

```tsx
const [isLiked, setIsLiked] = useState(false);
const [count, setCount] = useState(42);

<LikeButton
  isLiked={isLiked}
  count={count}
  onToggle={() => {
    setIsLiked(!isLiked);
    setCount(isLiked ? count - 1 : count + 1);
  }}
/>
```

**Props:**
- `isLiked: boolean` - Current liked state
- `count?: number` - Like count to display
- `onToggle: () => void` - Toggle handler
- All `motion.button` props

---

### NotificationBadge

Animated notification badge with pulse.

```tsx
<div className="relative">
  <button>Notifications</button>
  <NotificationBadge count={5} showPulse />
</div>
```

**Props:**
- `count?: number` - Notification count (default: `0`)
- `showPulse?: boolean` - Show pulse animation (default: `true`)
- All `motion.span` props

---

### Spinner / Pulse

Loading animations.

```tsx
// Spinning loader
<Spinner />

// Pulsing skeleton
<Pulse>
  <div className="h-20 w-full bg-border rounded-comfortable" />
</Pulse>
```

---

## Presets & Variants

Pre-built animation variants you can use directly.

```tsx
import { motion } from 'framer-motion';
import { fadeIn, slideInFromBottom, scaleInBounce } from '@/lib/motion';

<motion.div
  initial="hidden"
  animate="visible"
  variants={fadeIn}
>
  Content
</motion.div>
```

### Available Presets

**Fade:**
- `fadeIn` - Simple fade in
- `fadeInOut` - Fade in with exit animation

**Slide:**
- `slideInFromLeft`
- `slideInFromRight`
- `slideInFromTop`
- `slideInFromBottom`

**Scale:**
- `scaleIn` - Gentle scale
- `scaleInBounce` - Bouncy scale
- `popIn` - Spring-based pop

**Combined:**
- `slideAndScale` - Slide + scale
- `slideAndFade` - Slide + fade with exit

**List:**
- `staggerContainer` - Container for staggered children
- `staggerItem` - Individual staggered item

**Layout:**
- `collapse` - Collapse/expand animation
- `modalBackdrop` - Modal backdrop fade
- `modalContent` - Modal content animation
- `drawer` - Side drawer slide
- `pageTransition` - Page route transition

**Micro-interactions:**
- `buttonPress` - Button press effect
- `hoverLift` - Hover lift effect
- `likeAnimation` - Heart pop animation
- `badgePulse` - Badge pulse animation

---

## Utilities

### Accessibility

```tsx
import { useRespectMotionPreference, createAccessibleVariant } from '@/lib/motion';

// Check if user prefers reduced motion
const prefersReducedMotion = useRespectMotionPreference();

// Create variant that respects preference
const accessibleVariant = createAccessibleVariant(fadeIn);
```

### Stagger Helpers

```tsx
import { createStagger, getStaggerDelay } from '@/lib/motion';

// Create custom stagger timing
const stagger = createStagger(0.15, 0.1);

// Calculate delay for nth item
const delay = getStaggerDelay(index, 0.1);
```

### Viewport Animations

```tsx
import { motion } from 'framer-motion';
import { createViewportAnimation, fadeIn } from '@/lib/motion';

<motion.div
  initial="hidden"
  whileInView="visible"
  variants={fadeIn}
  {...createViewportAnimation(true, 0.3)}
>
  Animates when 30% visible
</motion.div>
```

### Custom Animations

```tsx
import {
  createSlideVariant,
  createStaggerContainer,
  createModalAnimation,
  createDrawerAnimation,
} from '@/lib/motion';

// Custom slide direction
const slideLeft = createSlideVariant('left', 30);

// Custom stagger timing
const fastStagger = createStaggerContainer(0.05, 0);

// Modal animations
const modal = createModalAnimation();

// Drawer from side
const drawerRight = createDrawerAnimation('right');
```

---

## Advanced Patterns

### Page Transitions

```tsx
// app/layout.tsx
import { AnimatePresence } from '@/lib/motion';

export default function Layout({ children }) {
  return (
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  );
}

// app/page.tsx
import { PageTransition } from '@/lib/motion';

export default function Page() {
  return (
    <PageTransition>
      <h1>Content</h1>
    </PageTransition>
  );
}
```

### Shared Element Transitions

```tsx
import { motion } from 'framer-motion';

// List item
<motion.div layoutId={`post-${post.id}`}>
  <PostCard post={post} />
</motion.div>

// Detail page (same layoutId)
<motion.div layoutId={`post-${post.id}`}>
  <PostDetail post={post} />
</motion.div>
```

### Gesture-Based Interactions

```tsx
import { motion } from 'framer-motion';

<motion.div
  drag="x"
  dragConstraints={{ left: -100, right: 100 }}
  dragElastic={0.2}
  onDragEnd={(e, info) => {
    if (info.offset.x > 50) {
      // Swiped right
    }
  }}
>
  Swipeable card
</motion.div>
```

### Modal with Backdrop

```tsx
import { motion, AnimatePresence } from '@/lib/motion';
import { modalBackdrop, modalContent } from '@/lib/motion';

<AnimatePresence>
  {isOpen && (
    <>
      <motion.div
        variants={modalBackdrop}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
        className="fixed inset-0 bg-ink/50 z-modal-backdrop"
      />
      <motion.div
        variants={modalContent}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 flex items-center justify-center z-modal p-comfortable"
      >
        <Card>Modal content</Card>
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### Optimistic UI Updates

```tsx
import { motion, AnimatePresence } from '@/lib/motion';

<AnimatePresence mode="popLayout">
  {posts.map(post => (
    <motion.div
      key={post.id}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <PostCard post={post} />
    </motion.div>
  ))}
</AnimatePresence>
```

---

## Performance Tips

1. **Use GPU-accelerated properties**: `opacity`, `scale`, `rotate`, `x`, `y`
2. **Avoid animating**: `height`, `width`, `top`, `left` (use `scale` and `translate` instead)
3. **Use `layout` prop** for size/position changes: `<motion.div layout>`
4. **Reduce motion for lists**: Limit stagger items to ~50 for best performance
5. **Use `will-change`** sparingly: Framer Motion handles this automatically

---

## Accessibility Checklist

- ✅ All animations respect `prefers-reduced-motion`
- ✅ Instant transitions (0.01ms) when motion is reduced
- ✅ Focus states remain visible during animations
- ✅ Interactive elements remain keyboard-accessible
- ✅ ARIA live regions for dynamic content
- ✅ No essential information conveyed through motion alone

---

## Examples

### Animated Timeline

```tsx
import { StaggerList, StaggerItem } from '@/lib/motion';

export function Timeline({ posts }) {
  return (
    <StaggerList className="space-y-comfortable">
      {posts.map(post => (
        <StaggerItem key={post.id}>
          <PostCard post={post} />
        </StaggerItem>
      ))}
    </StaggerList>
  );
}
```

### Interactive Post Card

```tsx
import { HoverLift, LikeButton } from '@/lib/motion';

export function PostCard({ post }) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <HoverLift>
      <Card>
        <p>{post.content}</p>
        <LikeButton
          isLiked={isLiked}
          count={post.likeCount}
          onToggle={() => setIsLiked(!isLiked)}
        />
      </Card>
    </HoverLift>
  );
}
```

### Modal Dialog

```tsx
import { AnimatePresence, motion } from '@/lib/motion';
import { modalBackdrop, modalContent } from '@/lib/motion';

export function Modal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-ink/50 z-modal-backdrop"
          />
          <div className="fixed inset-0 flex items-center justify-center z-modal p-comfortable">
            <motion.div
              variants={modalContent}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Card>{children}</Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
```

### Pull-to-Refresh

```tsx
import { motion, useDragControls } from '@/lib/motion';

export function PullToRefresh({ onRefresh, children }) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e, info) => {
        setIsDragging(false);
        if (info.offset.y > 100) {
          onRefresh();
        }
      }}
    >
      {isDragging && (
        <div className="text-center py-comfortable">
          <Spinner />
        </div>
      )}
      {children}
    </motion.div>
  );
}
```

---

## Migration Guide

### From CSS Transitions

**Before:**
```tsx
<div className="transition-opacity duration-300 hover:opacity-80">
  Content
</div>
```

**After:**
```tsx
<motion.div
  initial={{ opacity: 1 }}
  whileHover={{ opacity: 0.8 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

Or use presets:
```tsx
<HoverScale scale={0.98}>
  <Content />
</HoverScale>
```

### From React Spring

**Before:**
```tsx
const props = useSpring({ opacity: isVisible ? 1 : 0 });
return <animated.div style={props}>Content</animated.div>
```

**After:**
```tsx
<motion.div animate={{ opacity: isVisible ? 1 : 0 }}>
  Content
</motion.div>
```

Or use components:
```tsx
<FadePresence show={isVisible}>
  <Content />
</FadePresence>
```

---

**Next:** Use motion system to redesign Timeline as signature feature!