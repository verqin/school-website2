import { createFileRoute } from "@tanstack/react-router";
import { OperationsPage, pageMeta } from "@/components/admin/OperationsPage";
export const Route = createFileRoute("/admin/attendance/analytics")({ ssr: false, head: () => pageMeta("Attendance analytics"), component: () => <OperationsPage eyebrow="Safeguarding and attendance" title="Attendance analytics" description="Record weekly attendance rates and follow-up actions." metrics={[]} columns={["Class", "Week", "Attendance %", "Follow-up", "Status"]} related={[{ label: "Back to Attendance", to: "/admin/attendance" }]} /> });
