/**
 * GSAP Animation Utilities
 * Centralized helpers to eliminate duplicate ScrollTrigger/GSAP setup across sections.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/** One-time GSAP + ScrollTrigger registration (idempotent). */
export function registerGSAP(): void {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
}

/** Returns true if the user prefers reduced motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export interface ScrollAnimationOptions {
  trigger?: string | Element;
  start?: string;
  duration?: number;
  ease?: string;
  delay?: number;
  stagger?: number;
}

const DEFAULTS: Required<Pick<ScrollAnimationOptions, "start" | "duration" | "ease" | "stagger">> = {
  start: "top 70%",
  duration: 0.8,
  ease: "power3.out",
  stagger: 0.1,
};

/**
 * Standard scroll-triggered fade-in from below.
 * Elements animate from opacity: 0, y: 30 to their natural position.
 */
export function scrollFadeIn(
  target: gsap.TweenTarget,
  options: ScrollAnimationOptions = {},
): gsap.core.Tween | null {
  if (prefersReducedMotion()) return null;
  registerGSAP();

  return gsap.from(target, {
    scrollTrigger: {
      trigger: (options.trigger as Element) || (target as Element),
      start: options.start ?? DEFAULTS.start,
    },
    opacity: 0,
    y: 30,
    duration: options.duration ?? DEFAULTS.duration,
    ease: options.ease ?? DEFAULTS.ease,
    delay: options.delay ?? 0,
  });
}

/**
 * Staggered scroll-triggered entrance for multiple elements.
 * Each element fades in from below with a configurable stagger delay.
 */
export function scrollStagger(
  targets: gsap.TweenTarget,
  options: ScrollAnimationOptions = {},
): gsap.core.Tween | null {
  if (prefersReducedMotion()) return null;
  registerGSAP();

  return gsap.from(targets, {
    scrollTrigger: {
      trigger: (options.trigger as Element) || (targets as Element),
      start: options.start ?? DEFAULTS.start,
    },
    opacity: 0,
    y: 30,
    stagger: options.stagger ?? DEFAULTS.stagger,
    duration: options.duration ?? DEFAULTS.duration,
    ease: options.ease ?? DEFAULTS.ease,
    delay: options.delay ?? 0,
  });
}

/**
 * Scale-based scroll-triggered entrance animation.
 * Elements animate from scale: 0.95, opacity: 0 to their natural state.
 */
export function scrollScale(
  target: gsap.TweenTarget,
  options: ScrollAnimationOptions = {},
): gsap.core.Tween | null {
  if (prefersReducedMotion()) return null;
  registerGSAP();

  return gsap.from(target, {
    scrollTrigger: {
      trigger: (options.trigger as Element) || (target as Element),
      start: options.start ?? DEFAULTS.start,
    },
    opacity: 0,
    scale: 0.95,
    y: 40,
    stagger: options.stagger ?? 0,
    duration: options.duration ?? DEFAULTS.duration,
    ease: options.ease ?? DEFAULTS.ease,
    delay: options.delay ?? 0,
  });
}
