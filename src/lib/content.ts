import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];
export type NewsPost = Tables["news_posts"]["Row"];
export type SchoolEvent = Tables["events"]["Row"];
export type GalleryAlbum = Tables["gallery_albums"]["Row"];
export type GalleryImage = Tables["gallery_images"]["Row"];
export type StaffMember = Tables["staff_members"]["Row"];
export type Program = Tables["programs"]["Row"];
export type Announcement = Tables["announcements"]["Row"];
export type PageContent = Tables["pages"]["Row"];

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return (result.data ?? []) as T;
}

export const newsListQuery = (limit?: number) =>
  queryOptions({
    queryKey: ["news", limit ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("news_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (limit) q = q.limit(limit);
      return unwrap<NewsPost[]>(await q);
    },
  });

export const newsPostQuery = (slug: string) =>
  queryOptions({
    queryKey: ["news", "detail", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as NewsPost | null;
    },
  });

export const eventsListQuery = (opts?: { upcomingOnly?: boolean; limit?: number }) =>
  queryOptions({
    queryKey: ["events", opts?.upcomingOnly ?? false, opts?.limit ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("events")
        .select("*")
        .eq("is_published", true)
        .order("starts_at", { ascending: true });
      if (opts?.upcomingOnly) q = q.gte("starts_at", new Date().toISOString());
      if (opts?.limit) q = q.limit(opts.limit);
      return unwrap<SchoolEvent[]>(await q);
    },
  });

export const eventQuery = (slug: string) =>
  queryOptions({
    queryKey: ["events", "detail", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as SchoolEvent | null;
    },
  });

export const albumsQuery = () =>
  queryOptions({
    queryKey: ["albums"],
    queryFn: async () =>
      unwrap<GalleryAlbum[]>(
        await supabase
          .from("gallery_albums")
          .select("*")
          .eq("is_published", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false }),
      ),
  });

export const albumWithImagesQuery = (slug: string) =>
  queryOptions({
    queryKey: ["albums", "detail", slug],
    queryFn: async () => {
      const { data: album, error } = await supabase
        .from("gallery_albums")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!album) return null;
      const images = unwrap<GalleryImage[]>(
        await supabase
          .from("gallery_images")
          .select("*")
          .eq("album_id", album.id)
          .order("sort_order", { ascending: true }),
      );
      return { album: album as GalleryAlbum, images };
    },
  });

export const staffQuery = () =>
  queryOptions({
    queryKey: ["staff"],
    queryFn: async () =>
      unwrap<StaffMember[]>(
        await supabase
          .from("staff_members")
          .select("*")
          .eq("is_published", true)
          .order("sort_order", { ascending: true })
          .order("full_name", { ascending: true }),
      ),
  });

export const programsQuery = () =>
  queryOptions({
    queryKey: ["programs"],
    queryFn: async () =>
      unwrap<Program[]>(
        await supabase
          .from("programs")
          .select("*")
          .eq("is_published", true)
          .order("sort_order", { ascending: true }),
      ),
  });

export const announcementsQuery = () =>
  queryOptions({
    queryKey: ["announcements"],
    queryFn: async () => {
      const nowIso = new Date().toISOString();
      return unwrap<Announcement[]>(
        await supabase
          .from("announcements")
          .select("*")
          .eq("is_active", true)
          .lte("starts_at", nowIso)
          .order("created_at", { ascending: false }),
      );
    },
  });

export const pageQuery = (slug: string) =>
  queryOptions({
    queryKey: ["pages", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as PageContent | null;
    },
  });

export function formatDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
