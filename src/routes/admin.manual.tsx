import { createFileRoute } from "@tanstack/react-router";
import { ManualView } from "@/components/ManualView";
import { adminManual } from "@/lib/manuals";

export const Route = createFileRoute("/admin/manual")({
  head: () => ({ meta: [{ title: "Staff dashboard manual - Cresta Reign Academy" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <div className="container-page py-10"><ManualView manual={adminManual} /></div>
  ),
});
