import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MediaFrame, PageHero, Section } from "@/components/site/primitives";
import { CardSkeletonGrid, EmptyState, ErrorState } from "@/components/site/states";
import { staffQuery } from "@/lib/content";

const title = "Staff & Faculty";
const description = "Meet the leadership team, teachers and support staff of Sample1 School.";

export const Route = createFileRoute("/_public/staff")({
  head: () => ({
    meta: [
      { title: `${title} - Sample1 School` },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: StaffPage,
});

function StaffPage() {
  const staff = useQuery(staffQuery());

  return (
    <>
      <PageHero eyebrow="Our people" title={title} description={description} />
      <Section>
        {staff.isPending ? (
          <CardSkeletonGrid count={6} />
        ) : staff.isError ? (
          <ErrorState onRetry={() => staff.refetch()} />
        ) : staff.data.length === 0 ? (
          <EmptyState
            title="No staff profiles published yet"
            description="Add staff members with name, role, department, photo and bio in the admin area."
          />
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {staff.data.map((member) => (
              <li key={member.id} className="overflow-hidden rounded-xl border bg-card">
                <MediaFrame src={member.photo_url} alt={member.full_name} ratio="aspect-[4/3]" />
                <div className="p-5">
                  <h2 className="text-lg font-semibold">{member.full_name}</h2>
                  <p className="mt-1 text-sm font-medium text-secondary">
                    {member.role_title ?? "Role to be confirmed"}
                  </p>
                  {member.bio ? (
                    <p className="mt-3 line-clamp-4 text-sm text-muted-foreground">{member.bio}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
