"use client";

import { Check, Copy, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import { OpsPage } from "../_components/ops-page";

export function InviteMemberForm() {
  const [link, setLink] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function submit(formData: FormData) {
    setError("");
    setLink("");
    setCopied(false);
    const response = await fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    const payload = await response.json();
    if (!response.ok) return setError(payload.error ?? "Unable to create invitation.");
    setEmail(payload.data.email);
    setLink(`${window.location.origin}${payload.data.invitePath}`);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
  }

  return (
    <OpsPage kicker="TEAM ACCESS" title="Invite a team member" subtitle="Create a secure, single-use access link for drivers, safety officers, and analysts.">
      <section className="invite-layout">
        <article className="data-card invite-panel">
          <h2>New invitation</h2>
          <p className="invite-copy">Enter the recipient&apos;s work email and access level. Links expire after seven days.</p>
          <form action={submit} className="invite-form invite-form-stack">
            <label>
              Work email
              <input name="email" type="email" placeholder="name@company.com" required />
            </label>
            <label>
              Role
              <select name="role" defaultValue="DRIVER">
                <option value="DRIVER">Driver</option>
                <option value="SAFETY_OFFICER">Safety officer</option>
                <option value="FINANCIAL_ANALYST">Financial analyst</option>
                <option value="FLEET_MANAGER">Fleet manager</option>
              </select>
            </label>
            {error && <p className="form-error">{error}</p>}
            <button type="submit">
              <LinkIcon size={14} /> Generate invitation link
            </button>
          </form>
          {link && (
            <div className="invite-result">
              <p>
                <Check size={14} /> Invitation ready for {email}
              </p>
              <div className="invite-link-row">
                <input readOnly value={link} />
                <button type="button" onClick={() => void copyLink()}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </article>
      </section>
    </OpsPage>
  );
}
