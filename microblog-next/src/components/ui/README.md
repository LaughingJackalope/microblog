# UI Component Library

Shared component library using the MicroBlog Neo-Modern design system.

## Components

### Button

Versatile button component with multiple variants and states.

```tsx
import { Button } from '@/components/ui';

// Primary action (default)
<Button onClick={handleSubmit}>
  Post
</Button>

// Secondary
<Button variant="secondary" onClick={handleCancel}>
  Cancel
</Button>

// Danger
<Button variant="danger" onClick={handleDelete}>
  Delete
</Button>

// Ghost (minimal)
<Button variant="ghost" onClick={handleDismiss}>
  Dismiss
</Button>

// Accent (highlight)
<Button variant="accent" onClick={handleHighlight}>
  Featured Action
</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>

// Loading state
<Button isLoading disabled>
  Processing...
</Button>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'danger' | 'ghost' | 'accent'` (default: `'primary'`)
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `isLoading`: Shows spinner when true
- All native button props supported

---

### Input

Text input with label, error states, and helper text.

```tsx
import { Input } from '@/components/ui';

// Basic
<Input
  label="Username"
  placeholder="Enter username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>

// With helper text
<Input
  label="Email"
  type="email"
  helperText="We'll never share your email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// With error
<Input
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

// Hide label visually (still accessible)
<Input
  label="Search"
  showLabel={false}
  placeholder="Search posts..."
/>
```

**Props:**
- `label`: Label text
- `error`: Error message (shows red border and error text)
- `helperText`: Helper text below input
- `showLabel`: Show/hide label visually (default: `true`)
- All native input props supported

---

### Textarea

Auto-growing textarea with character counter.

```tsx
import { Textarea } from '@/components/ui';

// Basic
<Textarea
  label="Bio"
  placeholder="Tell us about yourself"
  value={bio}
  onChange={(e) => setBio(e.target.value)}
/>

// With character limit
<Textarea
  label="Post Content"
  placeholder="What's happening?"
  maxLength={280}
  showCharCount
  value={content}
  onChange={(e) => setContent(e.target.value)}
/>

// With auto-grow
<Textarea
  label="Comment"
  autoGrow
  minRows={3}
  value={comment}
  onChange={(e) => setComment(e.target.value)}
/>

// With error
<Textarea
  label="Message"
  error="Message is required"
  value={message}
  onChange={(e) => setMessage(e.target.value)}
/>
```

**Props:**
- `label`: Label text
- `error`: Error message
- `helperText`: Helper text below textarea
- `showLabel`: Show/hide label visually (default: `true`)
- `maxLength`: Character limit
- `showCharCount`: Show character counter (default: `true` if `maxLength` set)
- `autoGrow`: Auto-resize based on content (default: `true`)
- `minRows`: Minimum rows (default: `3`)
- All native textarea props supported

---

### Card, Panel, Section

Container components for different layout needs.

```tsx
import { Card, Panel, Section } from '@/components/ui';

// Card - Elevated with border and shadow
<Card>
  <h3>Basic Card</h3>
  <p>Content goes here</p>
</Card>

// Card variants
<Card variant="elevated">Elevated (default)</Card>
<Card variant="outlined">Outlined only</Card>
<Card variant="flat">Flat (no border)</Card>

// Card padding
<Card padding="none">No padding</Card>
<Card padding="snug">Snug padding</Card>
<Card padding="comfortable">Comfortable (default)</Card>
<Card padding="relaxed">Relaxed padding</Card>
<Card padding="spacious">Spacious padding</Card>

// Interactive card (hover effect)
<Card interactive onClick={handleClick}>
  Clickable card
</Card>

// Panel - Simple background container
<Panel>
  <h3>Panel</h3>
  <p>No border, just background</p>
</Panel>

// Section - Card with header/footer
<Section
  title="Profile Settings"
  description="Manage your account preferences"
  action={<Button size="sm">Save</Button>}
  footer={<p className="text-body-sm text-ink-muted">Last updated 2 hours ago</p>}
>
  <p>Section content goes here</p>
</Section>
```

**Card Props:**
- `variant`: `'elevated' | 'outlined' | 'flat'` (default: `'elevated'`)
- `padding`: `'none' | 'snug' | 'comfortable' | 'relaxed' | 'spacious'` (default: `'relaxed'`)
- `interactive`: Enable hover effects (default: `false`)

**Panel Props:**
- `padding`: Same as Card (default: `'relaxed'`)

**Section Props:**
- `title`: Section title
- `description`: Section description
- `action`: Action element in header (e.g., button)
- `footer`: Footer content
- `padding`: Same as Card (default: `'relaxed'`)

---

