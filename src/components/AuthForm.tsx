import { useState, useEffect, useCallback, type FormEvent } from "react";
import { register, login } from "@/lib/auth/client";

type Tab = "login" | "register";

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  general?: string;
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "#ef4444" };
  if (score <= 2) return { score, label: "Fair", color: "#f97316" };
  if (score <= 3) return { score, label: "Good", color: "#eab308" };
  if (score <= 4) return { score, label: "Strong", color: "#22c55e" };
  return { score, label: "Very Strong", color: "#00D67E" };
}

export default function AuthForm() {
  const [activeTab, setActiveTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  // Form fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Read initial tab from URL hash
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "register" || hash === "login") {
      setActiveTab(hash);
    }
  }, []);

  const switchTab = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setErrors({});
    setPassword("");
    window.location.hash = tab;
  }, []);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const result = await register(username, email, password);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 800);
    } else {
      const code = result.error.code;
      const message = result.error.message;

      if (code === "INVALID_USERNAME") {
        setErrors({ username: message });
      } else if (code === "INVALID_EMAIL") {
        setErrors({ email: message });
      } else if (code === "WEAK_PASSWORD") {
        setErrors({ password: message });
      } else if (code === "USERNAME_TAKEN") {
        setErrors({ username: message });
      } else if (code === "EMAIL_TAKEN") {
        setErrors({ email: message });
      } else {
        setErrors({ general: message });
      }
    }

    setLoading(false);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 800);
    } else {
      setErrors({ general: result.error.message });
    }

    setLoading(false);
  };

  const passwordStrength = getPasswordStrength(password);

  if (success) {
    return (
      <div className="auth-card" style={{ textAlign: "center", padding: "3rem" }}>
        <div style={{ color: "#00D67E", fontSize: "1.25rem", fontWeight: 600 }}>
          Success! Redirecting...
        </div>
      </div>
    );
  }

  return (
    <div className="auth-card">
      {/* Tabs */}
      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab ${activeTab === "login" ? "auth-tab-active" : ""}`}
          onClick={() => switchTab("login")}
        >
          Log in
        </button>
        <button
          type="button"
          className={`auth-tab ${activeTab === "register" ? "auth-tab-active" : ""}`}
          onClick={() => switchTab("register")}
        >
          Register
        </button>
      </div>

      {/* General error */}
      {errors.general && (
        <div className="auth-error-banner">{errors.general}</div>
      )}

      {/* Login form */}
      {activeTab === "login" && (
        <form onSubmit={handleLogin} className="auth-form">
          <div className="auth-field">
            <label htmlFor="login-email" className="auth-label">Email</label>
            <input
              id="login-email"
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password" className="auth-label">Password</label>
            <input
              id="login-password"
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>

          <p className="auth-switch">
            Don't have an account?{" "}
            <button type="button" className="auth-switch-link" onClick={() => switchTab("register")}>
              Register
            </button>
          </p>
        </form>
      )}

      {/* Register form */}
      {activeTab === "register" && (
        <form onSubmit={handleRegister} className="auth-form">
          <div className="auth-field">
            <label htmlFor="register-username" className="auth-label">Username</label>
            <input
              id="register-username"
              type="text"
              className="auth-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="john_doe"
              required
              autoComplete="username"
            />
            {errors.username && <span className="auth-field-error">{errors.username}</span>}
          </div>

          <div className="auth-field">
            <label htmlFor="register-email" className="auth-label">Email</label>
            <input
              id="register-email"
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            {errors.email && <span className="auth-field-error">{errors.email}</span>}
          </div>

          <div className="auth-field">
            <label htmlFor="register-password" className="auth-label">Password</label>
            <input
              id="register-password"
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 12 characters"
              required
              autoComplete="new-password"
            />
            {errors.password && <span className="auth-field-error">{errors.password}</span>}

            {/* Password strength indicator */}
            {password.length > 0 && (
              <div className="auth-strength">
                <div className="auth-strength-bar">
                  <div
                    className="auth-strength-fill"
                    style={{
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    }}
                  />
                </div>
                <span className="auth-strength-label" style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="auth-switch">
            Already have an account?{" "}
            <button type="button" className="auth-switch-link" onClick={() => switchTab("login")}>
              Log in
            </button>
          </p>
        </form>
      )}
    </div>
  );
}
