import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/session";
import { Nav } from "@/components/Nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionContext();
  if (!session) redirect("/onboarding");

  return (
    <div className="flex min-h-screen flex-col">
      <Nav isDm={session.membership.role === "dm"} characterName={session.character?.name} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
