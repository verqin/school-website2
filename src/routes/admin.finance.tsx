import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  CreditCard,
  FileText,
  Landmark,
  Receipt,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/finance")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Finance - Cresta Reign Academy" }, { name: "robots", content: "noindex" }],
  }),
  component: FinanceWorkspace,
});

const fees = [
  ["Tuition", "$500.00"],
  ["Development levy", "$100.00"],
  ["ICT", "$50.00"],
  ["Sports", "$25.00"],
  ["Library", "$20.00"],
];

const payments = [
  {
    receipt: "CRA-RC-2026-00421",
    student: "Tendai Moyo",
    method: "Bank transfer",
    amount: "$300.00",
    date: "24 Aug 2026",
  },
  {
    receipt: "CRA-RC-2026-00420",
    student: "Rudo Chirwa",
    method: "Cash",
    amount: "$250.00",
    date: "24 Aug 2026",
  },
  {
    receipt: "CRA-RC-2026-00419",
    student: "Nyasha Dube",
    method: "Electronic",
    amount: "$675.00",
    date: "23 Aug 2026",
  },
];

function FinanceWorkspace() {
  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] uppercase text-gold">
            Finance and bursar workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary md:text-4xl">
            Fees, collections and receipts
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Manage the secondary day-school fee structure, student balances, discounts, instalments
            and accountable payment records.
          </p>
        </div>
        <Button>
          <Receipt className="size-4" /> Record payment
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Today's collections"
          value="$1,225"
          detail="3 transactions"
          icon={WalletCards}
        />
        <Metric
          label="Outstanding balances"
          value="$82,430"
          detail="Across 1,284 learners"
          icon={Landmark}
        />
        <Metric
          label="Electronic payments"
          value="$675"
          detail="55% of today's value"
          icon={CreditCard}
        />
        <Metric label="Receipts issued" value="148" detail="This term" icon={FileText} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-2xl border bg-card p-6" aria-labelledby="fee-heading">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 id="fee-heading" className="font-semibold">
                2026 secondary day-school structure
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                No boarding charges are included.
              </p>
            </div>
            <Badge variant="secondary">Active</Badge>
          </div>
          <div className="mt-5 divide-y">
            {fees.map(([label, amount]) => (
              <div key={label} className="flex items-center justify-between py-3 text-sm">
                <span>{label}</span>
                <span className="font-medium text-primary">{amount}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-4 font-semibold">
              <span>Standard term total</span>
              <span className="text-lg text-primary">$695.00</span>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              Edit fee structure
            </Button>
            <Button variant="ghost" size="sm">
              Add charge
            </Button>
          </div>
        </section>
        <section
          className="rounded-2xl border border-gold/30 bg-gold/5 p-6"
          aria-labelledby="balance-heading"
        >
          <h2 id="balance-heading" className="font-semibold">
            Collection health
          </h2>
          <div className="mt-5 flex items-end gap-3">
            <span className="text-5xl font-semibold text-primary">72%</span>
            <span className="pb-2 text-sm text-muted-foreground">collected this term</span>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-background">
            <div className="h-full w-[72%] rounded-full bg-secondary" />
          </div>
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Paid accounts</dt>
              <dd className="font-medium">924</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Instalment plans</dt>
              <dd className="font-medium">186</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Scholarships / discounts</dt>
              <dd className="font-medium">74</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="mt-8 rounded-2xl border bg-card p-6" aria-labelledby="payments-heading">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 id="payments-heading" className="font-semibold">
              Recent transactions
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Every payment can produce a printable receipt and update the learner balance.
            </p>
          </div>
          <Button variant="outline" size="sm">
            <ArrowDownToLine className="size-4" /> Export report
          </Button>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-3 font-medium">Receipt</th>
                <th className="px-3 py-3 font-medium">Student</th>
                <th className="px-3 py-3 font-medium">Method</th>
                <th className="px-3 py-3 font-medium">Amount</th>
                <th className="px-3 py-3 font-medium">Date</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((payment) => (
                <tr key={payment.receipt}>
                  <td className="px-3 py-4 font-medium text-primary">{payment.receipt}</td>
                  <td className="px-3 py-4">{payment.student}</td>
                  <td className="px-3 py-4">
                    <Badge variant="outline">{payment.method}</Badge>
                  </td>
                  <td className="px-3 py-4 font-medium">{payment.amount}</td>
                  <td className="px-3 py-4 text-muted-foreground">{payment.date}</td>
                  <td className="px-3 py-4 text-right">
                    <Button variant="ghost" size="sm">
                      Receipt
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof WalletCards;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 text-secondary" aria-hidden="true" />
      </div>
      <p className="mt-2 text-3xl font-semibold text-primary">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
