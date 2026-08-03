import { login, signup } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <form className="flex w-full flex-col gap-4">
        <h1 className="text-center text-2xl font-semibold text-accent">
          Vida Gamificada
        </h1>

        {error && (
          <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-lg bg-blue-100 px-3 py-2 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
            {message}
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input id="email" name="email" type="email" required className="input" />
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
            className="input"
          />
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button formAction={login} type="submit" className="btn-primary">
            Iniciar sesión
          </button>
          <button formAction={signup} type="submit" className="btn-secondary">
            Crear cuenta
          </button>
        </div>
      </form>
    </div>
  );
}
