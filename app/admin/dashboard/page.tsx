"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { OpsPage } from "../_components/ops-page";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Snapshot = {
  metrics: {
    activeVehicles: number;
    availableVehicles: number;
    inMaintenance: number;
    activeTrips: number;
    driversOnDuty: number;
  };
  vehicles: { id: string; regNumber: string; name: string; status: string }[];
  trips: {
    id: string;
    source: string;
    destination: string;
    status: string;
    vehicle: { regNumber: string };
    driver: { name: string };
  }[];
  alerts: { id: string; vehicle: string; issue: string; status: string }[];
};

// Mock driver locations for the map
const driverLocations = [
  { name: "Aarav Mehta", lat: 40.7128, lng: -74.006, regNumber: "TO-214" },
  { name: "Priya Shah", lat: 40.7306, lng: -73.9352, regNumber: "TO-101" },
  { name: "Rohan Iyer", lat: 40.7484, lng: -73.9857, regNumber: "TO-308" },
];

const metricLabels: [keyof Snapshot["metrics"], string][] = [
  ["activeVehicles", "Active vehicles"],
  ["availableVehicles", "Available"],
  ["inMaintenance", "In maintenance"],
  ["activeTrips", "Active trips"],
  ["driversOnDuty", "Drivers on duty"],
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const isManager = session?.user?.role === "FLEET_MANAGER";
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [message, setMessage] = useState("Loading live operations data…");
  const [showForm, setShowForm] = useState(false);
  const [vehicleMessage, setVehicleMessage] = useState("");

  async function loadSnapshot() {
    setMessage("Refreshing live operations data…");
    try {
      const response = await fetch("/api/operations", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setSnapshot(payload.data);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load operations data.");
    }
  }

  useEffect(() => {
    void loadSnapshot();
  }, []);

  async function createVehicle(formData: FormData) {
    setVehicleMessage("");
    const response = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    const payload = await response.json();
    if (!response.ok) return setVehicleMessage(payload.error ?? "Unable to create vehicle.");
    setShowForm(false);
    setVehicleMessage("Vehicle created.");
    await loadSnapshot();
  }

  async function deleteVehicle(id: string) {
    if (!window.confirm("Remove this vehicle?")) return;
    const response = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const payload = await response.json();
      setVehicleMessage(payload.error ?? "Unable to remove vehicle.");
      return;
    }
    await loadSnapshot();
  }

  return (
    <OpsPage
      kicker="LIVE OPERATIONS"
      title="Command center"
      subtitle={message || "Connected to the Transit Ops database"}
      action={
        isManager ? (
          <button className="manage-button" type="button" onClick={() => setShowForm((value) => !value)}>
            Add vehicle +
          </button>
        ) : undefined
      }
    >
      {showForm && isManager && (
        <form className="vehicle-form" action={createVehicle}>
          <label>
            Registration
            <input name="regNumber" placeholder="TO-501" required />
          </label>
          <label>
            Name
            <input name="name" placeholder="Electric bus" required />
          </label>
          <label>
            Type
            <input name="type" placeholder="Bus" required />
          </label>
          <label>
            Capacity
            <input name="maxLoadCapacity" type="number" min="1" required />
          </label>
          <button type="submit">Add to fleet</button>
        </form>
      )}
      {vehicleMessage && <p className="dashboard-message">{vehicleMessage}</p>}
      {snapshot && (
        <>
          <section className="live-metrics">
            {metricLabels.map(([key, label]) => (
              <article key={key}>
                <span>{label}</span>
                <strong>{snapshot.metrics[key]}</strong>
                <small>{key === "inMaintenance" ? "Open service exceptions" : "Updated in real time"}</small>
              </article>
            ))}
          </section>
          <section className="data-card vehicle-data" style={{ marginBottom: "28px" }}>
            <h2>Live Driver Tracking</h2>
            <div style={{ height: "400px", borderRadius: "8px", overflow: "hidden" }}>
              <MapContainer center={[40.7128, -74.006]} zoom={12} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {driverLocations.map((driver, index) => (
                  <Marker key={index} position={[driver.lat, driver.lng]}>
                    <Popup>
                      <strong>{driver.name}</strong><br/>
                      Vehicle: {driver.regNumber}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </section>
          <section className="live-grid">
            <article className="data-card">
              <h2>Recent trips</h2>
              {snapshot.trips.length ? (
                <div className="data-list">
                  {snapshot.trips.map((trip) => (
                    <div key={trip.id}>
                      <span>
                        <b>
                          {trip.source} → {trip.destination}
                        </b>
                        <small>
                          {trip.vehicle.regNumber} · {trip.driver.name}
                        </small>
                      </span>
                      <em>{trip.status.replaceAll("_", " ")}</em>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty label="No trips have been dispatched yet." />
              )}
            </article>
            <article className="data-card">
              <h2>Maintenance alerts</h2>
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
                <Empty label="No open maintenance alerts." />
              )}
            </article>
          </section>
          <section className="data-card vehicle-data">
            <h2>Fleet</h2>
            {snapshot.vehicles.length ? (
              <div className="fleet-table">
                <div className="table-head">
                  <span>Vehicle</span>
                  <span>Type</span>
                  <span>Status</span>
                  {isManager && <span />}
                </div>
                {snapshot.vehicles.map((vehicle) => (
                  <div key={vehicle.id}>
                    <span>
                      <b>{vehicle.regNumber}</b>
                    </span>
                    <span>{vehicle.name}</span>
                    <em>{vehicle.status.replaceAll("_", " ")}</em>
                    {isManager && (
                      <button className="delete-vehicle" type="button" onClick={() => void deleteVehicle(vehicle.id)}>
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Empty label="Your fleet is ready for its first vehicle. Add one using the form above." />
            )}
          </section>
        </>
      )}
    </OpsPage>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="empty-state">{label}</p>;
}
