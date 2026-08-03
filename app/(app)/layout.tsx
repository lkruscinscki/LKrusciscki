import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import { NavBar } from "./nav-bar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b-2 border-accent/30 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {user.email}
        </span>
        <form action={logout}>
          <button type="submit" className="text-sm underline">
            Cerrar sesión
          </button>
        </form>
      </header>

      <main className="flex-1 overflow-y-auto pb-28">{children}</main>

      <NavBar />
    </div>
  );
}
