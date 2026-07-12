"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { OpsPage, StatusBadge } from "../_components/ops-page";

type Vehicle = {
  id: string;
  regNumber: string;
  name: string;
  type: string;
  maxLoadCapacity: number;
  odometer: number;
  status: string;
};

export default function VehiclesPage() {
  const { data: session } = useSession();
  const isManager = session?.user?.role === "FLEET_MANAGER";
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [message, setMessage] = useState("Loading fleet data…");
  const [formMessage, setFormMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  async function loadVehicles() {
    setMessage("Refreshing fleet data…");
    try {
      const response = await fetch("/api/vehicles", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setVehicles(payload.data);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load vehicles.");
    }
  }

  useEffect(() => {
    void loadVehicles();
  }, []);

  useEffect(() => {
    let filtered = [...vehicles];
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(v => v.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(search) || 
        v.regNumber.toLowerCase().includes(search) ||
        v.type.toLowerCase().includes(search)
      );
    }
    setFilteredVehicles(filtered);
  }, [vehicles, statusFilter, searchTerm]);

  async function createVehicle(formData: FormData) {
    setFormMessage("");
    const response = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    const payload = await response.json();
    if (!response.ok) return setFormMessage(payload.error ?? "Unable to create vehicle.");
    setShowForm(false);
    setFormMessage("Vehicle added to fleet.");
    await loadVehicles();
  }

  async function deleteVehicle(id: string) {
    if (!window.confirm("Remove this vehicle from the fleet?")) return;
    const response = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok) return setFormMessage(payload.error ?? "Unable to remove vehicle.");
    await loadVehicles();
  }

  async function updateStatus(id: string, newStatus: string) {
    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      await loadVehicles();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <OpsPage
      kicker="FLEET MANAGEMENT"
      title="Vehicles"
      subtitle={message || `${filteredVehicles.length} vehicles in the Transit Ops database`}
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
            <input name="name" placeholder="Metroline Electric" required />
          </label>
          <label>
            Type
            <input name="type" placeholder="Electric bus" required />
          </label>
          <label>
            Capacity
            <input name="maxLoadCapacity" type="number" min="1" required />
          </label>
          <button type="submit">Add to fleet</button>
        </form>
      )}
      {formMessage && <p className="dashboard-message">{formMessage}</p>}
      <section className="data-card vehicle-data">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "16px" }}>
          <h2 style={{ margin: 0 }}>Fleet registry</h2>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", fontWeight: 600 }}>
              Search
              <input
                type="text"
                placeholder="Search vehicles..."
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
                <option value="AVAILABLE">Available</option>
                <option value="ON_TRIP">On Trip</option>
                <option value="IN_SHOP">In Shop</option>
                <option value="RETIRED">Retired</option>
              </select>
            </label>
          </div>
        </div>
        {filteredVehicles.length ? (
          <div className="fleet-table fleet-table-wide">
            <div className="table-head">
              <span>Registration</span>
              <span>Name</span>
              <span>Type</span>
              <span>Capacity</span>
              <span>Status</span>
              {isManager && <span>Actions</span>}
            </div>
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.id}>
                <span>
                  <b>{vehicle.regNumber}</b>
                </span>
                <span>{vehicle.name}</span>
                <span>{vehicle.type}</span>
                <span>{vehicle.maxLoadCapacity} seats</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <StatusBadge status={vehicle.status} />
                  {isManager && (
                    <select
                      value={vehicle.status}
                      onChange={(e) => void updateStatus(vehicle.id, e.target.value)}
                      style={{ padding: "4px 8px", border: "1px solid #dbe3ed", borderRadius: "4px", fontSize: "13px" }}
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="ON_TRIP">On Trip</option>
                      <option value="IN_SHOP">In Shop</option>
                      <option value="RETIRED">Retired</option>
                    </select>
                  )}
                </div>
                {isManager && (
                  <button className="delete-vehicle" type="button" onClick={() => void deleteVehicle(vehicle.id)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No vehicles in the fleet yet. Add the first vehicle to get started.</p>
        )}
      </section>
    </OpsPage>
  );
}
