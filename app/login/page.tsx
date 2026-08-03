import { login, signup } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <form className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-center text-2xl font-semibold">
          Vida Gamificada
        </h1>

        {error && (
          <p className="rounded bg-red-100 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded bg-blue-100 px-3 py-2 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
            {message}
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
          />
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            formAction={login}
            type="submit"
            className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
          >
            Iniciar sesión
          </button>
          <button
            formAction={signup}
            type="submit"
            className="rounded border border-black/20 px-4 py-2 dark:border-white/20"
          >
            Crear cuenta
          </button>
        </div>
      </form>
    </div>
  );
}
