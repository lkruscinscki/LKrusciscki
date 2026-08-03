import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        Sesión iniciada como
      </p>
      <p className="text-xl font-semibold">{user.email}</p>
      <form action={logout}>
        <button
          type="submit"
          className="rounded border border-black/20 px-4 py-2 dark:border-white/20"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
