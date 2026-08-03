"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const SPORTS = [
  { href: "/entrenamiento/jiujitsu", icon: "🥋", label: "Jiujitsu" },
  { href: "/entrenamiento/gym", icon: "🏋️", label: "Gym" },
  { href: "/entrenamiento/escalada", icon: "🧗", label: "Escalada" },
  { href: "/entrenamiento/running", icon: "🏃", label: "Running" },
];

const TABS = [
  { href: "/", icon: "✅", label: "Hábitos" },
  { href: "/inicio", icon: "🏠", label: "Inicio" },
  { href: "/proyectos", icon: "💼", label: "Proyectos" },
  { href: "/tareas", icon: "📝", label: "Tareas" },
];

export function NavBar() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const trainingActive = pathname.startsWith("/entrenamiento");

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md">
      {sheetOpen && (
        <button
          aria-label="Cerrar"
          onClick={() => setSheetOpen(false)}
          className="fixed inset-0 -z-10 bg-black/40"
        />
      )}

      {sheetOpen && (
        <div className="border-t border-black/10 bg-white px-3 pb-2 pt-3 dark:border-white/10 dark:bg-zinc-950">
          <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
            Entrenamiento
          </p>
          <div className="grid grid-cols-4 gap-2">
            {SPORTS.map((sport) => (
              <Link
                key={sport.href}
                href={sport.href}
                onClick={() => setSheetOpen(false)}
                className="flex flex-col items-center gap-1 rounded-lg py-2 text-center active:bg-black/5 dark:active:bg-white/10"
              >
                <span className="text-2xl">{sport.icon}</span>
                <span className="text-xs font-medium">{sport.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <nav className="flex border-t border-black/10 bg-white pb-[env(safe-area-inset-bottom)] dark:border-white/10 dark:bg-black">
        <button
          onClick={() => setSheetOpen((v) => !v)}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-center ${
            trainingActive || sheetOpen
              ? "text-accent"
              : "text-zinc-400 dark:text-zinc-600"
          }`}
        >
          <span className="text-xl">🥋</span>
          <span className="text-xs font-medium">Entrenamiento</span>
        </button>
        {TABS.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => setSheetOpen(false)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-center ${
                active ? "text-accent" : "text-zinc-400 dark:text-zinc-600"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
