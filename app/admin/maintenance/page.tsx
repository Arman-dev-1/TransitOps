"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { formatDate, OpsPage, StatusBadge } from "../_components/ops-page";

type Maintenance = {
  id: string;
  issue: string;
  notes?: string;
  status: string;
  createdAt: string;
  vehicle: { regNumber: string; name: string };
};

type Vehicle = { id: string; regNumber: string };

export default function MaintenancePage() {
  const { data: session } = useSession();
  const isManager = session?.user?.role === "FLEET_MANAGER";
  const [records, setRecords] = useState<Maintenance[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Maintenance[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [message, setMessage] = useState("Loading maintenance records…");
  const [formMessage, setFormMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  async function loadRecords() {
    setMessage("Refreshing maintenance records…");
    try {
      const [maintenanceRes, vehiclesRes] = await Promise.all([
        fetch("/api/maintenance", { cache: "no-store" }),
        fetch("/api/vehicles", { cache: "no-store" }),
      ]);
      const maintenancePayload = await maintenanceRes.json();
      const vehiclesPayload = await vehiclesRes.json();
      if (!maintenanceRes.ok) throw new Error(maintenancePayload.error);
      setRecords(maintenancePayload.data);
      setVehicles(vehiclesPayload.data ?? []);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load maintenance records.");
    }
  }

  useEffect(() => {
    void loadRecords();
  }, []);

  useEffect(() => {
    let filtered = [...records];
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.issue.toLowerCase().includes(search) || 
        r.vehicle.regNumber.toLowerCase().includes(search) ||
        r.vehicle.name.toLowerCase().includes(search)
      );
    }
    setFilteredRecords(filtered);
  }, [records, statusFilter, searchTerm]);

  async function createRecord(formData: FormData) {
    setFormMessage("");
    const response = await fetch("/api/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    const payload = await response.json();
    if (!response.ok) return setFormMessage(payload.error ?? "Unable to log maintenance issue.");
    setShowForm(false);
    setFormMessage("Maintenance issue logged.");
    await loadRecords();
  }

  async function updateStatus(id: string, newStatus: string) {
    try {
      const response = await fetch(`/api/maintenance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      await loadRecords();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <OpsPage
      kicker="MAINTENANCE"
      title="Service exceptions"
      subtitle={message || `${filteredRecords.length} maintenance records in the database`}
      action={
        isManager ? (
          <button className="manage-button" type="button" onClick={() => setShowForm((value) => !value)} disabled={!vehicles.length}>
            Log issue +
          </button>
        ) : undefined
      }
    >
      {showForm && isManager && (
        <form className="vehicle-form maintenance-form" action={createRecord}>
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
          <label className="maintenance-issue">
            Issue description
            <input name="issue" placeholder="Battery cooling system inspection" required />
          </label>
          <button type="submit">Log issue</button>
        </form>
      )}
      {formMessage && <p className="dashboard-message">{formMessage}</p>}
      <section className="data-card vehicle-data">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "16px" }}>
          <h2 style={{ margin: 0 }}>Maintenance log</h2>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "14px", fontWeight: 600 }}>
              Search
              <input
                type="text"
                placeholder="Search maintenance..."
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
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </label>
          </div>
        </div>
        {filteredRecords.length ? (
          <div className="fleet-table fleet-table-wide">
            <div className="table-head">
              <span>Issue</span>
              <span>Vehicle</span>
              <span>Reported</span>
              <span>Status</span>
            </div>
            {filteredRecords.map((record) => (
              <div key={record.id}>
                <span>
                  <b>{record.issue}</b>
                </span>
                <span>
                  {record.vehicle.regNumber} · {record.vehicle.name}
                </span>
                <span>{formatDate(record.createdAt)}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <StatusBadge status={record.status} />
                  {isManager && (
                    <select
                      value={record.status}
                      onChange={(e) => void updateStatus(record.id, e.target.value)}
                      style={{ padding: "4px 8px", border: "1px solid #dbe3ed", borderRadius: "4px", fontSize: "13px" }}
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No maintenance issues logged.</p>
        )}
      </section>
    </OpsPage>
  );
}
