import { createFileRoute } from "@tanstack/react-router";
import { OperationsPage, pageMeta } from "@/components/admin/OperationsPage";
export const Route = createFileRoute("/admin/academics/report-cards")({ ssr: false, head: () => pageMeta("Report cards"), component: () => <OperationsPage eyebrow="Academic office" title="Report cards" description="Follow report card preparation, approval and publishing per class." metrics={[]} columns={["Class", "Term", "Class teacher", "Deadline", "Status"]} related={[{ label: "Back to Academics", to: "/admin/academics" }]} /> });
