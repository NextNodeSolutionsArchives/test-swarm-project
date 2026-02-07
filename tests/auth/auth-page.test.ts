import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";

describe("FR-9: Auth Page", () => {
  describe("Auth page file structure", () => {
    it("auth.astro page exists", () => {
      expect(existsSync("src/pages/auth.astro")).toBe(true);
    });

    it("AuthForm.tsx component exists", () => {
      expect(existsSync("src/components/AuthForm.tsx")).toBe(true);
    });
  });

  describe("Auth page (auth.astro)", () => {
    const page = readFileSync("src/pages/auth.astro", "utf-8");

    it("uses BaseLayout", () => {
      expect(page).toContain("BaseLayout");
    });

    it("has auth page title", () => {
      expect(page).toContain("Sign in");
    });

    it("renders AuthForm as React island", () => {
      expect(page).toContain("AuthForm");
      expect(page).toContain('client:only="react"');
    });

    it("has background gradient orbs", () => {
      expect(page).toContain("auth-bg-orb");
      expect(page).toContain("auth-bg-orb-green");
      expect(page).toContain("auth-bg-orb-orange");
    });

    it("has glassmorphism card styles", () => {
      expect(page).toContain("backdrop-filter");
      expect(page).toContain("blur");
    });

    it("has link back to home", () => {
      expect(page).toContain('href="/"');
    });

    it("has Pulseo logo text", () => {
      expect(page).toContain("Pulseo");
    });
  });

  describe("AuthForm component", () => {
    const component = readFileSync("src/components/AuthForm.tsx", "utf-8");

    it("has login and register tabs", () => {
      expect(component).toContain("login");
      expect(component).toContain("register");
      expect(component).toContain("auth-tab");
    });

    it("has login form with email and password fields", () => {
      expect(component).toContain("login-email");
      expect(component).toContain("login-password");
      expect(component).toContain("Log in");
    });

    it("has register form with username, email, and password fields", () => {
      expect(component).toContain("register-username");
      expect(component).toContain("register-email");
      expect(component).toContain("register-password");
      expect(component).toContain("Create account");
    });

    it("has password strength indicator", () => {
      expect(component).toContain("auth-strength");
      expect(component).toContain("getPasswordStrength");
      expect(component).toContain("Weak");
      expect(component).toContain("Strong");
    });

    it("has error display for each field", () => {
      expect(component).toContain("auth-field-error");
      expect(component).toContain("errors.username");
      expect(component).toContain("errors.email");
      expect(component).toContain("errors.password");
    });

    it("has general error banner", () => {
      expect(component).toContain("auth-error-banner");
      expect(component).toContain("errors.general");
    });

    it("has loading state on submit button", () => {
      expect(component).toContain("loading");
      expect(component).toContain("disabled={loading}");
      expect(component).toContain("Logging in...");
      expect(component).toContain("Creating account...");
    });

    it("redirects to /dashboard on success", () => {
      expect(component).toContain('window.location.href = "/dashboard"');
    });

    it("reads initial tab from URL hash", () => {
      expect(component).toContain("window.location.hash");
    });

    it("switches tab via URL hash", () => {
      expect(component).toContain("window.location.hash = tab");
    });

    it("has tab switch links between login and register", () => {
      expect(component).toContain("Don't have an account?");
      expect(component).toContain("Already have an account?");
    });

    it("maps API error codes to field-specific errors", () => {
      expect(component).toContain("INVALID_USERNAME");
      expect(component).toContain("INVALID_EMAIL");
      expect(component).toContain("WEAK_PASSWORD");
      expect(component).toContain("USERNAME_TAKEN");
      expect(component).toContain("EMAIL_TAKEN");
    });

    it("uses the client-side auth helpers", () => {
      expect(component).toContain("from \"@/lib/auth/client\"");
      expect(component).toContain("register(");
      expect(component).toContain("login(");
    });

    it("has success flash before redirect", () => {
      expect(component).toContain("Success! Redirecting");
      expect(component).toContain("#00D67E");
    });
  });

  describe("Auth page styles", () => {
    const page = readFileSync("src/pages/auth.astro", "utf-8");

    it("has full viewport height", () => {
      expect(page).toContain("min-height: 100vh");
    });

    it("has centered content", () => {
      expect(page).toContain("align-items: center");
      expect(page).toContain("justify-content: center");
    });

    it("has max-width constraint on card container", () => {
      expect(page).toContain("max-width: 480px");
    });

    it("has dark base background on card", () => {
      expect(page).toContain("rgba(255, 255, 255, 0.05)");
    });

    it("has green accent on active tab", () => {
      expect(page).toContain("--color-green-primary");
    });

    it("has focus glow on inputs", () => {
      expect(page).toContain("box-shadow: 0 0 0 3px rgba(0, 214, 126");
    });

    it("has responsive padding for mobile", () => {
      expect(page).toContain("padding: 2rem 1rem");
    });
  });
});
