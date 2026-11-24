export const routes = ["/", "/tasks", "/priority", "/courses", "/categories", "/calendar", "/completed", "/settings"] as const;
export type Route = (typeof routes)[number];