### Toast

Global toast notification system.

```tsx
import { ToastProvider, useToast } from '@/components/ui';

// 1. Wrap your app with ToastProvider (in layout.tsx)
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

// 2. Use in components
function MyComponent() {
  const { addToast } = useToast();

  const handleSuccess = () => {
    addToast('success', 'Post created successfully!');
  };

  const handleError = () => {
    addToast('error', 'Failed to save changes');
  };

  const handleWarning = () => {
    addToast('warning', 'This action cannot be undone');
  };

  const handleInfo = () => {
    addToast('info', 'New features are available');
  };

  return (
    <div>
      <Button onClick={handleSuccess}>Success Toast</Button>
      <Button onClick={handleError}>Error Toast</Button>
      <Button onClick={handleWarning}>Warning Toast</Button>
      <Button onClick={handleInfo}>Info Toast</Button>
    </div>
  );
}
```

**API:**
- `addToast(type, message, duration?)`: Add a toast notification
  - `type`: `'success' | 'error' | 'warning' | 'info'`
  - `message`: Toast message
  - `duration`: Auto-dismiss duration in ms (default: `5000`, set to `0` for no auto-dismiss)
- `removeToast(id)`: Manually remove a toast

---

## Migration Guide

### From Old Button to New Button

**Before:**
```tsx
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
  Post
</button>
```

**After:**
```tsx
<Button>Post</Button>
```

### From Old Input to New Input

**Before:**
```tsx
<div>
  <label className="block text-sm font-medium text-gray-700">
    Username
  </label>
  <input
    type="text"
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
  />
</div>
```

**After:**
```tsx
<Input label="Username" />
```

### From Old Card to New Card

**Before:**
```tsx
<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
  Content
</div>
```

**After:**
```tsx
<Card>Content</Card>
```

### From Alert to Toast

**Before:**
```tsx
if (error) {
  alert('Something went wrong');
}
```

**After:**
```tsx
const { addToast } = useToast();

if (error) {
  addToast('error', 'Something went wrong');
}
```

---

## Design Tokens

All components use semantic design tokens from `globals.css`:

**Colors:**
- `bg-action`, `bg-action-hover` - Primary actions
- `bg-highlight`, `bg-highlight-hover` - Accent/highlight
- `text-ink`, `text-ink-muted`, `text-ink-whisper` - Text hierarchy
- `bg-surface`, `bg-canvas` - Backgrounds
- `border-border` - Borders

**Spacing:**
- `p-tight`, `p-snug`, `p-comfortable`, `p-relaxed`, `p-spacious` - Padding
- `gap-comfortable`, `space-y-relaxed` - Gaps

**Shadows:**
- `shadow-soft`, `shadow-medium`, `shadow-lifted` - Elevation

**Transitions:**
- `duration-fast`, `duration-base`, `duration-slow` - Timing
- `ease-out`, `ease-bounce` - Easing

See `DESIGN_SYSTEM.md` for full documentation.

---

## Accessibility

All components follow WCAG 2.1 AA standards:

- ✅ Proper label associations
- ✅ Focus management
- ✅ Keyboard navigation
- ✅ ARIA attributes
- ✅ Color contrast (4.5:1 for text)
- ✅ Screen reader support

---

## Examples

### Login Form

```tsx
'use client';

import { useState } from 'react';
import { Button, Input, Card, useToast } from '@/components/ui';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(username, password);
      addToast('success', 'Logged in successfully!');
    } catch (error) {
      setErrors({ password: 'Invalid credentials' });
      addToast('error', 'Login failed. Please try again.');
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-comfortable">
        <Input
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errors.username}
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
        />

        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>
    </Card>
  );
}
```

### Post Creation

```tsx
'use client';

import { useState } from 'react';
import { Button, Textarea, Card, useToast } from '@/components/ui';

export function CreatePost() {
  const [content, setContent] = useState('');
  const { addToast } = useToast();

  const handleSubmit = async () => {
    try {
      await createPost(content);
      setContent('');
      addToast('success', 'Post published!');
    } catch (error) {
      addToast('error', 'Failed to publish post');
    }
  };

  return (
    <Card>
      <Textarea
        label="What's happening?"
        showLabel={false}
        placeholder="Share your thoughts..."
        maxLength={280}
        showCharCount
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="mt-comfortable flex justify-end">
        <Button onClick={handleSubmit} disabled={!content.trim()}>
          Post
        </Button>
      </div>
    </Card>
  );
}
```

---

**Next Steps:**
1. Wrap root layout with `ToastProvider`
2. Replace old button/input/card usage with new components
3. Remove inline styling in favor of component props
4. Use semantic tokens for custom styling