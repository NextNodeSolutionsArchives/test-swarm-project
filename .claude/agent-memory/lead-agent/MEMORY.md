# Lead Agent Memory — test-swarm-project

## Project: Pulseo Landing Page
- Astro SSG + React islands + Tailwind CSS v4 + GSAP + Lenis
- Package manager: pnpm
- Branch: feat/astro-landing-page
- Path aliases: @/* -> src/*

## Key Patterns
- Tailwind v4 uses @theme directive in CSS instead of tailwind.config.js
- Tailwind v4 integrates via @tailwindcss/vite plugin, not @astrojs/tailwind
- GSAP ScrollTrigger must be registered with gsap.registerPlugin()
- Lenis + GSAP sync: lenis.on("scroll", ScrollTrigger.update) + gsap.ticker.add
- React islands in Astro use client:only="react" for browser-only components
- TMPDIR must be set to /tmp/claude for git commit heredocs in sandbox

## Test Strategy
- Vitest with node environment (no DOM)
- Tests verify file existence, content patterns, and build output
- dist/index.html checked for rendered content after build

## Completed
- All 13 FRs delivered in 2 iterations (scaffolding + full implementation)
- 119 tests passing
