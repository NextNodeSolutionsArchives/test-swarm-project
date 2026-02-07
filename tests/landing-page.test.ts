import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

function fileExists(path: string) {
  return existsSync(resolve(root, path));
}

function readFile(path: string) {
  // With Node SSR adapter, static pages go to dist/client/
  const primary = resolve(root, path);
  if (existsSync(primary)) return readFileSync(primary, "utf-8");
  const ssr = resolve(root, path.replace("dist/", "dist/client/"));
  return readFileSync(ssr, "utf-8");
}

// ============================================================
// FR-2: Hero Section
// ============================================================
describe("FR-2: Hero Section", () => {
  it("HeroSection.astro exists", () => {
    expect(fileExists("src/components/HeroSection.astro")).toBe(true);
  });

  it("has gradient orb elements via GradientOrbs component", () => {
    const html = readFile("src/components/HeroSection.astro");
    expect(html).toContain("GradientOrbs");
    expect(html).toContain('variant="hero"');
  });

  it("has the headline 'Your workflow, in flow.'", () => {
    const html = readFile("src/components/HeroSection.astro");
    expect(html).toContain("Your workflow, in flow.");
  });

  it("has the subheadline about Pulseo", () => {
    const html = readFile("src/components/HeroSection.astro");
    expect(html).toContain("Pulseo learns your patterns");
  });

  it("has primary CTA linking to /dashboard", () => {
    const html = readFile("src/components/HeroSection.astro");
    expect(html).toContain('href="/dashboard"');
    expect(html).toContain("Go to Dashboard");
  });

  it("has 'No credit card required' text", () => {
    const html = readFile("src/components/HeroSection.astro");
    expect(html).toContain("No credit card required");
  });

  it("has floating UI mockup cards with parallax", () => {
    const html = readFile("src/components/HeroSection.astro");
    expect(html).toContain("data-parallax-container");
    expect(html).toContain("floating-card");
  });

  it("has GSAP entrance animations", () => {
    const html = readFile("src/components/HeroSection.astro");
    expect(html).toContain("gsap");
    expect(html).toContain("data-hero-headline");
    expect(html).toContain("data-hero-cta");
  });

  it("has Pulseo logo", () => {
    const html = readFile("src/components/HeroSection.astro");
    expect(html).toContain("PulseoLogo");
  });

  it("renders in dist/index.html", () => {
    const dist = readFile("dist/index.html");
    expect(dist).toContain("Your workflow, in flow.");
    expect(dist).toContain("gradient-orb");
  });
});

// ============================================================
// FR-3: Problem Section
// ============================================================
describe("FR-3: Problem Section", () => {
  it("ProblemSection.astro exists", () => {
    expect(fileExists("src/components/ProblemSection.astro")).toBe(true);
  });

  it("has the '47 notifications' narrative", () => {
    const html = readFile("src/components/ProblemSection.astro");
    expect(html).toContain("47");
    expect(html).toContain("unread notifications");
  });

  it("has counter animation with data-count-to", () => {
    const html = readFile("src/components/ProblemSection.astro");
    expect(html).toContain('data-count-to="47"');
  });

  it("has chaos notification cards", () => {
    const html = readFile("src/components/ProblemSection.astro");
    expect(html).toContain("data-chaos");
    expect(html).toContain("chaos-card");
  });

  it("has ScrollTrigger integration", () => {
    const html = readFile("src/components/ProblemSection.astro");
    expect(html).toContain("ScrollTrigger");
  });

  it("renders in dist/index.html", () => {
    const dist = readFile("dist/index.html");
    expect(dist).toContain("unread notifications");
  });
});

// ============================================================
// FR-4: Transformation Section
// ============================================================
describe("FR-4: Transformation Section", () => {
  it("TransformationSection.astro exists", () => {
    expect(fileExists("src/components/TransformationSection.astro")).toBe(true);
  });

  it("has 'Then Pulseo steps in.' headline with gradient text", () => {
    const html = readFile("src/components/TransformationSection.astro");
    expect(html).toContain("Then Pulseo steps in.");
    expect(html).toContain("gradient-text");
  });

  it("has ordered-card visual elements", () => {
    const html = readFile("src/components/TransformationSection.astro");
    expect(html).toContain("ordered-card");
  });

  it("has GSAP animations", () => {
    const html = readFile("src/components/TransformationSection.astro");
    expect(html).toContain("gsap");
    expect(html).toContain("animations");
  });

  it("renders in dist/index.html", () => {
    const dist = readFile("dist/index.html");
    expect(dist).toContain("Then Pulseo steps in.");
  });
});

