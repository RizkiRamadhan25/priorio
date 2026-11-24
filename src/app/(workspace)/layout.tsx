import type { ReactNode } from "react";
import { WorkspaceFrame } from "@/components/shell/workspace-frame";
import { getWorkspace } from "@/server/services/workspace";

export default async function Layout({ children }: { children: ReactNode }) {
  return <WorkspaceFrame workspace={await getWorkspace()}>{children}</WorkspaceFrame>;
}
