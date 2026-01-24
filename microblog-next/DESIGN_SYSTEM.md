# MicroBlog Design System

**Philosophy:** Neo-Modern
**Aesthetic:** High contrast typography, sophisticated palette, intentional rhythm
**Principle:** Tokens express *feelings*, not just values

---

## 🎨 Color Philosophy

### Brand Identity

**Primary (Deep Indigo)** - Sophistication & Trust
- Not corporate blue, but distinctive and professional
- Use for: Primary actions, links, brand moments
- Tokens: `primary-{50-900}`, `action`, `action-hover`, `action-muted`

**Accent (Electric Amber)** - Energy & Creativity
- Warmth that pops against the cool primary
- Use for: Highlights, call-to-actions, special moments
- Tokens: `accent-{50-900}`, `highlight`, `highlight-hover`, `highlight-subtle`

### Semantic Colors

- **Success (Vibrant Emerald)** - Achievement, growth, positive feedback
- **Warning (Sunset Orange)** - Caution with warmth, not aggressive
- **Danger (Crimson)** - Urgent but approachable, not violent
- **Info (Cool Cyan)** - Calm, informative, supportive

### Foundation Colors

- **Canvas** - The base, warm white (not stark `#fff`)
- **Surface** - Elevated elements, pure white in light mode
- **Ink** - Primary text, almost black with brown warmth
- **Ink Muted** - Secondary text, warm grey
- **Ink Whisper** - Tertiary text, subtle hints

**Design Rule:** Never use pure black `#000` or pure white `#fff` for text. Always use warm tones.

---

## 📝 Typography Scale

### Hierarchy

```
Display (60px) - Hero moments, landing pages, big statements
H1 (36px) - Page titles
H2 (30px) - Section headers
H3 (24px) - Subsection headers
H4 (20px) - Component headers
Body Large (18px) - Emphasized body text
Body (16px) - Default text
Body Small (14px) - Secondary information
Caption (12px) - Metadata, timestamps
```

### Weights

- **Normal (400)** - Body text, comfortable reading
- **Medium (500)** - Slight emphasis, navigation
- **Semibold (600)** - Buttons, user names, important labels
- **Bold (700)** - Headings, strong emphasis
- **Black (900)** - Display text, maximum impact

### Usage Examples

```tsx
<h1 className="text-h1 font-bold text-ink">Page Title</h1>
<p className="text-body text-ink-muted">Secondary information</p>
<small className="text-caption text-ink-whisper">Metadata</small>
```

---

## 📏 Spacing System (Rhythmic Scale)

**Philosophy:** Semantic names create intentional rhythm

- **Tight (4px)** - Internal component spacing, icon gaps
- **Snug (8px)** - Form field spacing, small gaps
- **Comfortable (16px)** - Default spacing, paragraph gaps
- **Relaxed (24px)** - Section spacing, card padding
- **Spacious (32px)** - Major section breaks
- **Luxurious (48px)** - Hero spacing, landing page sections

**Design Rule:** Use these instead of arbitrary values. The rhythm creates visual coherence.

```tsx
<div className="p-relaxed space-y-comfortable">
  {/* 24px padding, 16px vertical rhythm */}
</div>
```

---

## 🎭 Shadows (Elevation System)

**Philosophy:** Shadows create depth without nostalgia

- **Subtle** - Barely there, 1-2px offset
- **Soft** - Default cards, gentle elevation
- **Medium** - Interactive elements, buttons
- **Lifted** - Modals, dropdowns, hover states
- **Floating** - High-priority overlays, tooltips

**Light Mode:** Black shadows with transparency
**Dark Mode:** White shadows with transparency (glow effect)

```tsx
<div className="shadow-soft bg-surface">Card</div>
<button className="shadow-medium hover:shadow-lifted transition-shadow">Button</button>
```

---

## 🔲 Border Radius

- **Tight (4px)** - Buttons, small elements
- **Comfortable (8px)** - Cards, inputs (default)
- **Relaxed (12px)** - Large cards, modals
- **Round (9999px)** - Avatars, pills, badges

**Design Rule:** Consistency matters. Most components use `comfortable`.

---

## ⚡️ Motion System

### Durations

- **Fast (150ms)** - Micro-interactions (hover, focus)
- **Base (250ms)** - Default transitions (color, opacity)
- **Slow (350ms)** - Layout changes (height, width)
- **Slower (500ms)** - Page transitions, complex animations

### Easing Curves

- **In-Out** - Default, balanced
- **Out** - Entering elements (start fast, end slow)
- **In** - Exiting elements (start slow, end fast)
- **Bounce** - Playful interactions (success states, likes)

**Design Rule:** Always specify easing. Default browser ease is too mechanical.

```tsx
<button className="transition-colors duration-fast ease-out hover:bg-action-hover">
  Button
</button>
```

---

## 🎯 Component Patterns

### Buttons

