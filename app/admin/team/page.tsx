"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, OpsPage } from "../_components/ops-page";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  createdAt: string;
};

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [message, setMessage] = useState("Loading team directory…");

  async function loadTeam() {
    setMessage("Refreshing team directory…");
    try {
      const response = await fetch("/api/team", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setUsers(payload.data.users);
      setInvitations(payload.data.invitations);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load team.");
    }
  }

  useEffect(() => {
    void loadTeam();
  }, []);

  return (
    <OpsPage
      kicker="TEAM"
      title="People & access"
      subtitle={message || `${users.length} active accounts`}
      action={
        <Link className="manage-button" href="/admin/invitations">
          Invite member
        </Link>
      }
    >
      <section className="data-card vehicle-data">
        <h2>Active accounts</h2>
        {users.length ? (
          <div className="fleet-table fleet-table-wide">
            <div className="table-head">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Joined</span>
            </div>
            {users.map((user) => (
              <div key={user.id}>
                <span>
                  <b>{user.name ?? "—"}</b>
                </span>
                <span>{user.email}</span>
                <span>{user.role.replaceAll("_", " ").toLowerCase()}</span>
                <span>{formatDate(user.createdAt)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No team members yet.</p>
        )}
      </section>

      <section className="data-card vehicle-data team-invites">
        <h2>Pending invitations</h2>
        {invitations.length ? (
          <div className="fleet-table fleet-table-wide">
            <div className="table-head">
              <span>Email</span>
              <span>Role</span>
              <span>Sent</span>
              <span>Expires</span>
            </div>
            {invitations.map((invite) => (
              <div key={invite.id}>
                <span>
                  <b>{invite.email}</b>
                </span>
                <span>{invite.role.replaceAll("_", " ").toLowerCase()}</span>
                <span>{formatDate(invite.createdAt)}</span>
                <span>{formatDate(invite.expiresAt)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No pending invitations.</p>
        )}
      </section>
    </OpsPage>
  );
}