// ============================================================
// FR-5: Feature Storytelling (3 Acts)
// ============================================================
describe("FR-5: Feature Storytelling", () => {
  it("FeatureStorytelling.astro exists", () => {
    expect(fileExists("src/components/FeatureStorytelling.astro")).toBe(true);
  });

  it("has all 3 time badges", () => {
    const html = readFile("src/components/FeatureStorytelling.astro");
    expect(html).toContain("8:00 AM");
    expect(html).toContain("11:00 AM");
    expect(html).toContain("4:00 PM");
  });

  it("has Act 1: Smart Prioritization with task list visual", () => {
    const html = readFile("src/components/FeatureStorytelling.astro");
    expect(html).toContain("Smart Prioritization");
    expect(html).toContain("task-list");
  });

  it("has Act 2: Focus Mode with timer visual", () => {
    const html = readFile("src/components/FeatureStorytelling.astro");
    expect(html).toContain("Focus Mode");
    expect(html).toContain("focus-timer");
  });

  it("has Act 3: Auto-Review with dashboard visual", () => {
    const html = readFile("src/components/FeatureStorytelling.astro");
    expect(html).toContain("Auto-Review");
    expect(html).toContain("dashboard");
  });

  it("uses glassmorphism cards via Card component", () => {
    const html = readFile("src/components/FeatureStorytelling.astro");
    expect(html).toContain("Card");
    expect(html).toContain("from \"./ui/Card.astro\"");
  });

  it("uses monospace font for time badges", () => {
    const html = readFile("src/components/FeatureStorytelling.astro");
    expect(html).toContain("font-mono");
  });

  it("renders all acts in dist/index.html", () => {
    const dist = readFile("dist/index.html");
    expect(dist).toContain("Smart Prioritization");
    expect(dist).toContain("Focus Mode");
    expect(dist).toContain("Auto-Review");
  });
});

// ============================================================
// FR-6: Stats Section
// ============================================================
describe("FR-6: Stats Section", () => {
  it("StatsSection.astro exists", () => {
    expect(fileExists("src/components/StatsSection.astro")).toBe(true);
  });

  it("has all 4 stats", () => {
    const html = readFile("src/components/StatsSection.astro");
    expect(html).toContain("hrs");
    expect(html).toContain("User satisfaction");
    expect(html).toContain("Teams worldwide");
    expect(html).toContain("Average rating");
  });

  it("has counter animation attributes", () => {
    const html = readFile("src/components/StatsSection.astro");
    expect(html).toContain("stat-value");
    expect(html).toContain("data-count-to");
  });

  it("uses monospace font for numbers", () => {
    const html = readFile("src/components/StatsSection.astro");
    expect(html).toContain("font-mono");
  });

  it("uses glassmorphism card via Card component", () => {
    const html = readFile("src/components/StatsSection.astro");
    expect(html).toContain("Card");
    expect(html).toContain("from \"./ui/Card.astro\"");
  });

  it("renders in dist/index.html", () => {
    const dist = readFile("dist/index.html");
    expect(dist).toContain("Teams worldwide");
  });
});

