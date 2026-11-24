import { TasksPage } from "@/components/tasks/tasks-page";

export default async function Tasks({ searchParams }: { searchParams: Promise<{ course?: string | string[]; category?: string | string[] }> }) {
  const { course, category } = await searchParams;
  const selection = { course: typeof course === "string" ? course : undefined, category: typeof category === "string" ? category : undefined };
  return <TasksPage key={JSON.stringify(selection)} mode="tasks" selection={selection} />;
}
