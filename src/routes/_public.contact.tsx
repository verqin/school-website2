import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Section, SectionHeading } from "@/components/site/primitives";
import { PlaceholderNote } from "@/components/site/states";
import { supabase } from "@/integrations/supabase/client";
import { siteConfig } from "@/lib/site-config";
import { ImageHero } from "@/components/site/blocks";
import contactHero from "@/assets/contact-hero.jpg";

const title = "Contact Us";
const description = "Get in touch with the Sample1 School office - enquiries, visits and general questions.";

export const Route = createFileRoute("/_public/contact")({
  head: () => ({
    meta: [
      { title: `${title} - Sample1 School` },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    const { error } = await supabase.from("contact_messages").insert({
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      subject: String(form.get("subject") ?? ""),
      message: String(form.get("message") ?? ""),
    });
    if (error) {
      setMessage(error.message);
      setStatus("error");
      return;
    }
    setStatus("sent");
    event.currentTarget.reset();
  }

  return (
    <>
      <ImageHero image={contactHero} imageAlt="Entrance to the Sample1 School campus" eyebrow="Contact" title={title} description={description} />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <SectionHeading id="form-heading" eyebrow="Send a message" title="We'd love to hear from you" />
            <form className="grid gap-5" onSubmit={onSubmit} aria-labelledby="form-heading">
              <div className="grid gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" required autoComplete="name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" name="email" type="email" required autoComplete="email" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" rows={6} required />
              </div>
              <div className="flex items-center gap-4">
                <Button type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Send message"}
                </Button>
                <p aria-live="polite" className="text-sm">
                  {status === "sent" ? (
                    <span className="text-secondary">Thank you - the office will be in touch.</span>
                  ) : status === "error" ? (
                    <span className="text-destructive">{message || "Something went wrong."}</span>
                  ) : null}
                </p>
              </div>
            </form>
          </div>

          <aside className="rounded-2xl border bg-muted/40 p-6">
            <h2 className="text-lg font-semibold">School office</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="font-medium">Address</dt>
                <dd className="text-muted-foreground">{siteConfig.contact.addressLines.join(", ")}</dd>
              </div>
              <div>
                <dt className="font-medium">Phone</dt>
                <dd className="text-muted-foreground">{siteConfig.contact.phone}</dd>
              </div>
              <div>
                <dt className="font-medium">Email</dt>
                <dd className="text-muted-foreground">{siteConfig.contact.email}</dd>
              </div>
            </dl>
            <div className="mt-6">
              <PlaceholderNote>
                Real address, phone number, email and office hours must be provided by the school.
              </PlaceholderNote>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
