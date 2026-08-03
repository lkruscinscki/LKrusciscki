"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Hoy" },
  { href: "/registrar", label: "Registrar" },
  { href: "/manana", label: "Mañana" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex border-t border-black/10 bg-white pb-[env(safe-area-inset-bottom)] dark:border-white/10 dark:bg-black">
      {TABS.map((tab) => {
        const active =
          tab.href === "/"
            ? pathname === "/"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 py-3 text-center text-sm font-medium ${
              active
                ? "text-black dark:text-white"
                : "text-zinc-400 dark:text-zinc-600"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
