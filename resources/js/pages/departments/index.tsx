import { Head, Link, router, usePage } from '@inertiajs/react';
import { Building2, Plus, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import FlashMessages from '@/components/flash-messages';
import AppLayout from '@/layouts/app-layout';
import departments from '@/routes/departments';
import TablePagination from '@/components/table-pagination';
import type { BreadcrumbItem, Paginated, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Departments', href: departments.index().url },
];

type Department = {
    id: string;
    name: string;
    code: string;
    is_active: boolean;
    users_count: number;
    payment_vouchers_count: number;
};

type Props = {
    departments: Paginated<Department>;
    stats: { total: number; active: number };
    filters: { search?: string };
};

export default function DepartmentsIndex({
    departments: data,
    stats,
    filters,
}: Props) {
    const { auth } = usePage<SharedData>().props;
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
            departments.index().url,
            { search: search || undefined },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Departments" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4 md:p-6">
                <FlashMessages />

                <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-black md:text-3xl dark:text-white">
                            Departments
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {stats.total} total &middot; {stats.active} active
                        </p>
                    </div>
                    {auth.can?.manageDepartments && (
                        <Button asChild>
                            <Link
                                href={departments.create().url}
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                <span>New department</span>
                            </Link>
                        </Button>
                    )}
                </header>

                <Card className="py-5">
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <CardDescription>
                                {data.total} department
                                {data.total !== 1 ? 's' : ''}
                                {isFiltered ? ' (filtered)' : ''}
                            </CardDescription>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by name or code..."
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
                                <Building2
                                    className="mx-auto mb-3 h-10 w-10 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <p className="text-sm font-medium text-black dark:text-white">
                                    {isFiltered
                                        ? 'No departments match your search'
                                        : 'No departments yet'}
                                </p>
                                {isFiltered ? (
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
                                ) : (
                                    <Button asChild size="sm" className="mt-3">
                                        <Link href={departments.create().url}>
                                            New department
                                        </Link>
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
                                                    Department
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Code
                                                </th>
                                                <th className="hidden px-4 py-3 text-right text-sm font-semibold text-black sm:table-cell dark:text-white">
                                                    Staff
                                                </th>
                                                <th className="hidden px-4 py-3 text-right text-sm font-semibold text-black sm:table-cell dark:text-white">
                                                    Vouchers
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                                                    <span className="sr-only">
                                                        Actions
                                                    </span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((dept) => (
                                                <tr
                                                    key={dept.id}
                                                    className="border-b border-border transition-colors hover:bg-muted/50"
                                                >
                                                    <td className="px-4 py-3 text-sm text-black dark:text-white">
                                                        {dept.name}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <code className="rounded-md bg-muted px-2 py-1 font-mono text-sm font-medium text-muted-foreground">
                                                            {dept.code}
                                                        </code>
                                                    </td>
                                                    <td className="hidden px-4 py-3 text-right text-sm text-muted-foreground tabular-nums sm:table-cell">
                                                        {dept.users_count}
                                                    </td>
                                                    <td className="hidden px-4 py-3 text-right text-sm text-muted-foreground tabular-nums sm:table-cell">
                                                        {
                                                            dept.payment_vouchers_count
                                                        }
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge
                                                            variant={
                                                                dept.is_active
                                                                    ? 'secondary'
                                                                    : 'outline'
                                                            }
                                                        >
                                                            {dept.is_active
                                                                ? 'Active'
                                                                : 'Inactive'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={
                                                                    departments.edit(
                                                                        dept.id,
                                                                    ).url
                                                                }
                                                            >
                                                                Edit
                                                            </Link>
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
