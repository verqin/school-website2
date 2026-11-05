import { createFileRoute } from "@tanstack/react-router";
import { OperationsPage, pageMeta } from "@/components/admin/OperationsPage";
export const Route = createFileRoute("/admin/communication_/new")({ ssr: false, head: () => pageMeta("New message"), component: () => <OperationsPage eyebrow="School communication" title="New message" description="Draft announcements for parents, students or staff before sending." metrics={[]} columns={["Subject", "Audience", "Message", "Send date", "Status"]} related={[{ label: "Back to Communication", to: "/admin/communication" }]} /> });
