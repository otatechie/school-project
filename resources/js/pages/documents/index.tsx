import { Head, router } from '@inertiajs/react';
import { Download, Paperclip, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import TablePagination from '@/components/table-pagination';
import AppLayout from '@/layouts/app-layout';
import documents from '@/routes/documents';
import type { BreadcrumbItem, Paginated } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Supporting documents', href: documents.index().url },
];

type Document = {
    id: string;
    name: string;
    mime_type: string | null;
    size: number;
    created_at: string;
    created_at_label: string;
    uploader: { id: string; name: string } | null;
    documentable: { voucher_number?: string; memo_number?: string } | null;
};

type Props = {
    documents: Paginated<Document>;
    filters: { search?: string };
};

const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function DocumentsIndex({ documents: data, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search ?? '');
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (timer.current) clearTimeout(timer.current);
        },
        [],
    );

    const items = data.data ?? [];
    const isFiltered = Boolean(filters.search);

    const applySearch = (search: string) => {
        router.get(
            documents.index().url,
            { search: search || undefined },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Supporting documents" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">
                <header>
                    <h1 className="text-2xl font-semibold text-black md:text-3xl dark:text-white">
                        Supporting documents
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Invoices, receipts and contracts attached to payment
                        vouchers. Attach a file from the voucher it belongs to.
                    </p>
                </header>

                <Card className="py-5">
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <CardDescription>
                                {data.total} document
                                {data.total !== 1 ? 's' : ''}
                                {isFiltered ? ' matching your search' : ''}
                            </CardDescription>
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by file name..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearchQuery(value);
                                        if (timer.current)
                                            clearTimeout(timer.current);
                                        timer.current = setTimeout(
                                            () => applySearch(value),
                                            300,
                                        );
                                    }}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        {items.length === 0 ? (
                            <div className="py-10 text-center">
                                <Paperclip
                                    className="mx-auto mb-3 h-10 w-10 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <p className="text-sm font-medium text-black dark:text-white">
                                    {isFiltered
                                        ? 'No documents match your search'
                                        : 'No documents attached yet'}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {isFiltered
                                        ? 'Try a different file name.'
                                        : 'Open a voucher and use "Attach a file" to add its invoice or receipt.'}
                                </p>
                                {isFiltered && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3"
                                        onClick={() => {
                                            setSearchQuery('');
                                            applySearch('');
                                        }}
                                    >
                                        Clear search
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/30">
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    File
                                                </th>
                                                <th className="hidden px-4 py-3 text-left text-sm font-semibold text-black sm:table-cell dark:text-white">
                                                    Voucher
                                                </th>
                                                <th className="hidden px-4 py-3 text-left text-sm font-semibold text-black md:table-cell dark:text-white">
                                                    Attached by
                                                </th>
                                                <th className="hidden px-4 py-3 text-left text-sm font-semibold text-black md:table-cell dark:text-white">
                                                    Date
                                                </th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                                                    Size
                                                </th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                                                    <span className="sr-only">
                                                        Download
                                                    </span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((doc) => (
                                                <tr
                                                    key={doc.id}
                                                    className="border-b border-border transition-colors hover:bg-muted/50"
                                                >
                                                    <td className="px-4 py-3">
                                                        {/* The file name is the
                                                            link, so the whole row
                                                            needs no click target. */}
                                                        <a
                                                            href={
                                                                documents.download(
                                                                    doc.id,
                                                                ).url
                                                            }
                                                            className="flex items-center gap-2 text-sm font-medium text-black underline-offset-4 hover:underline dark:text-white"
                                                        >
                                                            <Paperclip
                                                                className="h-4 w-4 shrink-0 text-muted-foreground"
                                                                aria-hidden="true"
                                                            />
                                                            {doc.name}
                                                        </a>
                                                    </td>
                                                    <td className="hidden px-4 py-3 text-sm whitespace-nowrap text-muted-foreground sm:table-cell">
                                                        {doc.documentable
                                                            ?.voucher_number ??
                                                            doc.documentable
                                                                ?.memo_number ??
                                                            '—'}
                                                    </td>
                                                    <td className="hidden px-4 py-3 text-sm whitespace-nowrap text-muted-foreground md:table-cell">
                                                        {doc.uploader?.name ??
                                                            '—'}
                                                    </td>
                                                    <td className="hidden px-4 py-3 text-sm whitespace-nowrap text-muted-foreground md:table-cell">
                                                        {doc.created_at_label}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm whitespace-nowrap text-muted-foreground tabular-nums">
                                                        {formatSize(doc.size)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <a
                                                                href={
                                                                    documents.download(
                                                                        doc.id,
                                                                    ).url
                                                                }
                                                            >
                                                                <Download className="h-4 w-4" />
                                                                <span className="sr-only">
                                                                    Download{' '}
                                                                    {doc.name}
                                                                </span>
                                                            </a>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <TablePagination page={data} />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
