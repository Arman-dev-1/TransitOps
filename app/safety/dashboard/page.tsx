"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type Snapshot = {
  alerts: { id: string; vehicle: string; issue: string; status: string }[];
  metrics: { inMaintenance: number; activeVehicles: number };
};

export default function SafetyDashboardPage() {
  const { data: session } = useSession();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    void fetch("/api/operations", { cache: "no-store" })
      .then((res) => res.json())
      .then((payload) => setSnapshot(payload.data));
  }, []);

  return (
    <main className="role-dashboard">
      <nav className="role-nav">
        <Link href="/" className="role-brand">
          Transit Ops
        </Link>
        <span className="role-label">Safety command</span>
        <div className="role-actions">
          {session?.user?.name && <span>{session.user.name}</span>}
          <button type="button" onClick={() => void signOut({ callbackUrl: "/" })}>
            Sign out
          </button>
        </div>
      </nav>
      <section className="role-heading">
        <p>SAFETY OFFICER</p>
        <h1>Incident & compliance watch</h1>
        <span>Maintenance exceptions and fleet risk signals</span>
      </section>
      {snapshot && (
        <>
          <section className="role-metrics">
            <article>
              <span>Vehicles in maintenance</span>
              <strong>{snapshot.metrics.inMaintenance}</strong>
            </article>
            <article>
              <span>Active fleet</span>
              <strong>{snapshot.metrics.activeVehicles}</strong>
            </article>
          </section>
          <section className="data-card vehicle-data">
            <h2>Open maintenance & safety alerts</h2>
            {snapshot.alerts.length ? (
              <div className="data-list">
                {snapshot.alerts.map((alert) => (
                  <div key={alert.id}>
                    <span>
                      <b>{alert.issue}</b>
                      <small>{alert.vehicle}</small>
                    </span>
                    <em className="alert-status">{alert.status}</em>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No open safety alerts.</p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
