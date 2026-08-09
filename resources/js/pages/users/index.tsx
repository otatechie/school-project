import {Head, Link, router } from '@inertiajs/react';
import { Plus, Search, UserCog } from 'lucide-react';
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
import FlashMessages from '@/components/flash-messages';
import TablePagination from '@/components/table-pagination';
import AppLayout from '@/layouts/app-layout';
import users from '@/routes/users';
import type { BreadcrumbItem, Paginated } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: users.index().url },
];

type User = {
    id: string;
    name: string;
    email: string;
    staff_id: string | null;
    position: string | null;
    role: string;
    is_active: boolean;
    department: { id: string; name: string } | null;
};

type Props = {
    users: Paginated<User>;
    roles: Record<string, string>;
    stats: { total: number; active: number; inactive: number };
    filters: { search?: string; role?: string };
};

export default function UsersIndex({
    users: data,
    roles,
    stats,
    filters,
}: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search ?? '');
    const [roleFilter, setRoleFilter] = useState(filters.role ?? 'all');
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (timer.current) clearTimeout(timer.current);
        },
        [],
    );

    const items = data.data ?? [];
    const isFiltered = Boolean(filters.search || filters.role);

    const applyFilters = (search: string, role: string) => {
        router.get(
            users.index().url,
            {
                search: search || undefined,
                role: role === 'all' ? undefined : role,
            },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4 md:p-6">
                <FlashMessages />

                <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-black md:text-3xl dark:text-white">
                            Users
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {stats.total} total &middot; {stats.active} active
                            {stats.inactive > 0
                                ? ` · ${stats.inactive} inactive`
                                : ''}
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={users.create().url} className="gap-2">
                            <Plus className="h-4 w-4" />
                            <span>Add user</span>
                        </Link>
                    </Button>
                </header>

                <Card className="py-5">
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <CardDescription>
                                {data.total} user{data.total !== 1 ? 's' : ''}
                                {isFiltered ? ' (filtered)' : ''}
                            </CardDescription>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search name, email or staff ID..."
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
                                                        roleFilter,
                                                    ),
                                                300,
                                            );
                                        }}
                                        className="pl-9"
                                    />
                                </div>
                                <Select
                                    value={roleFilter}
                                    onValueChange={(v) => {
                                        setRoleFilter(v);
                                        applyFilters(searchQuery, v);
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All roles
                                        </SelectItem>
                                        {Object.entries(roles).map(
                                            ([key, label]) => (
                                                <SelectItem
                                                    key={key}
                                                    value={key}
                                                >
                                                    {label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {items.length === 0 ? (
                            <div className="py-10 text-center">
                                <UserCog
                                    className="mx-auto mb-3 h-10 w-10 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <p className="text-sm font-medium text-black dark:text-white">
                                    No users match your filters
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-3"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setRoleFilter('all');
                                        applyFilters('', 'all');
                                    }}
                                >
                                    Clear filters
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/30">
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Name
                                                </th>
                                                <th className="hidden sm:table-cell px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">Staff ID</th>
                                                <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">Department</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Role
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((user) => (
                                                <tr
                                                    key={user.id}
                                                    className="border-b border-border transition-colors hover:bg-muted/50"
                                                >
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-black dark:text-white">
                                                            {user.name}
                                                        </span>
                                                        <span className="block text-sm text-muted-foreground">
                                                            {user.email}
                                                        </span>
                                                    </td>
                                                    <td className="hidden sm:table-cell px-4 py-3 font-mono text-sm whitespace-nowrap text-muted-foreground">
                                                        {user.staff_id ?? '—'}
                                                    </td>
                                                    <td className="hidden md:table-cell px-4 py-3 text-sm whitespace-nowrap text-muted-foreground">
                                                        {user.department
                                                            ?.name ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm whitespace-nowrap text-black dark:text-white">
                                                        {roles[user.role] ??
                                                            user.role}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge
                                                            variant={
                                                                user.is_active
                                                                    ? 'secondary'
                                                                    : 'outline'
                                                            }
                                                        >
                                                            {user.is_active
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
                                                                    users.edit(
                                                                        user.id,
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
