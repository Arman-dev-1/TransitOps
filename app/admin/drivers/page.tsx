"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { formatDate, OpsPage, StatusBadge } from "../_components/ops-page";

type Driver = {
  id: string;
  name: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: string;
  safetyScore: number;
};

export default function DriversPage() {
  const { data: session } = useSession();
  const isManager = session?.user?.role === "FLEET_MANAGER";
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [message, setMessage] = useState("Loading driver roster…");
  const [formMessage, setFormMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  async function loadDrivers() {
    setMessage("Refreshing driver roster…");
    try {
      const response = await fetch("/api/drivers", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setDrivers(payload.data);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load drivers.");
    }
  }

  useEffect(() => {
    void loadDrivers();
  }, []);

  useEffect(() => {
    let filtered = [...drivers];
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(d => d.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(search) || 
        d.licenseNumber.toLowerCase().includes(search)
      );
    }
    setFilteredDrivers(filtered);
  }, [drivers, statusFilter, searchTerm]);

  async function createDriver(formData: FormData) {
    setFormMessage("");
    const response = await fetch("/api/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    const payload = await response.json();
    if (!response.ok) return setFormMessage(payload.error ?? "Unable to add driver.");
    setShowForm(false);
    setFormMessage("Driver added to roster.");
    await loadDrivers();
  }

  async function updateStatus(id: string, newStatus: string) {
    try {
      const response = await fetch(`/api/drivers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      await loadDrivers();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <OpsPage
      kicker="DRIVER MANAGEMENT"
      title="Drivers"
      subtitle={message || `${filteredDrivers.length} drivers in the Transit Ops database`}
      action={
        isManager ? (
          <button className="manage-button" type="button" onClick={() => setShowForm((value) => !value)}>
            Add driver +
          </button>
        ) : undefined
      }
    >
      {showForm && isManager && (
        <form className="vehicle-form driver-form" action={createDriver}>
          <label>
            Full name
            <input name="name" placeholder="Aarav Mehta" required />
          </label>
          <label>
            License number
            <input name="licenseNumber" placeholder="DL-803942" required />
          </label>
          <label>
            License expiry
            <input name="licenseExpiry" type="date" required />
          </label>
          <label>
            Safety score
            <input name="safetyScore" type="number" min="0" max="100" defaultValue="100" />
          </label>
          <button type="submit">Add driver</button>
        </form>
      )}
      {formMessage && <p className="dashboard-message">{formMessage}</p>}
      <section className="data-card vehicle-data">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "16px" }}>
          <h2 style={{ margin: 0 }}>Driver roster</h2>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", fontWeight: 600 }}>
              Search
              <input
                type="text"
                placeholder="Search drivers..."
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
                <option value="OFF_DUTY">Off Duty</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </label>
          </div>
        </div>
        {filteredDrivers.length ? (
          <div className="fleet-table fleet-table-wide">
            <div className="table-head">
              <span>Driver</span>
              <span>License</span>
              <span>Expiry</span>
              <span>Safety score</span>
              <span>Status</span>
            </div>
            {filteredDrivers.map((driver) => (
              <div key={driver.id}>
                <span>
                  <b>{driver.name}</b>
                </span>
                <span>{driver.licenseNumber}</span>
                <span>{formatDate(driver.licenseExpiry)}</span>
                <span>{driver.safetyScore}/100</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <StatusBadge status={driver.status} />
                  {isManager && (
                    <select
                      value={driver.status}
                      onChange={(e) => void updateStatus(driver.id, e.target.value)}
                      style={{ padding: "4px 8px", border: "1px solid #dbe3ed", borderRadius: "4px", fontSize: "13px" }}
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="ON_TRIP">On Trip</option>
                      <option value="OFF_DUTY">Off Duty</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No drivers on the roster yet.</p>
        )}
      </section>
    </OpsPage>
  );
}
