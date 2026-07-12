"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type Snapshot = {
  trips: { id: string; source: string; destination: string; status: string; vehicle: { regNumber: string } }[];
  alerts: { id: string; vehicle: string; issue: string; status: string }[];
  metrics: { activeTrips: number; driversOnDuty: number };
};

export default function DriverDashboardPage() {
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
        <span className="role-label">Driver workspace</span>
        <div className="role-actions">
          {session?.user?.name && <span>{session.user.name}</span>}
          <button type="button" onClick={() => void signOut({ callbackUrl: "/" })}>
            Sign out
          </button>
        </div>
      </nav>
      <section className="role-heading">
        <p>DRIVER VIEW</p>
        <h1>Today&apos;s assignments</h1>
        <span>Live trip and route data from the operations database</span>
      </section>
      {snapshot && (
        <>
          <section className="role-metrics">
            <article>
              <span>Active trips</span>
              <strong>{snapshot.metrics.activeTrips}</strong>
            </article>
            <article>
              <span>Drivers on duty</span>
              <strong>{snapshot.metrics.driversOnDuty}</strong>
            </article>
          </section>
          <section className="role-grid">
            <article className="data-card">
              <h2>Assigned routes</h2>
              <div className="data-list">
                {snapshot.trips.map((trip) => (
                  <div key={trip.id}>
                    <span>
                      <b>
                        {trip.source} → {trip.destination}
                      </b>
                      <small>{trip.vehicle.regNumber}</small>
                    </span>
                    <em>{trip.status.replaceAll("_", " ")}</em>
                  </div>
                ))}
              </div>
            </article>
            <article className="data-card">
              <h2>Service alerts</h2>
              <div className="data-list">
                {snapshot.alerts.length ? (
                  snapshot.alerts.map((alert) => (
                    <div key={alert.id}>
                      <span>
                        <b>{alert.issue}</b>
                        <small>{alert.vehicle}</small>
                      </span>
                      <em className="alert-status">{alert.status}</em>
                    </div>
                  ))
                ) : (
                  <p className="empty-state">No active service alerts.</p>
                )}
              </div>
            </article>
          </section>
        </>
      )}
    </main>
  );
}
