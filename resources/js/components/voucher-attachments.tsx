import { router } from '@inertiajs/react';
import { Download, Loader2, Paperclip, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import documents from '@/routes/documents';

export type Attachment = {
    id: string;
    name: string;
    size: number;
    created_at: string;
    uploader: { id: string; name: string } | null;
    can_delete: boolean;
};

const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Supporting evidence for a voucher — the invoice, receipt or contract that
 * justifies the payment. Attached here rather than on a separate page so the
 * document and the voucher it belongs to are never separated.
 */
export default function VoucherAttachments({
    voucherId,
    attachments,
    canUpload,
}: {
    voucherId: string;
    attachments: Attachment[];
    canUpload: boolean;
}) {
    const input = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const upload = (file: File) => {
        setUploading(true);
        setError(null);

        router.post(
            documents.store(voucherId).url,
            { file },
            {
                forceFormData: true,
                preserveScroll: true,
                onError: (errors) =>
                    setError(errors.file ?? 'The file could not be attached.'),
                onFinish: () => {
                    setUploading(false);
                    if (input.current) input.current.value = '';
                },
            },
        );
    };

    const [removing, setRemoving] = useState<Attachment | null>(null);
    const [deleting, setDeleting] = useState(false);

    const remove = () => {
        if (!removing) return;

        setDeleting(true);
        router.delete(documents.destroy(removing.id).url, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setRemoving(null);
            },
        });
    };

    return (
        <section className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                    Supporting documents
                </h2>
                {canUpload && (
                    <>
                        <input
                            ref={input}
                            type="file"
                            className="sr-only"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) upload(file);
                            }}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            disabled={uploading}
                            onClick={() => input.current?.click()}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Attaching
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4" />
                                    Attach a file
                                </>
                            )}
                        </Button>
                    </>
                )}
            </div>

            {error && (
                <p className="text-sm text-destructive" role="alert">
                    {error}
                </p>
            )}

            {attachments.length === 0 ? (
                <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                    No documents attached yet. Attach the invoice or receipt
                    that supports this payment.
                </p>
            ) : (
                <ul className="divide-y divide-border rounded-md border border-border">
                    {attachments.map((attachment) => (
                        <li
                            key={attachment.id}
                            className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5"
                        >
                            <div className="flex min-w-0 items-center gap-2.5">
                                <Paperclip
                                    className="h-4 w-4 shrink-0 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-black dark:text-white">
                                        {attachment.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatSize(attachment.size)}
                                        {attachment.uploader
                                            ? ` · ${attachment.uploader.name}`
                                            : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1.5"
                                    asChild
                                >
                                    <a
                                        href={
                                            documents.download(attachment.id)
                                                .url
                                        }
                                    >
                                        <Download className="h-4 w-4" />
                                        <span className="sr-only sm:not-sr-only">
                                            Download
                                        </span>
                                    </a>
                                </Button>
                                {attachment.can_delete && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() =>
                                            setRemoving(attachment)
                                        }
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">
                                            Remove {attachment.name}
                                        </span>
                                    </Button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <ConfirmDialog
                open={removing !== null}
                onOpenChange={(open) => !open && setRemoving(null)}
                title="Remove this document?"
                description={
                    removing
                        ? `"${removing.name}" will be deleted permanently. This cannot be undone.`
                        : undefined
                }
                confirmLabel="Remove"
                destructive
                processing={deleting}
                onConfirm={remove}
            />
        </section>
    );
}
