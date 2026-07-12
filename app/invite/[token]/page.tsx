import { AcceptInviteForm } from "./accept-invite-form";

export default async function InvitePage({ params }: PageProps<"/invite/[token]">) {
  const { token } = await params;
  return <AcceptInviteForm token={token} />;
}
