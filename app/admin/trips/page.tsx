"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { OpsPage, StatusBadge } from "../_components/ops-page";

type Trip = {
  id: string;
  source: string;
  destination: string;
  cargoWeight: number;
  status: string;
  vehicle: { regNumber: string };
  driver: { name: string };
};

type Vehicle = { id: string; regNumber: string };
type Driver = { id: string; name: string };

export default function TripsPage() {
  const { data: session } = useSession();
  const isManager = session?.user?.role === "FLEET_MANAGER";
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [message, setMessage] = useState("Loading trip schedule…");
  const [formMessage, setFormMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  async function loadTrips() {
    setMessage("Refreshing trip schedule…");
    try {
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        fetch("/api/trips", { cache: "no-store" }),
        fetch("/api/vehicles", { cache: "no-store" }),
        fetch("/api/drivers", { cache: "no-store" }),
      ]);
      const tripsPayload = await tripsRes.json();
      const vehiclesPayload = await vehiclesRes.json();
      const driversPayload = await driversRes.json();
      if (!tripsRes.ok) throw new Error(tripsPayload.error);
      setTrips(tripsPayload.data);
      setVehicles(vehiclesPayload.data ?? []);
      setDrivers(driversPayload.data ?? []);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load trips.");
    }
  }

  useEffect(() => {
    void loadTrips();
  }, []);

  useEffect(() => {
    let filtered = [...trips];
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.source.toLowerCase().includes(search) || 
        t.destination.toLowerCase().includes(search) ||
        t.vehicle.regNumber.toLowerCase().includes(search) ||
        t.driver.name.toLowerCase().includes(search)
      );
    }
    setFilteredTrips(filtered);
  }, [trips, statusFilter, searchTerm]);

  async function createTrip(formData: FormData) {
    setFormMessage("");
    const response = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    const payload = await response.json();
    if (!response.ok) return setFormMessage(payload.error ?? "Unable to create trip.");
    setShowForm(false);
    setFormMessage("Trip created.");
    await loadTrips();
  }

  async function updateStatus(id: string, newStatus: string) {
    try {
      const response = await fetch(`/api/trips/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      await loadTrips();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <OpsPage
      kicker="TRIP MANAGEMENT"
      title="Trips"
      subtitle={message || `${filteredTrips.length} trips in the Transit Ops database`}
      action={
        isManager ? (
          <button className="manage-button" type="button" onClick={() => setShowForm((value) => !value)} disabled={!vehicles.length || !drivers.length}>
            Schedule trip +
          </button>
        ) : undefined
      }
    >
      {showForm && isManager && (
        <form className="vehicle-form trip-form" action={createTrip}>
          <label>
            Source
            <input name="source" placeholder="Central Station" required />
          </label>
          <label>
            Destination
            <input name="destination" placeholder="Airport Terminal 2" required />
          </label>
          <label>
            Cargo weight
            <input name="cargoWeight" type="number" min="1" required />
          </label>
          <label>
            Vehicle
            <select name="vehicleId" required>
              <option value="">Select vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.regNumber}
                </option>
              ))}
            </select>
          </label>
          <label>
            Driver
            <select name="driverId" required>
              <option value="">Select driver</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select name="status" defaultValue="DRAFT">
              <option value="DRAFT">Draft</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </label>
          <button type="submit">Create trip</button>
        </form>
      )}
      {formMessage && <p className="dashboard-message">{formMessage}</p>}
      <section className="data-card vehicle-data">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "16px" }}>
          <h2 style={{ margin: 0 }}>Trip schedule</h2>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", fontWeight: 600 }}>
              Search
              <input
                type="text"
                placeholder="Search trips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: "8px 12px", border: "1px solid #dbe3ed", borderRadius: "6px", fontSize: "14px" }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", fontWeight: 600 }}>
              Status
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: "8px 12px", border: "1px solid #dbe3ed", borderRadius: "6px", fontSize: "14px" }}
              >
                <option value="ALL">All</option>
                <option value="DRAFT">Draft</option>
                <option value="DISPATCHED">Dispatched</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </label>
          </div>
        </div>
        {filteredTrips.length ? (
          <div className="fleet-table fleet-table-wide">
            <div className="table-head">
              <span>Route</span>
              <span>Vehicle</span>
              <span>Driver</span>
              <span>Weight</span>
              <span>Status</span>
            </div>
            {filteredTrips.map((trip) => (
              <div key={trip.id}>
                <span>
                  <b>
                    {trip.source} → {trip.destination}
                  </b>
                </span>
                <span>{trip.vehicle.regNumber}</span>
                <span>{trip.driver.name}</span>
                <span>{trip.cargoWeight} kg</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <StatusBadge status={trip.status} />
                  {isManager && (
                    <select
                      value={trip.status}
                      onChange={(e) => void updateStatus(trip.id, e.target.value)}
                      style={{ padding: "4px 8px", border: "1px solid #dbe3ed", borderRadius: "4px", fontSize: "13px" }}
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="DISPATCHED">Dispatched</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No trips scheduled yet.</p>
        )}
      </section>
    </OpsPage>
  );
}