**Primary Action:**
```tsx
<button className="bg-action hover:bg-action-hover text-surface px-comfortable py-snug rounded-comfortable font-semibold shadow-medium transition-all duration-fast ease-out">
  Post
</button>
```

**Secondary Action:**
```tsx
<button className="bg-surface hover:bg-action-muted text-ink border border-border px-comfortable py-snug rounded-comfortable font-medium transition-all duration-fast">
  Cancel
</button>
```

**Danger Action:**
```tsx
<button className="bg-danger-500 hover:bg-danger-600 text-surface px-comfortable py-snug rounded-comfortable font-semibold shadow-medium">
  Delete
</button>
```

### Cards

**Default Card:**
```tsx
<article className="bg-surface rounded-comfortable shadow-soft p-relaxed border border-border">
  {/* Content */}
</article>
```

**Interactive Card (Hover):**
```tsx
<article className="bg-surface rounded-comfortable shadow-soft hover:shadow-medium p-relaxed border border-border transition-all duration-base cursor-pointer">
  {/* Content */}
</article>
```

### Inputs

```tsx
<input
  className="w-full px-comfortable py-snug rounded-comfortable border border-border bg-surface text-ink placeholder:text-ink-whisper focus:outline-none focus:ring-2 focus:ring-action focus:border-action transition-all duration-fast"
  placeholder="What's happening?"
/>
```

---

## 🌗 Dark Mode Strategy

**Not an afterthought.** Dark mode is designed, not inverted.

### Key Principles

1. **Canvas darkens** - `#fafaf9` → `#0a0a0a`
2. **Surface elevates** - Dark grey, not pure black
3. **Ink inverts** - Light text on dark background
4. **Borders soften** - Less contrast in dark mode
5. **Shadows become glows** - White shadows with transparency

### Testing Checklist

- [ ] All text has sufficient contrast (WCAG AA minimum)
- [ ] Interactive elements are visible in both modes
- [ ] Shadows don't disappear in dark mode
- [ ] Brand colors maintain vibrancy
- [ ] Transitions between modes are smooth

---

## ♿️ Accessibility Requirements

### Color Contrast

- **Body text:** Minimum 4.5:1 contrast ratio
- **Large text (18px+):** Minimum 3:1 contrast ratio
- **Interactive elements:** Minimum 3:1 against background

### Focus States

**Always visible.** Never remove outlines without replacement.

```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2">
  Accessible Button
</button>
```

### Motion

**Respect user preferences:**

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🚀 Usage in Components

### Migrating from Generic Tailwind

**Before:**
```tsx
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
  Post
</button>
```

**After:**
```tsx
<button className="bg-action hover:bg-action-hover text-surface px-comfortable py-snug rounded-comfortable font-semibold shadow-medium transition-all duration-fast">
  Post
</button>
```

**What changed:**
- `bg-blue-600` → `bg-action` (semantic, theme-aware)
- `px-4 py-2` → `px-comfortable py-snug` (intentional rhythm)
- `rounded-md` → `rounded-comfortable` (consistent radius)
- Added `shadow-medium` (elevation)
- Added `transition-all duration-fast` (smooth interactions)

---

## 📚 Token Reference

### Quick Lookup

**Colors:**
- Primary action: `bg-action`, `hover:bg-action-hover`
- Accent highlight: `bg-highlight`, `hover:bg-highlight-hover`
- Text: `text-ink`, `text-ink-muted`, `text-ink-whisper`
- Background: `bg-canvas`, `bg-surface`
- Borders: `border-border`, `border-border-muted`, `border-border-emphasis`

**Spacing:**
- Padding: `p-tight`, `p-snug`, `p-comfortable`, `p-relaxed`, `p-spacious`, `p-luxurious`
- Gaps: `gap-comfortable`, `space-y-relaxed`

**Typography:**
- Sizes: `text-display`, `text-h1`, `text-h2`, `text-body`, `text-caption`
- Weights: `font-normal`, `font-medium`, `font-semibold`, `font-bold`, `font-black`

**Effects:**
- Shadows: `shadow-subtle`, `shadow-soft`, `shadow-medium`, `shadow-lifted`, `shadow-floating`
- Radius: `rounded-tight`, `rounded-comfortable`, `rounded-relaxed`, `rounded-round`

**Motion:**
- Duration: `duration-fast`, `duration-base`, `duration-slow`
- Easing: `ease-in-out`, `ease-out`, `ease-in`, `ease-bounce`

---

## 🎨 Brand Personality

**MicroBlog is:**
- Sophisticated, not corporate
- Energetic, not chaotic
- Intentional, not minimal
- Warm, not cold
- Modern, not trendy

**MicroBlog is not:**
- Twitter clone blue
- Brutalist grey
- Stark white
- Generic SaaS
- 2010s gradient overdose

---

**Next Steps:**
1. Build shared component library using these tokens
2. Refactor existing components to use design system
3. Add motion system with Framer Motion
4. Redesign Timeline as signature feature