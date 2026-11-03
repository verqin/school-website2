import { createFileRoute } from "@tanstack/react-router";
import { OperationsPage, pageMeta } from "@/components/admin/OperationsPage";
export const Route = createFileRoute("/admin/academics/analytics")({ ssr: false, head: () => pageMeta("Academic analytics"), component: () => <OperationsPage eyebrow="Academic office" title="Academic analytics" description="Track subject performance and term averages by class." metrics={[]} columns={["Class", "Subject", "Term", "Average %", "Status"]} related={[{ label: "Back to Academics", to: "/admin/academics" }]} /> });
