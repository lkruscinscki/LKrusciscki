import Link from "next/link";

const SPORTS = [
  { href: "/entrenamiento/jiujitsu", icon: "🥋", label: "Jiujitsu" },
  { href: "/entrenamiento/gym", icon: "🏋️", label: "Gym" },
  { href: "/entrenamiento/escalada", icon: "🧗", label: "Escalada" },
  { href: "/entrenamiento/running", icon: "🏃", label: "Running" },
];

export default function EntrenamientoPage() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <h1 className="text-2xl font-semibold">Entrenamiento</h1>
      {SPORTS.map((sport) => (
        <Link key={sport.href} href={sport.href} className="card flex items-center gap-3">
          <span className="text-2xl">{sport.icon}</span>
          <span className="font-medium">{sport.label}</span>
        </Link>
      ))}
    </div>
  );
}
