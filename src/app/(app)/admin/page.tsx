import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/session";

const sections = [
  { href: "/campaign", label: "Campaign", hint: "Name, status, current location/objective, recap" },
  { href: "/characters", label: "Characters", hint: "Edit any PC's description, backstory, sheet link" },
  { href: "/npcs", label: "NPCs", hint: "Create, edit, and reveal NPCs — secrets kept separate" },
  { href: "/lore", label: "Lore", hint: "Create, edit, and reveal lore entries" },
  { href: "/map", label: "Locations & Map", hint: "Location tree, discovery state, map image" },
  { href: "/admin/invites", label: "Invite links", hint: "Get the join links for Lilly, Aiden, Brody" },
];

export default async function AdminPage() {
  const session = await getSessionContext();
  if (!session) return null;
  if (session.membership.role !== "dm") redirect("/campaign");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">DM Admin</h1>
        <p className="text-sm text-muted">Everything you can edit, in one place.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="card p-5 transition-colors hover:border-accent">
            <p className="font-medium text-foreground">{s.label}</p>
            <p className="mt-1 text-sm text-muted">{s.hint}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
