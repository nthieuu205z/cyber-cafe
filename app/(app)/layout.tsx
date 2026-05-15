import { requireUser } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-1">
      <Sidebar role={user.role} username={user.username} />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
