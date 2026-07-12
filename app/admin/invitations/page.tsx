import { requireRole, MANAGER_ROLES } from "../../lib/authorization";
import { InviteMemberForm } from "./invite-member-form";

export default async function InvitationsPage() {
  await requireRole(MANAGER_ROLES);
  return <InviteMemberForm />;
}
