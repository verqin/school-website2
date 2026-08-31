import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, FileUp, Trash2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  applicationDocumentsQuery,
  deleteApplicationDocument,
  documentRequestsQuery,
  requirementsFor,
  requirementsQuery,
  signedDocumentUrl,
  uploadApplicationDocument,
  validateFile,
  type ApplicationDocument,
} from "@/lib/admissions";

const STATUS_META = {
  pending: { label: "Awaiting verification", icon: Clock },
  verified: { label: "Verified", icon: CheckCircle2 },
  rejected: { label: "Rejected", icon: XCircle },
} as const;

export function DocumentsPanel({
  applicationId,
  userId,
  periodId,
  gradeLevelId,
  canUpload,
}: {
  applicationId: string;
  userId: string;
  periodId: string | null;
  gradeLevelId: string | null;
  canUpload: boolean;
}) {
  const queryClient = useQueryClient();
  const documents = useQuery(applicationDocumentsQuery(applicationId));
  const requirements = useQuery(requirementsQuery());
  const requests = useQuery(documentRequestsQuery(applicationId));
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const applicable = requirementsFor(requirements.data ?? [], periodId, gradeLevelId).filter(
    (r) => r.requires_document,
  );

  async function handleFile(file: File | undefined, requirementId: string | null, docType: string) {
    if (!file) return;
    const problem = validateFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setBusyKey(docType);
    try {
      await uploadApplicationDocument({ userId, applicationId, requirementId, docType, file });
      await queryClient.invalidateQueries({ queryKey: ["applications", "documents", applicationId] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusyKey(null);
    }
  }

  async function openDocument(doc: ApplicationDocument) {
    try {
      const url = await signedDocumentUrl(doc.storage_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open this file.");
    }
  }

  if (documents.isLoading || requirements.isLoading) {
    return <Skeleton className="h-40 w-full rounded-xl" />;
  }

  const docsFor = (code: string) => (documents.data ?? []).filter((d) => d.doc_type === code);
  const other = (documents.data ?? []).filter(
    (d) => !applicable.some((r) => r.code === d.doc_type),
  );

  return (
    <div className="grid gap-6">
      {(requests.data ?? []).filter((r) => !r.resolved_at).length ? (
        <div className="rounded-xl border border-gold/40 bg-gold/5 p-4">
          <h3 className="font-semibold">Documents requested by the admissions office</h3>
          <ul className="mt-2 grid gap-2 text-sm">
            {(requests.data ?? [])
              .filter((r) => !r.resolved_at)
              .map((r) => (
                <li key={r.id}>
                  <span className="font-medium">{r.label}</span>
                  {r.message ? <span className="text-muted-foreground"> - {r.message}</span> : null}
                </li>
              ))}
          </ul>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <ul className="grid gap-4">
        {applicable.map((requirement) => {
          const files = docsFor(requirement.code);
          return (
            <li key={requirement.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {requirement.label}
                    {requirement.is_mandatory ? (
                      <span className="ml-2 text-xs font-normal text-destructive">Required</span>
                    ) : (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">Optional</span>
                    )}
                  </p>
                  {requirement.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">{requirement.description}</p>
                  ) : null}
                </div>
                {canUpload ? (
                  <div>
                    <input
                      ref={(el) => {
                        inputs.current[requirement.code] = el;
                      }}
                      id={`file-${requirement.code}`}
                      type="file"
                      className="sr-only"
                      accept=".pdf,image/jpeg,image/png,image/webp"
                      onChange={(event) => {
                        void handleFile(event.target.files?.[0], requirement.id, requirement.code);
                        event.target.value = "";
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyKey === requirement.code}
                      onClick={() => inputs.current[requirement.code]?.click()}
                    >
                      <FileUp className="size-4" aria-hidden="true" />
                      {busyKey === requirement.code ? "Uploading…" : "Upload"}
                    </Button>
                  </div>
                ) : null}
              </div>
              {files.length ? (
                <ul className="mt-3 grid gap-2">
                  {files.map((doc) => (
                    <DocumentRow
                      key={doc.id}
                      doc={doc}
                      canDelete={canUpload && doc.status !== "verified"}
                      onOpen={() => void openDocument(doc)}
                      onDelete={async () => {
                        await deleteApplicationDocument(doc);
                        await queryClient.invalidateQueries({
                          queryKey: ["applications", "documents", applicationId],
                        });
                      }}
                    />
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No file uploaded yet.</p>
              )}
            </li>
          );
        })}
      </ul>

      {other.length ? (
        <div className="rounded-xl border bg-card p-4">
          <p className="font-medium">Other uploads</p>
          <ul className="mt-3 grid gap-2">
            {other.map((doc) => (
              <DocumentRow
                key={doc.id}
                doc={doc}
                canDelete={canUpload && doc.status !== "verified"}
                onOpen={() => void openDocument(doc)}
                onDelete={async () => {
                  await deleteApplicationDocument(doc);
                  await queryClient.invalidateQueries({
                    queryKey: ["applications", "documents", applicationId],
                  });
                }}
              />
            ))}
          </ul>
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Accepted formats: PDF, JPEG, PNG or WebP, up to 10 MB each. Files are stored privately and only visible to
        you and the admissions office.
      </p>
    </div>
  );
}

function DocumentRow({
  doc,
  canDelete,
  onOpen,
  onDelete,
}: {
  doc: ApplicationDocument;
  canDelete: boolean;
  onOpen: () => void;
  onDelete: () => Promise<void>;
}) {
  const meta = STATUS_META[doc.status];
  const Icon = meta.icon;
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2">
      <div className="min-w-0">
        <button type="button" onClick={onOpen} className="truncate text-sm underline-offset-4 hover:underline">
          {doc.file_name}
        </button>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <Icon className="size-3.5" aria-hidden="true" />
          {meta.label}
          {doc.status === "rejected" && doc.rejection_reason ? ` - ${doc.rejection_reason}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={doc.status === "verified" ? "default" : "secondary"}>{doc.status}</Badge>
        {canDelete ? (
          <Button size="sm" variant="ghost" onClick={() => void onDelete()} aria-label={`Remove ${doc.file_name}`}>
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </li>
  );
}
