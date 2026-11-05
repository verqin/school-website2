import { createFileRoute } from "@tanstack/react-router";
import { OperationsPage, pageMeta } from "@/components/admin/OperationsPage";
export const Route = createFileRoute("/admin/academics_/assessments")({ ssr: false, head: () => pageMeta("Assessments"), component: () => <OperationsPage eyebrow="Academic office" title="Assessments" description="Plan tests, assignments and projects for each class." metrics={[]} columns={["Assessment", "Class", "Subject", "Due date", "Total marks", "Status"]} related={[{ label: "Back to Academics", to: "/admin/academics" }]} /> });
