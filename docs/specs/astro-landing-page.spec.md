# Astro Landing Page — Spec

## Overview

An Awwwards-quality landing page for **Pulseo** — a fictional AI-powered productivity platform that learns your habits and automates your workflow. Built with Astro (SSG) + React islands, GSAP/ScrollTrigger animations, Lenis smooth scroll, glassmorphism design system, and a bold green/orange color palette.

The page follows a "day-in-the-life" storytelling narrative, walking visitors through how Pulseo transforms a chaotic workday into a flow state.

## Context

This is a greenfield project — no existing codebase. The goal is to produce a visually stunning, performant, static landing page that could compete on Awwwards. The product (Pulseo) is fictional; the focus is on design excellence, animation craft, and front-end quality.

## Brand Identity

### Name & Tagline
- **Name**: Pulseo
- **Tagline**: "Your workflow, in flow."
- **Personality**: Smart, calm, energetic. Think: the confidence of Linear meets the warmth of Notion.

### Logo
- Stylized "P" mark — a rounded pulse/wave shape
- Rendered as inline SVG for crisp display and animation

### Color Palette
- **Primary Green**: `#00D67E` (vibrant mint/emerald)
- **Primary Orange**: `#FF6B35` (warm, energetic orange)
- **Dark Base**: `#0A0A0F` (near-black with slight blue tint)
- **Surface**: `rgba(255, 255, 255, 0.05)` (glassmorphism cards)
- **Surface Hover**: `rgba(255, 255, 255, 0.10)`
- **Border**: `rgba(255, 255, 255, 0.12)`
- **Text Primary**: `#F5F5F7`
- **Text Secondary**: `#8A8A9A`
- **Gradient Orbs**: multi-color blurs using green, orange, teal, and purple for background depth

### Typography
- **Headings**: Inter (or similar geometric sans) — bold/black weight
- **Body**: Inter — regular/medium weight
- **Monospace accents**: JetBrains Mono — for stats, code-like elements

## Functional Requirements

### FR-1: Astro Project Setup
- Initialize Astro project at repository root (not in a subdirectory)
- Configure with: TypeScript (strict), React integration, Tailwind CSS v4
- Package manager: pnpm
- Add dependencies: `gsap` (with ScrollTrigger, SplitText via CDN or self-hosted), `@studio-freight/lenis` (smooth scroll)
- Configure `astro.config.mjs` with React integration and proper build settings

### FR-2: Hero Section
- **Layout**: Full-viewport height, centered content
- **Background**: Animated gradient orbs (green, orange, purple) — large blurred circles that slowly drift using GSAP
- **Content**:
  - Animated Pulseo logo (SVG, draws in on load)
  - Headline: "Your workflow, in flow." — split-text reveal animation (chars animate in with stagger)
  - Subheadline: "Pulseo learns your patterns, automates the busywork, and keeps you in your zone." — fade-up with delay
  - Primary CTA button: "Go to Dashboard →" linking to `/dashboard` — glassmorphism style with hover glow effect
  - Secondary text: "No credit card required" — subtle fade-in
- **Premium effects**:
  - Custom animated cursor (circle that scales on hover over interactive elements)
  - Floating 3D-like UI mockup cards (subtle parallax on mouse move)
  - Grain/noise texture overlay for depth

### FR-3: "The Problem" Section (Scroll-triggered)
- **Narrative beat**: "Your morning starts with 47 unread notifications..."
- **Layout**: Dark section with text on left, animated illustration on right
- **Content**:
  - Bold stat: "47" animates counting up on scroll-enter
  - Description of the chaotic, fragmented workday
  - Visual: scattered notification cards / app icons in disarray (CSS + GSAP animation)
- **Animation**: Elements scatter/float chaotically, representing information overload

### FR-4: "The Transformation" Section
- **Narrative beat**: "Then Pulseo steps in."
- **Layout**: Transition section — visual shift from chaos to order
- **Content**:
  - A single powerful sentence with gradient text animation
  - The chaotic elements from FR-3 smoothly reorganize into an ordered layout
- **Animation**: GSAP timeline that morphs chaos → order as user scrolls through

### FR-5: "A Day with Pulseo" — Feature Storytelling (3 Acts)
Each act is a scroll-triggered scene with a glassmorphism feature card and a mockup visual.

#### Act 1: "8:00 AM — Smart Prioritization"
- Pulseo auto-sorts your tasks by urgency and energy level
- Visual: animated task list that re-orders itself
- Glassmorphism card with feature description

#### Act 2: "11:00 AM — Focus Mode"
- Pulseo blocks distractions and batches notifications
- Visual: notification badges fading out, a calm focus timer appearing
- Glassmorphism card with feature description

#### Act 3: "4:00 PM — Auto-Review"
- Pulseo summarizes your day and prepares tomorrow
- Visual: dashboard showing completed tasks, streak counter, AI summary
- Glassmorphism card with feature description

Each act:
- Enters via scroll-triggered animation (slide + fade)
- Has a time badge ("8:00 AM") with monospace font
- Has a mockup visual (CSS illustration, not images)
- Card uses `backdrop-filter: blur(20px)` with border glow

### FR-6: Social Proof / Stats Section
- **Layout**: Horizontal strip with 3-4 animated counters
- **Stats** (fictional):
  - "2.4 hours saved per day"
  - "93% user satisfaction"
  - "50K+ teams"
  - "4.9/5 rating"
- **Animation**: Number counter animation triggered on scroll-enter (GSAP)
- **Style**: Monospace numbers, subtle glassmorphism card background

