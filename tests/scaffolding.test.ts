import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

function readJson(path: string) {
  return JSON.parse(readFileSync(resolve(root, path), "utf-8"));
}

function fileExists(path: string) {
  return existsSync(resolve(root, path));
}

function readFile(path: string) {
  return readFileSync(resolve(root, path), "utf-8");
}

describe("FR-1: Astro Project Scaffolding", () => {
  describe("package.json", () => {
    const pkg = readJson("package.json");

    it("has correct project name", () => {
      expect(pkg.name).toBe("pulseo-landing");
    });

    it("has astro as dependency", () => {
      expect(pkg.dependencies.astro).toBeDefined();
    });

    it("has @astrojs/react integration", () => {
      expect(pkg.dependencies["@astrojs/react"]).toBeDefined();
    });

    it("has tailwindcss v4 with vite plugin", () => {
      expect(pkg.dependencies.tailwindcss).toBeDefined();
      expect(pkg.dependencies["@tailwindcss/vite"]).toBeDefined();
    });

    it("has gsap for animations", () => {
      expect(pkg.dependencies.gsap).toBeDefined();
    });

    it("has lenis for smooth scroll", () => {
      expect(pkg.dependencies.lenis).toBeDefined();
    });

    it("has react and react-dom", () => {
      expect(pkg.dependencies.react).toBeDefined();
      expect(pkg.dependencies["react-dom"]).toBeDefined();
    });

    it("has typescript in devDependencies", () => {
      expect(pkg.devDependencies.typescript).toBeDefined();
    });

    it("has build and dev scripts", () => {
      expect(pkg.scripts.dev).toContain("astro dev");
      expect(pkg.scripts.build).toContain("astro build");
    });
  });

  describe("astro.config.mjs", () => {
    const config = readFile("astro.config.mjs");

    it("imports react integration", () => {
      expect(config).toContain('@astrojs/react');
    });

    it("imports tailwindcss vite plugin", () => {
      expect(config).toContain('@tailwindcss/vite');
    });

    it("configures react in integrations", () => {
      expect(config).toContain("react()");
    });

    it("configures tailwindcss in vite plugins", () => {
      expect(config).toContain("tailwindcss()");
    });
  });

  describe("tsconfig.json", () => {
    const tsconfig = readJson("tsconfig.json");

    it("extends astro strict config", () => {
      expect(tsconfig.extends).toContain("astro/tsconfigs/strict");
    });

    it("has path aliases configured", () => {
      expect(tsconfig.compilerOptions.paths["@/*"]).toContain("src/*");
    });
  });

  describe("project structure", () => {
    it("has src/layouts directory", () => {
      expect(fileExists("src/layouts")).toBe(true);
    });

    it("has src/components directory", () => {
      expect(fileExists("src/components")).toBe(true);
    });

    it("has src/pages directory", () => {
      expect(fileExists("src/pages")).toBe(true);
    });

    it("has src/styles directory", () => {
      expect(fileExists("src/styles")).toBe(true);
    });

    it("has src/utils directory", () => {
      expect(fileExists("src/utils")).toBe(true);
    });

    it("has BaseLayout.astro", () => {
      expect(fileExists("src/layouts/BaseLayout.astro")).toBe(true);
    });

    it("has index.astro page", () => {
      expect(fileExists("src/pages/index.astro")).toBe(true);
    });

    it("has global.css with design tokens", () => {
      const css = readFile("src/styles/global.css");
      expect(css).toContain("--color-green-primary: #00D67E");
      expect(css).toContain("--color-orange-primary: #FF6B35");
      expect(css).toContain("--color-dark-base: #0A0A0F");
    });
  });

  describe("design tokens", () => {
    it("has design-tokens.ts utility", () => {
      expect(fileExists("src/utils/design-tokens.ts")).toBe(true);
    });

    it("exports correct color values", async () => {
      const tokens = await import("../src/utils/design-tokens.ts");
      expect(tokens.COLORS.greenPrimary).toBe("#00D67E");
      expect(tokens.COLORS.orangePrimary).toBe("#FF6B35");
      expect(tokens.COLORS.darkBase).toBe("#0A0A0F");
    });
  });

  describe("accessibility", () => {
    it("global.css respects prefers-reduced-motion", () => {
      const css = readFile("src/styles/global.css");
      expect(css).toContain("prefers-reduced-motion");
    });
  });

  describe("build", () => {
    it("dist directory exists after build", () => {
      expect(fileExists("dist")).toBe(true);
    });

    it("generated index.html", () => {
      // With Node SSR adapter, static pages go to dist/client/
      expect(fileExists("dist/client/index.html") || fileExists("dist/index.html")).toBe(true);
    });
  });
});
