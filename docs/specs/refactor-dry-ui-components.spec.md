# Refactor DRY — UI Reusable Components — Spec

## Overview

Full DRY refactoring of the Pulseo UI codebase. Extract reusable components, eliminate duplicated patterns, consolidate design tokens to CSS as single source of truth, replace inline SVGs with lucide icons, create animation utilities, and improve readability across both the Astro landing page and the React dashboard.

## Context

The codebase has grown organically across two features (landing page + dashboard + auth), accumulating:
- 15+ duplicate button implementations (inline styles + CSS classes)
- 20+ glass card instances without abstraction
- 30+ inline SVG icons that should be library components
- 200+ lines of duplicate GSAP animation code
- 10+ duplicate form input patterns
- 3 duplicate gradient orb backgrounds
- Duplicated design tokens (CSS vars + TypeScript constants)
- Utility functions scattered inside components instead of shared modules

## Functional Requirements

### FR-1: Shared UI Component Library (`src/components/ui/`)

Create a `src/components/ui/` directory with primitive reusable components. Each component that exists in both worlds gets an Astro version (`.astro`) and a React version (`.tsx`), sharing design tokens via CSS variables.

#### FR-1a: Button Component

- **Astro**: `src/components/ui/Button.astro`
- **React**: `src/components/ui/Button.tsx`
- **Variants**: `primary` (green gradient CTA), `secondary` (ghost/outline), `icon` (icon-only, no padding)
- **Sizes**: `sm`, `md`, `lg`
- **Props**: `variant`, `size`, `disabled`, `class`/`className`, `href` (renders `<a>` if provided), children/slot
- **Replaces**: `.cta-button`, `.cta-button-lg`, all inline `background: linear-gradient(135deg, #00D67E, #00B468)` styles, cancel buttons, icon buttons
- **Acceptance**: All 15+ button instances across the codebase use the Button component. No inline button styles remain.

#### FR-1b: Card Component

