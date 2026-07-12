import { redirect } from "next/navigation";
import { getSession } from "../lib/authorization";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  return children;
}