// ============================================================
// FR-7: Testimonials Section
// ============================================================
describe("FR-7: Testimonials Section", () => {
  it("TestimonialsSection.astro exists", () => {
    expect(fileExists("src/components/TestimonialsSection.astro")).toBe(true);
  });

  it("has 3 testimonial cards", () => {
    const html = readFile("src/components/TestimonialsSection.astro");
    expect(html).toContain("Sarah Chen");
    expect(html).toContain("Marcus Rivera");
    expect(html).toContain("Aisha Patel");
  });

  it("has roles and companies", () => {
    const html = readFile("src/components/TestimonialsSection.astro");
    expect(html).toContain("Head of Product");
    expect(html).toContain("Meridian Labs");
    expect(html).toContain("Senior Engineer");
    expect(html).toContain("Helios Cloud");
  });

  it("uses glassmorphism cards via Card component", () => {
    const html = readFile("src/components/TestimonialsSection.astro");
    expect(html).toContain("Card");
    expect(html).toContain("from \"./ui/Card.astro\"");
  });

  it("has gradient avatar placeholders", () => {
    const html = readFile("src/components/TestimonialsSection.astro");
    expect(html).toContain("linear-gradient");
    expect(html).toContain("rounded-full");
  });

  it("has quote marks", () => {
    const html = readFile("src/components/TestimonialsSection.astro");
    expect(html).toContain("&#x201C;");
  });

  it("has scroll-triggered stagger animation", () => {
    const html = readFile("src/components/TestimonialsSection.astro");
    expect(html).toContain("data-testimonial");
    expect(html).toContain("stagger");
  });

  it("renders in dist/index.html", () => {
    const dist = readFile("dist/index.html");
    expect(dist).toContain("Sarah Chen");
  });
});

// ============================================================
// FR-8: Final CTA Section
// ============================================================
describe("FR-8: Final CTA Section", () => {
  it("FinalCTA.astro exists", () => {
    expect(fileExists("src/components/FinalCTA.astro")).toBe(true);
  });

  it("has 'Ready to find your flow?' headline", () => {
    const html = readFile("src/components/FinalCTA.astro");
    expect(html).toContain("Ready to find your flow?");
  });

  it("has CTA button linking to /dashboard", () => {
    const html = readFile("src/components/FinalCTA.astro");
    expect(html).toContain('href="/dashboard"');
    expect(html).toContain("Go to Dashboard");
  });

  it("has pricing text", () => {
    const html = readFile("src/components/FinalCTA.astro");
    expect(html).toContain("Free for individuals");
    expect(html).toContain("$12/mo");
  });

  it("has background orbs via GradientOrbs component", () => {
    const html = readFile("src/components/FinalCTA.astro");
    expect(html).toContain("GradientOrbs");
    expect(html).toContain('variant="cta"');
  });

  it("has parallax animation", () => {
    const html = readFile("src/components/FinalCTA.astro");
    expect(html).toContain("scrub");
  });

  it("renders in dist/index.html", () => {
    const dist = readFile("dist/index.html");
    expect(dist).toContain("Ready to find your flow?");
  });
});

// ============================================================
// FR-9: Footer
// ============================================================
describe("FR-9: Footer", () => {
  it("Footer.astro exists", () => {
    expect(fileExists("src/components/Footer.astro")).toBe(true);
  });

  it("has Pulseo logo", () => {
    const html = readFile("src/components/Footer.astro");
    expect(html).toContain("PulseoLogo");
  });

  it("has nav links: Product, Pricing, Blog, Changelog", () => {
    const html = readFile("src/components/Footer.astro");
    expect(html).toContain("Product");
    expect(html).toContain("Pricing");
    expect(html).toContain("Blog");
    expect(html).toContain("Changelog");
  });

  it("has social icon links with aria-labels", () => {
    const html = readFile("src/components/Footer.astro");
    expect(html).toContain("Twitter");
    expect(html).toContain("GitHub");
    expect(html).toContain("Discord");
  });

  it("has copyright text", () => {
    const html = readFile("src/components/Footer.astro");
    expect(html).toContain("2026 Pulseo. All rights reserved.");
  });

  it("has semantic footer role", () => {
    const html = readFile("src/components/Footer.astro");
    expect(html).toContain('role="contentinfo"');
  });

  it("has footer navigation landmark", () => {
    const html = readFile("src/components/Footer.astro");
    expect(html).toContain('aria-label="Footer navigation"');
  });

  it("renders in dist/index.html", () => {
    const dist = readFile("dist/index.html");
    expect(dist).toContain("2026 Pulseo");
  });
});

