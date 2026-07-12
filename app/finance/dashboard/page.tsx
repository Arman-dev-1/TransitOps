"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type Snapshot = {
  vehicles: { regNumber: string; name: string; status: string; odometer: number }[];
  trips: { id: string; source: string; destination: string; cargoWeight: number; status: string }[];
  metrics: { availableVehicles: number; activeTrips: number };
};

export default function FinanceDashboardPage() {
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
        <span className="role-label">Financial reporting</span>
        <div className="role-actions">
          {session?.user?.name && <span>{session.user.name}</span>}
          <button type="button" onClick={() => void signOut({ callbackUrl: "/" })}>
            Sign out
          </button>
        </div>
      </nav>
      <section className="role-heading">
        <p>FINANCIAL ANALYST</p>
        <h1>Operations reporting</h1>
        <span>Fleet utilization and trip volume from live data</span>
      </section>
      {snapshot && (
        <>
          <section className="role-metrics">
            <article>
              <span>Available fleet</span>
              <strong>{snapshot.metrics.availableVehicles}</strong>
            </article>
            <article>
              <span>Active trips</span>
              <strong>{snapshot.metrics.activeTrips}</strong>
            </article>
          </section>
          <section className="role-grid">
            <article className="data-card">
              <h2>Trip volume</h2>
              <div className="data-list">
                {snapshot.trips.map((trip) => (
                  <div key={trip.id}>
                    <span>
                      <b>
                        {trip.source} → {trip.destination}
                      </b>
                      <small>{trip.cargoWeight} kg cargo</small>
                    </span>
                    <em>{trip.status.replaceAll("_", " ")}</em>
                  </div>
                ))}
              </div>
            </article>
            <article className="data-card">
              <h2>Fleet utilization</h2>
              <div className="fleet-table">
                <div className="table-head">
                  <span>Vehicle</span>
                  <span>Odometer</span>
                  <span>Status</span>
                </div>
                {snapshot.vehicles.map((vehicle) => (
                  <div key={vehicle.regNumber}>
                    <span>
                      <b>{vehicle.regNumber}</b>
                    </span>
                    <span>{Math.round(vehicle.odometer).toLocaleString()} km</span>
                    <em>{vehicle.status.replaceAll("_", " ")}</em>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </>
      )}
    </main>
  );
}
