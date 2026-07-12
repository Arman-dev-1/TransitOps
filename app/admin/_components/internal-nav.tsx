"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const links = [
  ["/admin/dashboard", "Overview"],
  ["/admin/vehicles", "Vehicles"],
  ["/admin/drivers", "Drivers"],
  ["/admin/trips", "Trips"],
  ["/admin/maintenance", "Maintenance"],
  ["/admin/team", "Team"],
  ["/admin/invitations", "Invitations"],
] as const;

export function InternalNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isManager = session?.user?.role === "FLEET_MANAGER";

  return (
    <nav className="internal-nav">
      <Link href="/admin/dashboard" className="internal-brand">
        Transit Ops
      </Link>
      <div>
        {links.map(([href, label]) => {
          if (href === "/admin/invitations" && !isManager) return null;
          const active = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={active ? "internal-active" : undefined}>
              {label}
            </Link>
          );
        })}
      </div>
      <div className="internal-actions">
        {session?.user?.name && <span className="internal-user">{session.user.name}</span>}
        <button type="button" className="internal-signout" onClick={() => void signOut({ callbackUrl: "/" })}>
          Sign out
        </button>
        <Link href="/" className="internal-home">
          Home
        </Link>
      </div>
    </nav>
  );
}
