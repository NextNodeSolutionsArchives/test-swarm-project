import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Hide on touch devices
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.closest("a, button, [role='button'], [data-cursor-hover]") !==
        null;
      setIsHovering(isInteractive);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseleave", handleMouseLeave);

    let rafId: number;

    const animate = () => {
      if (prefersReducedMotion) {
        posRef.current = { ...targetRef.current };
      } else {
        const lerp = 0.15;
        posRef.current.x +=
          (targetRef.current.x - posRef.current.x) * lerp;
        posRef.current.y +=
          (targetRef.current.y - posRef.current.y) * lerp;
      }

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px) translate(-50%, -50%)`;
      }
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, [isVisible]);

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: isHovering ? "48px" : "20px",
        height: isHovering ? "48px" : "20px",
        borderRadius: "50%",
        border: isHovering ? "none" : "2px solid rgba(0, 214, 126, 0.6)",
        background: isHovering ? "rgba(0, 214, 126, 0.15)" : "transparent",
        pointerEvents: "none",
        zIndex: 10000,
        opacity: isVisible ? 1 : 0,
        transition:
          "width 0.3s ease, height 0.3s ease, background 0.3s ease, border 0.3s ease, opacity 0.3s ease",
        mixBlendMode: "difference",
      }}
    />
  );
}
