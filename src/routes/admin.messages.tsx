import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, MailCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/site/states";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/messages")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Website messages - Cresta Reign Academy" },
      { name: "description", content: "Enquiries sent through the Cresta Reign Academy contact form." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MessagesPage,
});

function messagesQuery() {
  return {
    queryKey: ["admin", "contact-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("id, name, email, phone, subject, message, is_handled, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  };
}

function MessagesPage() {
  const queryClient = useQueryClient();
  const messages = useQuery(messagesQuery());
  const toggle = useMutation({
    mutationFn: async ({ id, handled }: { id: string; handled: boolean }) => {
      const { error } = await supabase
        .from("contact_messages")
        .update({ is_handled: handled })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "contact-messages"] }),
  });

  const rows = messages.data ?? [];
  const open = rows.filter((row) => !row.is_handled).length;

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] uppercase text-gold">Front desk</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-purple">Website messages</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Every enquiry sent from the contact page lands here.
          </p>
        </div>
        <Badge variant="secondary">{open} awaiting reply</Badge>
      </div>

      <div className="mt-8">
        {messages.isLoading ? (
          <div className="grid gap-3">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        ) : messages.isError ? (
          <ErrorState onRetry={() => void messages.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="Enquiries from the website contact form will appear here."
            icon={<Mail className="size-5" aria-hidden="true" />}
          />
        ) : (
          <ul className="grid gap-3">
            {rows.map((row) => (
              <li key={row.id} className={`rounded-2xl border p-5 ${row.is_handled ? "bg-card" : "border-gold/40 bg-gold/5"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-purple">
                      {row.subject || "No subject"}{" "}
                      {row.is_handled ? null : <Badge className="ml-2">New</Badge>}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {row.name} - <a className="underline-offset-4 hover:underline" href={`mailto:${row.email}`}>{row.email}</a>
                      {row.phone ? ` - ${row.phone}` : ""} - {new Date(row.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <a href={`mailto:${row.email}?subject=${encodeURIComponent(`Re: ${row.subject ?? "your enquiry"}`)}`}>
                        Reply
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant={row.is_handled ? "ghost" : "default"}
                      disabled={toggle.isPending}
                      onClick={() => toggle.mutate({ id: row.id, handled: !row.is_handled })}
                    >
                      <MailCheck className="size-4" aria-hidden="true" />
                      {row.is_handled ? "Reopen" : "Mark handled"}
                    </Button>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 whitespace-pre-line">{row.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
