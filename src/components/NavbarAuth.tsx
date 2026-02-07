import { useState, useEffect, useRef, useCallback } from "react";
import { getAuthenticatedUser, logout, type PublicUser } from "@/lib/auth/client";

export default function NavbarAuth() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAuthenticatedUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setUser(null);
    setDropdownOpen(false);
    window.location.reload();
  }, []);

  const getInitials = (username: string): string => {
    return username.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return <div className="navbar-auth-placeholder" />;
  }

  // Unauthenticated state
  if (!user) {
    return (
      <div className="navbar-auth-unauthed">
        <a href="/auth#login" className="navbar-signin-link">
          Sign in
        </a>
        <a href="/dashboard" className="navbar-cta-btn">
          Dashboard
          <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    );
  }

  // Authenticated state
  return (
    <div className="navbar-auth-authed" ref={dropdownRef}>
      <button
        type="button"
        className="navbar-avatar-btn"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
      >
        <span className="navbar-avatar">{getInitials(user.username)}</span>
        <span className="navbar-username">{user.username}</span>
      </button>

      {dropdownOpen && (
        <div className="navbar-dropdown" role="menu">
          <div className="navbar-dropdown-header">
            <span className="navbar-dropdown-name">{user.username}</span>
            <span className="navbar-dropdown-email">{user.email}</span>
          </div>
          <div className="navbar-dropdown-divider" />
          <button
            type="button"
            className="navbar-dropdown-item navbar-dropdown-disabled"
            disabled
            role="menuitem"
          >
            Profile
          </button>
          <div className="navbar-dropdown-divider" />
          <button
            type="button"
            className="navbar-dropdown-item navbar-dropdown-logout"
            onClick={handleLogout}
            role="menuitem"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Mobile variant of navbar auth for the mobile menu overlay.
 */
export function NavbarAuthMobile() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuthenticatedUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setUser(null);
    window.location.reload();
  }, []);

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <li>
        <a href="/auth#login" className="nav-link text-2xl">
          Sign in
        </a>
      </li>
    );
  }

  return (
    <>
      <li className="navbar-mobile-user">
        <span className="navbar-avatar navbar-avatar-lg">
          {user.username.slice(0, 2).toUpperCase()}
        </span>
        <span className="navbar-mobile-username">{user.username}</span>
      </li>
      <li>
        <button
          type="button"
          className="navbar-mobile-logout"
          onClick={handleLogout}
        >
          Log out
        </button>
      </li>
    </>
  );
}
