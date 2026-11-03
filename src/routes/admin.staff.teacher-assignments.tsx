import { createFileRoute } from "@tanstack/react-router";
import { OperationsPage, pageMeta } from "@/components/admin/OperationsPage";
export const Route = createFileRoute("/admin/staff/teacher-assignments")({ ssr: false, head: () => pageMeta("Teacher assignments"), component: () => <OperationsPage eyebrow="People and permissions" title="Teacher assignments" description="Record which teacher takes which class and subject." metrics={[]} columns={["Teacher", "Class", "Subject", "Periods per week", "Status"]} related={[{ label: "Back to Staff", to: "/admin/staff" }]} /> });