// ============================================================
// FR-10: Smooth Scroll (Lenis)
// ============================================================
describe("FR-10: Smooth Scroll (Lenis)", () => {
  it("SmoothScroll.astro exists", () => {
    expect(fileExists("src/components/SmoothScroll.astro")).toBe(true);
  });

  it("imports Lenis", () => {
    const html = readFile("src/components/SmoothScroll.astro");
    expect(html).toContain('import Lenis from "lenis"');
  });

  it("syncs Lenis with GSAP ScrollTrigger", () => {
    const html = readFile("src/components/SmoothScroll.astro");
    expect(html).toContain("ScrollTrigger.update");
    expect(html).toContain("gsap.ticker.add");
  });

  it("has lerp configuration", () => {
    const html = readFile("src/components/SmoothScroll.astro");
    expect(html).toContain("lerp");
  });

  it("respects prefers-reduced-motion", () => {
    const html = readFile("src/components/SmoothScroll.astro");
    expect(html).toContain("prefers-reduced-motion");
  });

  it("is included in BaseLayout", () => {
    const layout = readFile("src/layouts/BaseLayout.astro");
    expect(layout).toContain("SmoothScroll");
  });
});

// ============================================================
// FR-11: Custom Cursor
// ============================================================
describe("FR-11: Custom Cursor", () => {
  it("CustomCursor.tsx exists", () => {
    expect(fileExists("src/components/CustomCursor.tsx")).toBe(true);
  });

  it("is a React component", () => {
    const code = readFile("src/components/CustomCursor.tsx");
    expect(code).toContain('from "react"');
    expect(code).toContain("export default function CustomCursor");
  });

  it("detects touch devices and hides cursor", () => {
    const code = readFile("src/components/CustomCursor.tsx");
    expect(code).toContain("ontouchstart");
  });

  it("tracks mouse position with lerp", () => {
    const code = readFile("src/components/CustomCursor.tsx");
    expect(code).toContain("lerp");
    expect(code).toContain("mousemove");
  });

  it("scales on hover over interactive elements", () => {
    const code = readFile("src/components/CustomCursor.tsx");
    expect(code).toContain("isHovering");
    expect(code).toContain('a, button, [role=\'button\']');
  });

  it("has aria-hidden for accessibility", () => {
    const code = readFile("src/components/CustomCursor.tsx");
    expect(code).toContain('aria-hidden="true"');
  });

  it("is included in BaseLayout as client:only island", () => {
    const layout = readFile("src/layouts/BaseLayout.astro");
    expect(layout).toContain("CustomCursor");
    expect(layout).toContain('client:only="react"');
  });
});

// ============================================================
// FR-12: Responsive Design
// ============================================================
describe("FR-12: Responsive Design", () => {
  it("uses fluid typography with clamp()", () => {
    const css = readFile("src/styles/global.css");
    expect(css).toContain("clamp(");
  });

  it("has mobile-specific breakpoints in global CSS", () => {
    const css = readFile("src/styles/global.css");
    expect(css).toContain("--spacing-section-mobile");
  });

  it("Navbar has mobile hamburger menu", () => {
    const html = readFile("src/components/Navbar.astro");
    expect(html).toContain("mobile-menu-toggle");
    expect(html).toContain("hamburger-line");
    expect(html).toContain("md:hidden");
  });

  it("Hero hides floating cards on mobile", () => {
    const html = readFile("src/components/HeroSection.astro");
    expect(html).toContain("max-width: 768px");
    expect(html).toContain("display: none");
  });
});