### FR-7: Testimonials Section
- **Layout**: 3 testimonial cards in a horizontal row (staggered on mobile)
- **Content**: Fictional testimonials from fictional users with fictional roles and fictional companies
- **Style**: Glassmorphism cards with avatar circles (gradient placeholders), quote marks
- **Animation**: Cards stagger-in from bottom on scroll

### FR-8: Final CTA Section
- **Layout**: Large centered section with gradient background orbs (callback to hero)
- **Content**:
  - Headline: "Ready to find your flow?"
  - CTA button: "Go to Dashboard →" (same as hero)
  - Below: small text "Free for individuals. Team plans from $12/mo."
- **Animation**: Parallax background, text reveal on scroll

### FR-9: Footer
- **Layout**: Simple, minimal footer
- **Content**:
  - Pulseo logo (small)
  - Navigation links: Product, Pricing, Blog, Changelog
  - Social icons (placeholder SVGs): Twitter/X, GitHub, Discord
  - Copyright: "2026 Pulseo. All rights reserved."
- **Style**: Subtle top border, muted text colors

### FR-10: Smooth Scroll (Lenis)
- Implement Lenis smooth scrolling across the entire page
- Configure with appropriate lerp value for buttery smooth feel
- Integrate with GSAP ScrollTrigger (Lenis + ScrollTrigger sync)

### FR-11: Custom Cursor
- React island component
- Default state: small circle outline following mouse position
- Hover state: scales up and fills when hovering over interactive elements (buttons, links, cards)
- Hidden on mobile/touch devices
- Smooth GSAP-powered movement (slight lerp/delay for organic feel)

### FR-12: Responsive Design
- **Desktop**: Full layout as described (1440px+ optimal)
- **Tablet** (768px-1024px): Stack feature acts vertically, reduce parallax intensity
- **Mobile** (< 768px): Single column, simplified animations (no cursor, reduced parallax), hamburger nav if needed
- All glassmorphism effects maintained across breakpoints
- Font sizes scale fluidly using clamp()

### FR-13: Navigation Bar
- **Fixed/sticky** at top with glassmorphism background (transparent → frosted on scroll)
- **Content**: Pulseo logo (left), nav links (center): Features, Testimonials, Pricing — CTA button (right): "Dashboard →"
- **Scroll behavior**: background becomes more opaque as user scrolls (GSAP ScrollTrigger)
- **Mobile**: Hamburger menu with animated overlay

## Data Model

N/A — this is a static landing page with no data persistence.

## API Contract

N/A — fully static site, no API endpoints.

## UI/UX Requirements

### Glassmorphism Design System
- All cards: `background: rgba(255, 255, 255, 0.05)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(255, 255, 255, 0.12)`, `border-radius: 16px`
- Hover state: background lightens to `0.10`, subtle border glow (green or orange)
- Buttons: glassmorphism base with gradient border on hover
- Consistent 16px border-radius across all rounded elements

### Animation Principles
- Entrance animations: fade-up + slight scale (0.95 → 1.0) with stagger
- Scroll-triggered: use ScrollTrigger `scrub` for scroll-linked animations, `toggleActions` for one-shot entrances
- Easing: `power3.out` for entrances, `power2.inOut` for scrub animations
- No animation on `prefers-reduced-motion: reduce` — respect accessibility

### Spacing & Layout
- Max content width: 1200px, centered
- Section padding: 120px vertical (desktop), 80px (mobile)
- Consistent 24px/32px gap system

### Accessibility
- All interactive elements focusable and keyboard-navigable
- Sufficient color contrast (text on glass cards must pass WCAG AA)
- `prefers-reduced-motion` media query disables all GSAP animations
- Semantic HTML: proper heading hierarchy, landmark regions, alt text

## Edge Cases

- **No JavaScript**: The page should render meaningful content even without JS (Astro SSG ensures this). Animations are progressive enhancement.
- **Slow connection**: Fonts loaded via `font-display: swap` to prevent FOIT. No heavy images — all visuals are CSS/SVG.
- **Very large screens (4K+)**: Max-width container prevents layout from stretching. Background orbs scale proportionally.
- **Touch devices**: Custom cursor hidden. Hover effects replaced with active/tap states.

## Security

- No user input processed (static site)
- No external API calls
- All third-party scripts loaded from trusted CDNs or self-hosted
- CSP headers recommended for production deployment

## Performance

- **Target**: Lighthouse 95+ on all metrics
- **Strategy**: Astro SSG = zero JS by default; React islands hydrate only interactive components (cursor, mobile nav)
- **Fonts**: Self-hosted, subset, preloaded
- **GSAP**: Loaded as a module, tree-shaken where possible
- **Images**: None required (all visuals are CSS/SVG)
- **CSS**: Tailwind purges unused styles at build time

## Dependencies

| Package | Purpose |
|---------|---------|
| `astro` | Static site framework |
| `@astrojs/react` | React integration for islands |
| `@astrojs/tailwind` | Tailwind CSS integration |
| `react` + `react-dom` | Interactive islands |
| `tailwindcss` | Utility-first CSS |
| `gsap` | Animation engine (ScrollTrigger plugin) |
| `lenis` | Smooth scrolling |
| `typescript` | Type safety |

## Out of Scope

- Backend / API development
- User authentication
- The `/dashboard` page itself (CTA links to it but it does not exist)
- CMS or content management
- Blog, pricing page, or any page beyond the landing page
- SEO optimization beyond basic meta tags
- Analytics integration
- Cookie consent / GDPR
- Internationalization

## Open Questions

None — all decisions resolved during interview.
