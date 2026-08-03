import Link from "next/link";

const OPTIONS = [
  {
    href: "/registrar/jiujitsu",
    label: "Jiujitsu",
    description: "Sesión de entrenamiento",
  },
  {
    href: "/registrar/cross-training",
    label: "Cross-training",
    description: "Gym, running, escalada...",
  },
  {
    href: "/registrar/proyectos",
    label: "Proyectos",
    description: "Proyectos y entradas de log",
  },
  {
    href: "/registrar/competencias",
    label: "Competencias",
    description: "Eventos y combates",
  },
];

export default function RegistrarPage() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <h1 className="text-2xl font-semibold">Registrar</h1>
      {OPTIONS.map((opt) => (
        <Link
          key={opt.href}
          href={opt.href}
          className="rounded-lg border border-black/10 p-4 dark:border-white/10"
        >
          <p className="font-medium">{opt.label}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {opt.description}
          </p>
        </Link>
      ))}
    </div>
  );
}
