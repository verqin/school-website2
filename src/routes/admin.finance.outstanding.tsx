import { createFileRoute } from "@tanstack/react-router";
import { OperationsPage, pageMeta } from "@/components/admin/OperationsPage";
export const Route = createFileRoute("/admin/finance/outstanding")({ ssr: false, head: () => pageMeta("Outstanding fees"), component: () => <OperationsPage eyebrow="Bursar office" title="Outstanding fees" description="Follow up families with unpaid balances." metrics={[]} columns={["Student", "Class", "Amount owed", "Last contact", "Status"]} related={[{ label: "Back to Finance", to: "/admin/finance" }]} /> });