- **Astro**: `src/components/ui/Card.astro`
- **React**: `src/components/ui/Card.tsx`
- **Props**: `padding` (`sm` | `md` | `lg`), `borderColor` (optional, for colored borders), `class`/`className`, children/slot
- **Uses the existing `.glass` CSS class** internally (keep `.glass` in CSS since it's complex)
- **Replaces**: All `<div class="glass p-4">`, `<div class="glass p-6 md:p-8">`, etc.
- **Acceptance**: All glass card instances use the Card component. Consistent padding scale.

#### FR-1c: Input Component

- **React only**: `src/components/ui/Input.tsx`
- **Props**: `type`, `placeholder`, `value`, `onChange`, `error` (string, shows error state), `icon` (optional leading icon), `className`, all standard input attributes
- **Variants**: text input, search input (with icon), textarea
- **Replaces**: All repeated `bg-transparent border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:ring-1 focus:ring-green-primary` patterns
- **Export a `Textarea` variant** from the same file or a sibling file
- **Acceptance**: All form inputs in dashboard and auth use the Input component. No duplicate input class strings.

#### FR-1d: StatusBadge Component

- **React only**: `src/components/ui/StatusBadge.tsx`
- **Props**: `label`, `color` (hex string), `size` (`sm` | `md`)
- **Renders**: Pill-shaped badge with 20% opacity background of the given color
- **Replaces**: Inline badge markup in `TaskCard.tsx`, `FilterTabs.tsx`
- **Acceptance**: All status/color badges use StatusBadge.

#### FR-1e: Spinner Component

- **React only**: `src/components/ui/Spinner.tsx`
- **Props**: `size` (`sm` | `md` | `lg`), `className`
- **Replaces**: Duplicate `w-8 h-8 border-2 border-green-primary border-t-transparent rounded-full animate-spin` markup in `DashboardApp.tsx`, `TaskList.tsx`
- **Acceptance**: All loading spinners use Spinner component.

#### FR-1f: Avatar Component

- **React only**: `src/components/ui/Avatar.tsx`
- **Props**: `username`, `size` (`sm` | `md` | `lg`), `className`
- **Internally computes initials** from username (first 2 chars uppercase)
- **Replaces**: `getInitials()` function and inline avatar markup in `NavbarAuth.tsx`
- **Acceptance**: All user avatar displays use Avatar component.

#### FR-1g: GradientOrbs Component

- **Astro only**: `src/components/ui/GradientOrbs.astro`
- **Props**: `variant` (`hero` | `cta` | `auth`) or direct config (array of `{ color, size, position, blur, opacity }`)
- **Replaces**: Duplicate orb CSS in `HeroSection.astro`, `FinalCTA.astro`, `auth.astro`
- **Acceptance**: All gradient orb backgrounds use the GradientOrbs component. No duplicate orb CSS.

### FR-2: Icon Migration to Lucide

- **Install** `lucide-react` and `lucide-astro` packages
- **Replace all inline SVG icons** in React components with `lucide-react` imports
- **Replace all inline SVG icons** in Astro components with `lucide-astro` imports
- **Icons to replace**: Plus, Trash2, Search, Check, List, LayoutGrid (Kanban view), GripVertical (drag handle), X (close), ChevronDown, User, LogOut, ExternalLink, and any others found in the codebase
- **Delete** any leftover `src/components/icons/` directory if it exists
- **Acceptance**: Zero inline `<svg>` elements remain in components (except decorative/custom brand SVGs like the Pulseo logo). All functional icons use lucide.

### FR-3: Animation Utilities

- **Create** `src/utils/animations.ts`
- **Export helper functions**:
  - `registerGSAP()` — one-time GSAP + ScrollTrigger registration
  - `prefersReducedMotion()` — returns boolean
  - `scrollFadeIn(target, options?)` — standard scroll-triggered fade-in from below (y: 30, opacity: 0)
  - `scrollStagger(targets, options?)` — staggered scroll-triggered entrance
  - `scrollScale(target, options?)` — scale-based entrance animation
- **Default options**: trigger start `"top 70%"`, duration `0.8`, ease `"power3.out"`, stagger `0.1`
- **All helpers check `prefersReducedMotion()`** and no-op if true
- **Refactor all landing page sections** to use these helpers instead of duplicating GSAP setup
- **Acceptance**: No raw `gsap.from()` + `ScrollTrigger` setup duplicated across sections. Each section calls the utility functions.

### FR-4: Shared Utility Functions

- **Create** `src/utils/date.ts`:
  - `getRelativeTime(timestamp: number): string` — extracted from `TaskCard.tsx`
- **Create** `src/utils/column-helpers.ts`:
  - `getColumnColor(status: string, columns: Column[]): string`
  - `getColumnName(status: string, columns: Column[]): string`
  - Extracted from `TaskCard.tsx`
- **Acceptance**: No utility functions defined inside component files. All shared logic lives in `src/utils/`.

### FR-5: Design Token Consolidation

- **CSS variables in `global.css` @theme are the single source of truth**
- **Remove `src/utils/design-tokens.ts`** entirely
- **Migrate any JS references** to design tokens to use:
  - Tailwind utility classes where possible (preferred)
  - `getComputedStyle()` or CSS custom property access where JS values are truly needed (e.g., GSAP animations)
- **Ensure GSAP animations** that need color/easing values read from CSS variables or use hardcoded values with a comment referencing the CSS variable name
- **Acceptance**: `design-tokens.ts` is deleted. No duplicate token definitions exist.

### FR-6: CSS Cleanup — Migrate Simple Patterns to Tailwind

- **Migrate simple custom CSS classes to Tailwind utilities** where straightforward:
  - `.cta-button` / `.cta-button-lg` → replaced by Button component (Tailwind classes internally)
  - Typography classes (`.text-display`, `.text-heading`, etc.) — keep in CSS if they use `clamp()` (complex), otherwise migrate
  - Section padding patterns → Tailwind utilities
- **Keep complex CSS in stylesheets**:
  - `.glass` (backdrop-filter + layered backgrounds)
  - `.gradient-text` (background-clip)
  - `.noise-overlay` (pseudo-element)
  - Keyframe animations (`@keyframes`)
- **Remove dead CSS** — any classes no longer referenced after refactoring
- **Acceptance**: No simple utility-like custom CSS classes remain. Complex styles stay in CSS. No dead CSS.

### FR-7: Dropdown / Menu Factorization

- **React only**: `src/components/ui/DropdownMenu.tsx`
- **Props**: `trigger` (ReactNode), `items` (array of `{ label, onClick, icon?, danger? }`), `align` (`left` | `right`)
- **Replaces**: Duplicate dropdown patterns in `KanbanColumn.tsx` (column menu), `NavbarAuth.tsx` (user menu)
- **Handles**: click-outside closing, positioning, keyboard navigation (Escape to close)
- **Acceptance**: All dropdown menus use DropdownMenu. No duplicate dropdown positioning/styling logic.

### FR-8: Component Refactoring — Apply New Primitives

After creating the UI library (FR-1 through FR-7), systematically update every existing component to use the new primitives:

- **Landing page sections**: Use Button.astro, Card.astro, GradientOrbs.astro, lucide-astro icons, animation utilities
- **Dashboard components**: Use Button.tsx, Card.tsx, Input.tsx, StatusBadge.tsx, Spinner.tsx, Avatar.tsx, DropdownMenu.tsx, lucide-react icons
- **Auth components**: Use Button.tsx, Input.tsx, Card.tsx, lucide-react icons
- **Navbar**: Use Avatar.tsx, DropdownMenu.tsx, lucide icons
- **Acceptance**: Every component file has been reviewed and updated to use the new shared primitives. No inline SVG icons (except brand logo). No duplicate button/card/input markup.

## UI/UX Requirements

- **Zero visual regression** — the refactored components must look identical to the current implementation
- All existing interactions (hover, focus, active states) must be preserved
- Responsive behavior must be maintained
- All transitions and animations must feel the same
- The dashboard drag-and-drop must continue working with the new Card/Button components

## Edge Cases

- **Astro components cannot use React hooks** — ensure Astro versions of shared components use native Astro features (props, slots, CSS)
- **React islands in Astro pages** — `AuthForm.tsx`, `NavbarAuth.tsx`, `CustomCursor.tsx`, `DashboardApp.tsx` are hydrated React islands. They can only use React UI components, not Astro ones
- **GSAP animations in Astro** — animation utilities will be loaded via `<script>` tags in Astro components, not via React
- **dnd-kit compatibility** — `SortableTaskCard` and `KanbanBoard` use dnd-kit. Refactored Card component must not break the drag-and-drop wrapper structure

## Performance

- lucide icons are tree-shakable — only imported icons are bundled
- lucide-astro renders static SVG at build time (zero JS)
- Removing design-tokens.ts reduces JS bundle
- Shared components with consistent markup may improve gzip compression
- No new runtime dependencies beyond lucide-react and lucide-astro

## Dependencies

- **New**: `lucide-react`, `lucide-astro`
- **Existing**: All current dependencies remain unchanged
- **Removed**: None (packages stay, only internal code changes)

## Out of Scope

- Adding new features or UI elements
- Changing the visual design or color scheme
- Restructuring page routing or layouts
- Database or API changes
- Adding new tests (existing tests should still pass; update tests only if imports change)
- Performance optimization beyond what DRY refactoring naturally provides (no lazy loading, code splitting, etc.)

## Open Questions

None — all decisions resolved during interview.