// ============================================================
// FR-13: Navigation Bar
// ============================================================
describe("FR-13: Navigation Bar", () => {
  it("Navbar.astro exists", () => {
    expect(fileExists("src/components/Navbar.astro")).toBe(true);
  });

  it("is fixed at top with z-index", () => {
    const html = readFile("src/components/Navbar.astro");
    expect(html).toContain("fixed");
    expect(html).toContain("z-50");
  });

  it("has Pulseo logo", () => {
    const html = readFile("src/components/Navbar.astro");
    expect(html).toContain("PulseoLogo");
  });

  it("has nav links: Features, Testimonials, Pricing", () => {
    const html = readFile("src/components/Navbar.astro");
    expect(html).toContain("Features");
    expect(html).toContain("Testimonials");
    expect(html).toContain("Pricing");
  });

  it("has auth-aware CTA (now via React NavbarAuth component)", () => {
    const html = readFile("src/components/Navbar.astro");
    expect(html).toContain("NavbarAuth");
    // Dashboard link is now in the React component NavbarAuth.tsx
    const authComponent = readFile("src/components/NavbarAuth.tsx");
    expect(authComponent).toContain("/dashboard");
    expect(authComponent).toContain("Dashboard");
  });

  it("has scroll-triggered glassmorphism background", () => {
    const html = readFile("src/components/Navbar.astro");
    expect(html).toContain("scrolled");
    expect(html).toContain("backdrop-filter");
    expect(html).toContain("ScrollTrigger");
  });

  it("has accessible aria attributes", () => {
    const html = readFile("src/components/Navbar.astro");
    expect(html).toContain('aria-label="Main navigation"');
    expect(html).toContain("aria-expanded");
    expect(html).toContain("aria-controls");
  });

  it("is included in index.astro", () => {
    const page = readFile("src/pages/index.astro");
    expect(page).toContain("Navbar");
  });
});

// ============================================================
// Accessibility
// ============================================================
describe("Accessibility", () => {
  it("global.css respects prefers-reduced-motion", () => {
    const css = readFile("src/styles/global.css");
    expect(css).toContain("prefers-reduced-motion");
  });

  it("all GSAP scripts check for reduced motion", () => {
    const components = [
      "HeroSection.astro",
      "ProblemSection.astro",
      "TransformationSection.astro",
      "FeatureStorytelling.astro",
      "StatsSection.astro",
      "TestimonialsSection.astro",
      "FinalCTA.astro",
      "SmoothScroll.astro",
    ];
    for (const comp of components) {
      const html = readFile(`src/components/${comp}`);
      // Components use either inline media query or prefersReducedMotion from animation utils
      const hasMotionCheck =
        html.includes("prefers-reduced-motion") || html.includes("prefersReducedMotion");
      expect(hasMotionCheck).toBe(true);
    }
  });

  it("footer has semantic landmarks", () => {
    const html = readFile("src/components/Footer.astro");
    expect(html).toContain("contentinfo");
  });

  it("navigation has aria-label", () => {
    const html = readFile("src/components/Navbar.astro");
    expect(html).toContain('aria-label="Main navigation"');
  });
});

// ============================================================
// Page Assembly
// ============================================================
describe("Page Assembly", () => {
  it("index.astro imports all sections in correct order", () => {
    const page = readFile("src/pages/index.astro");
    const heroPos = page.indexOf("HeroSection");
    const problemPos = page.indexOf("ProblemSection");
    const transformPos = page.indexOf("TransformationSection");
    const featurePos = page.indexOf("FeatureStorytelling");
    const statsPos = page.indexOf("StatsSection");
    const testimonialsPos = page.indexOf("TestimonialsSection");
    const ctaPos = page.indexOf("FinalCTA");
    const footerPos = page.indexOf("Footer");

    expect(heroPos).toBeLessThan(problemPos);
    expect(problemPos).toBeLessThan(transformPos);
    expect(transformPos).toBeLessThan(featurePos);
    expect(featurePos).toBeLessThan(statsPos);
    expect(statsPos).toBeLessThan(testimonialsPos);
    expect(testimonialsPos).toBeLessThan(ctaPos);
    expect(ctaPos).toBeLessThan(footerPos);
  });

  it("dist/index.html contains all major sections", () => {
    const dist = readFile("dist/index.html");
    expect(dist).toContain("hero");
    expect(dist).toContain("problem");
    expect(dist).toContain("transformation");
    expect(dist).toContain("features");
    expect(dist).toContain("stats");
    expect(dist).toContain("testimonials");
    expect(dist).toContain("cta");
  });
});

// ============================================================
// Build Output
// ============================================================
describe("Build Output", () => {
  it("dist/index.html exists", () => {
    expect(fileExists("dist/index.html") || fileExists("dist/client/index.html")).toBe(true);
  });

  it("dist/index.html has proper HTML structure", () => {
    const dist = readFile("dist/index.html");
    expect(dist).toContain("<!DOCTYPE html>");
    expect(dist).toContain('lang="en"');
    expect(dist).toContain("<title>Pulseo");
    expect(dist).toContain('name="description"');
  });
});
