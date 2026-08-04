import Link from "next/link";

export function BackLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400"
    >
      <span aria-hidden>←</span> Volver
    </Link>
  );
}
