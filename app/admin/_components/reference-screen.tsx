import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "../../lib/authorization";

const navigation = [
  ["/admin/dashboard", "Overview"], ["/admin/vehicles", "Vehicles"], ["/admin/drivers", "Drivers"], ["/admin/trips", "Trips"], ["/admin/maintenance", "Maintenance"], ["/admin/team", "Team"],
] as const;

export async function ReferenceScreen({ title, source }: { title: string; source: string }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  return <main className="reference-shell"><nav className="reference-nav"><Link href="/admin/dashboard" className="reference-brand">Transit Ops</Link><div>{navigation.map(([href, label]) => <Link key={href} href={href} className={title === label ? "reference-active" : ""}>{label}</Link>)}</div><Link href="/admin/invitations">Invite member</Link></nav><iframe className="reference-frame" title={`${title} management`} src={`/reference/${source}/index.html`} /></main>;
}
