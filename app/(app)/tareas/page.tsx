import { createClient } from "@/lib/supabase/server";
import { getTodayGameDate, addDays } from "@/lib/game-day";
import type { Database } from "@/lib/supabase/database.types";
import { addTodo, toggleTodo, deleteTodo } from "./actions";

type Todo = Database["public"]["Tables"]["todos"]["Row"];

export default async function TareasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = await getTodayGameDate(supabase, user!.id);
  const tomorrow = addDays(today, 1);

  const [{ data: todayTodos }, { data: tomorrowTodos }] = await Promise.all([
    supabase
      .from("todos")
      .select("*")
      .eq("for_date", today)
      .order("created_at"),
    supabase
      .from("todos")
      .select("*")
      .eq("for_date", tomorrow)
      .order("created_at"),
  ]);

  return (
    <div className="flex flex-col gap-8 p-4">
      <h1 className="text-2xl font-semibold">Tareas</h1>
      <TodoSection title="Hoy" date={today} todos={todayTodos ?? []} />
      <TodoSection title="Mañana" date={tomorrow} todos={tomorrowTodos ?? []} />
    </div>
  );
}

function TodoSection({
  title,
  date,
  todos,
}: {
  title: string;
  date: string;
  todos: Todo[];
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>

      <ul className="flex flex-col gap-2">
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center gap-2">
            <form action={toggleTodo}>
              <input type="hidden" name="id" value={todo.id} />
              <input
                type="hidden"
                name="completed"
                value={String(todo.completed)}
              />
              <button
                type="submit"
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-sm ${
                  todo.completed
                    ? "border-accent bg-accent text-white"
                    : "border-black/30 dark:border-white/30"
                }`}
              >
                {todo.completed ? "✓" : ""}
              </button>
            </form>
            <span
              className={
                todo.completed
                  ? "flex-1 text-sm text-zinc-400 line-through"
                  : "flex-1 text-sm"
              }
            >
              {todo.text}
            </span>
            <form action={deleteTodo}>
              <input type="hidden" name="id" value={todo.id} />
              <button
                type="submit"
                className="text-sm text-zinc-400 underline"
              >
                borrar
              </button>
            </form>
          </li>
        ))}
        {todos.length === 0 && (
          <p className="text-sm text-zinc-400">Nada por acá.</p>
        )}
      </ul>

      <form action={addTodo} className="flex gap-2">
        <input type="hidden" name="for_date" value={date} />
        <input name="text" required placeholder="Nueva tarea" className="input" />
        <button type="submit" className="btn-primary">
          Agregar
        </button>
      </form>
    </section>
  );
}
