import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import TablePagination from '@/components/table-pagination';
import AppLayout from '@/layouts/app-layout';
import systemLogs from '@/routes/system-logs';
import type { BreadcrumbItem, Paginated } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Audit log', href: systemLogs.index().url },
];

type Log = {
    id: string;
    action: string;
    description: string;
    ip_address: string | null;
    created_at: string;
    created_at_label: string;
    user: { id: string; name: string } | null;
};

type Props = {
    logs: Paginated<Log>;
    actions: string[];
    filters: { search?: string; action?: string };
};

export default function SystemLogsIndex({ logs, actions, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search ?? '');
    const [actionFilter, setActionFilter] = useState(filters.action ?? 'all');
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (timer.current) clearTimeout(timer.current);
        },
        [],
    );

    const items = logs.data ?? [];
    const isFiltered = Boolean(filters.search || filters.action);

    const applyFilters = (search: string, action: string) => {
        router.get(
            systemLogs.index().url,
            {
                search: search || undefined,
                action: action === 'all' ? undefined : action,
            },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit log" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4 md:p-6">
                <header>
                    <h1 className="text-2xl font-semibold text-black md:text-3xl dark:text-white">
                        Audit log
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Every recorded action, newest first. Entries cannot be
                        edited or deleted.
                    </p>
                </header>

                <Card className="py-5">
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <CardDescription>
                                {logs.total} entr
                                {logs.total !== 1 ? 'ies' : 'y'}
                                {isFiltered ? ' (filtered)' : ''}
                            </CardDescription>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search description or user..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setSearchQuery(value);
                                            if (timer.current)
                                                clearTimeout(timer.current);
                                            timer.current = setTimeout(
                                                () =>
                                                    applyFilters(
                                                        value,
                                                        actionFilter,
                                                    ),
                                                300,
                                            );
                                        }}
                                        className="pl-9"
                                    />
                                </div>
                                <Select
                                    value={actionFilter}
                                    onValueChange={(v) => {
                                        setActionFilter(v);
                                        applyFilters(searchQuery, v);
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[200px]">
                                        <SelectValue placeholder="Action" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All actions
                                        </SelectItem>
                                        {actions.map((action) => (
                                            <SelectItem
                                                key={action}
                                                value={action}
                                            >
                                                {action}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {items.length === 0 ? (
                            <div className="py-10 text-center">
                                <p className="text-sm font-medium text-black dark:text-white">
                                    {isFiltered
                                        ? 'No entries match your filters'
                                        : 'No activity recorded yet'}
                                </p>
                                {isFiltered && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setActionFilter('all');
                                            applyFilters('', 'all');
                                        }}
                                    >
                                        Clear filters
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
                                                    When
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Action
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Description
                                                </th>
                                                <th className="hidden px-4 py-3 text-left text-sm font-semibold text-black sm:table-cell dark:text-white">
                                                    User
                                                </th>
                                                <th className="hidden px-4 py-3 text-left text-sm font-semibold text-black lg:table-cell dark:text-white">
                                                    IP
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((log) => (
                                                <tr
                                                    key={log.id}
                                                    className="border-b border-border transition-colors hover:bg-muted/50"
                                                >
                                                    <td className="px-4 py-3 text-sm whitespace-nowrap text-muted-foreground">
                                                        {log.created_at_label}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <Badge
                                                            variant="outline"
                                                            className="font-mono text-xs"
                                                        >
                                                            {log.action}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-black dark:text-white">
                                                        {log.description}
                                                    </td>
                                                    <td className="hidden px-4 py-3 text-sm whitespace-nowrap text-muted-foreground sm:table-cell">
                                                        {log.user?.name ??
                                                            'System'}
                                                    </td>
                                                    <td className="hidden px-4 py-3 font-mono text-sm text-muted-foreground lg:table-cell">
                                                        {log.ip_address ?? '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <TablePagination page={logs} />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
