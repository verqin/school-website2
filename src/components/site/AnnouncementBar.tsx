import { useQuery } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";
import { announcementsQuery } from "@/lib/content";

export function AnnouncementBar() {
  const { data } = useQuery(announcementsQuery());
  const active = (data ?? []).filter((a) => !a.ends_at || new Date(a.ends_at) > new Date());
  const announcement = active[0];
  if (!announcement) return null;

  return (
    <div className="bg-forest text-secondary-foreground">
      <div className="container-page flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm">
        <Megaphone className="size-4 shrink-0" aria-hidden="true" />
        <p className="font-medium">{announcement.message}</p>
        {announcement.link_url ? (
          <a
            href={announcement.link_url}
            className="underline underline-offset-4 hover:no-underline"
          >
            Learn more
          </a>
        ) : null}
      </div>
    </div>
  );
}
