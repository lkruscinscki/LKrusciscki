import Link from "next/link";
import { BackLink } from "../../../back-link";
import { MUSCLE_GROUPS } from "../muscle-groups";

export default function GymGruposPage() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <BackLink href="/entrenamiento/gym" />
      <h1 className="text-2xl font-semibold">Elegí un grupo muscular</h1>

      <div className="grid grid-cols-2 gap-3">
        {MUSCLE_GROUPS.map((group) => (
          <Link
            key={group.slug}
            href={`/entrenamiento/gym/grupos/${group.slug}`}
            className="card text-center font-medium"
          >
            {group.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
