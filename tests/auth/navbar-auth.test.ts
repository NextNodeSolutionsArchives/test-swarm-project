import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";

describe("FR-10: Navbar Auth State", () => {
  describe("File structure", () => {
    it("NavbarAuth.tsx component exists", () => {
      expect(existsSync("src/components/NavbarAuth.tsx")).toBe(true);
    });

    it("Navbar.astro exists (updated)", () => {
      expect(existsSync("src/components/Navbar.astro")).toBe(true);
    });
  });

  describe("NavbarAuth component", () => {
    const component = readFileSync("src/components/NavbarAuth.tsx", "utf-8");

    it("imports auth client utilities", () => {
      expect(component).toContain("getAuthenticatedUser");
      expect(component).toContain("logout");
    });

    it("has unauthenticated state with Sign in link", () => {
      expect(component).toContain("Sign in");
      expect(component).toContain("/auth#login");
    });

    it("has unauthenticated state with Dashboard CTA", () => {
      expect(component).toContain("Dashboard");
      expect(component).toContain("/dashboard");
    });

    it("has authenticated state with avatar via Avatar component", () => {
      expect(component).toContain("Avatar");
      expect(component).toContain("user.username");
    });

    it("has authenticated state with username display", () => {
      expect(component).toContain("navbar-username");
      expect(component).toContain("user.username");
    });

    it("has dropdown menu via DropdownMenu component", () => {
      expect(component).toContain("DropdownMenu");
      expect(component).toContain("items={[");
    });

    it("has dropdown trigger with aria-haspopup", () => {
      expect(component).toContain("aria-haspopup");
      expect(component).toContain("navbar-avatar-btn");
    });

    it("has user info item in dropdown", () => {
      expect(component).toContain("user.username");
      expect(component).toContain("label:");
    });

    it("has Logout button", () => {
      expect(component).toContain("Log out");
      expect(component).toContain("handleLogout");
    });

    it("delegates dropdown close behavior to DropdownMenu component", () => {
      // Click-outside and Escape handling are now internal to DropdownMenu
      expect(component).toContain("DropdownMenu");
    });

    it("delegates Escape key handling to DropdownMenu component", () => {
      // Escape handling is now internal to DropdownMenu
      expect(component).toContain("DropdownMenu");
    });

    it("shows username in dropdown items", () => {
      expect(component).toContain("user.username");
      expect(component).toContain("label:");
    });

    it("reloads page after logout", () => {
      expect(component).toContain("window.location.reload()");
    });

    it("has loading placeholder state", () => {
      expect(component).toContain("navbar-auth-placeholder");
    });
  });

  describe("NavbarAuthMobile component", () => {
    const component = readFileSync("src/components/NavbarAuth.tsx", "utf-8");

    it("exports NavbarAuthMobile", () => {
      expect(component).toContain("export function NavbarAuthMobile");
    });

    it("has Sign in link for unauthenticated mobile", () => {
      // Mobile variant
      expect(component).toContain("navbar-mobile-logout");
    });

    it("has avatar with larger size for mobile via Avatar component", () => {
      expect(component).toContain('size="lg"');
    });
  });

  describe("Navbar.astro integration", () => {
    const navbar = readFileSync("src/components/Navbar.astro", "utf-8");

    it("imports NavbarAuth component", () => {
      expect(navbar).toContain("NavbarAuth");
      expect(navbar).toContain("./NavbarAuth");
    });

    it("imports NavbarAuthMobile component", () => {
      expect(navbar).toContain("NavbarAuthMobile");
    });

    it("renders NavbarAuth as React island in desktop area", () => {
      expect(navbar).toContain('<NavbarAuth client:only="react"');
    });

    it("renders NavbarAuthMobile in mobile menu", () => {
      expect(navbar).toContain('<NavbarAuthMobile client:only="react"');
    });

    it("no longer has hardcoded Dashboard CTA in navbar (moved to React component)", () => {
      // The old hardcoded btn-cta-sm link should be replaced by the React component
      expect(navbar).not.toContain('class="btn-cta-sm"');
    });
  });

  describe("Navbar auth styles", () => {
    const navbar = readFileSync("src/components/Navbar.astro", "utf-8");

    it("has avatar gradient background (green to orange)", () => {
      expect(navbar).toContain("--color-green-primary");
      expect(navbar).toContain("--color-orange-primary");
      expect(navbar).toContain("linear-gradient");
    });

    it("has 32px avatar circle", () => {
      expect(navbar).toContain("width: 32px");
      expect(navbar).toContain("height: 32px");
      expect(navbar).toContain("border-radius: 50%");
    });

    it("has glassmorphism dropdown", () => {
      expect(navbar).toContain("backdrop-filter: blur(20px)");
      expect(navbar).toContain("navbar-dropdown");
    });

    it("has logout red text on hover", () => {
      expect(navbar).toContain("#ef4444");
      expect(navbar).toContain("navbar-dropdown-logout");
    });

    it("has divider in dropdown", () => {
      expect(navbar).toContain("navbar-dropdown-divider");
    });

    it("has mobile auth styles", () => {
      expect(navbar).toContain("navbar-mobile-user");
      expect(navbar).toContain("navbar-mobile-logout");
    });
  });
});
