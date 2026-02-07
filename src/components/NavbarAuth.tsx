import { useState, useEffect, useCallback } from "react";
import { getAuthenticatedUser, logout, type PublicUser } from "@/lib/auth/client";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import DropdownMenu from "@/components/ui/DropdownMenu";

export default function NavbarAuth() {
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
    return <div className="navbar-auth-placeholder" />;
  }

  if (!user) {
    return (
      <div className="navbar-auth-unauthed">
        <a href="/auth#login" className="navbar-signin-link">
          Sign in
        </a>
        <Button variant="primary" size="sm" href="/dashboard">
          Dashboard
          <span aria-hidden="true">&rarr;</span>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu
      trigger={
        <button
          type="button"
          className="navbar-avatar-btn"
          aria-haspopup="true"
        >
          <Avatar username={user.username} size="sm" />
          <span className="navbar-username">{user.username}</span>
        </button>
      }
      items={[
        {
          label: user.username,
          onClick: () => {},
        },
        {
          label: "Log out",
          onClick: handleLogout,
          danger: true,
        },
      ]}
      align="right"
    />
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
        <Avatar username={user.username} size="lg" />
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
