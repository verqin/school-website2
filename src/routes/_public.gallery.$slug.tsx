import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MediaFrame, PageHero, Section } from "@/components/site/primitives";
import { CardSkeletonGrid, EmptyState, ErrorState } from "@/components/site/states";
import { albumWithImagesQuery } from "@/lib/content";

export const Route = createFileRoute("/_public/gallery/$slug")({
  head: () => ({
    meta: [
      { title: "Album - Sample1 School" },
      { name: "description", content: "Photographs from school life at Sample1 School." },
      { property: "og:title", content: "Album - Sample1 School" },
      { property: "og:description", content: "Photographs from school life at Sample1 School." },
    ],
  }),
  component: AlbumPage,
});

function AlbumPage() {
  const { slug } = Route.useParams();
  const album = useQuery(albumWithImagesQuery(slug));

  if (album.isPending) {
    return (
      <Section>
        <CardSkeletonGrid count={6} />
      </Section>
    );
  }

  if (album.isError) {
    return (
      <Section>
        <ErrorState onRetry={() => album.refetch()} />
      </Section>
    );
  }

  if (!album.data) {
    return (
      <Section>
        <EmptyState
          title="Album not found"
          description="This album may have been unpublished or the link is incorrect."
          action={
            <Button asChild variant="outline">
              <Link to="/gallery">Back to gallery</Link>
            </Button>
          }
        />
      </Section>
    );
  }

  const { album: info, images } = album.data;

  return (
    <>
      <PageHero eyebrow="Gallery" title={info.title} description={info.description ?? undefined} />
      <Section>
        {images.length === 0 ? (
          <EmptyState title="No images yet" description="Images uploaded to this album will appear here." />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <li key={image.id} className="overflow-hidden rounded-xl border bg-card">
                <MediaFrame src={image.image_url} alt={image.caption ?? info.title} ratio="aspect-[4/3]" />
                {image.caption ? <p className="p-4 text-sm text-muted-foreground">{image.caption}</p> : null}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-10">
          <Button asChild variant="outline">
            <Link to="/gallery">Back to gallery</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
