import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, KeyRound, Search, ShieldCheck, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import rolesPermissions from '@/routes/roles-permissions';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Roles & Permissions', href: rolesPermissions.index().url },
];

// Mock data for UI design
const mockRoles = [
    {
        id: '1',
        name: 'Administrator',
        description: 'Full system access',
        permissions_count: 24,
        users_count: 2,
    },
    {
        id: '2',
        name: 'Finance Manager',
        description: 'Manage vouchers, approvals, and reports',
        permissions_count: 12,
        users_count: 5,
    },
    {
        id: '3',
        name: 'Approver',
        description: 'Approve payment vouchers within limit',
        permissions_count: 6,
        users_count: 8,
    },
    {
        id: '4',
        name: 'Accountant',
        description: 'Create and edit vouchers, view reports',
        permissions_count: 8,
        users_count: 12,
    },
    {
        id: '5',
        name: 'Viewer',
        description: 'Read-only access to documents and reports',
        permissions_count: 4,
        users_count: 15,
    },
];

const mockPermissions = [
    { id: '1', name: 'vouchers.view', group: 'Payment Vouchers', description: 'View payment vouchers' },
    { id: '2', name: 'vouchers.create', group: 'Payment Vouchers', description: 'Create payment vouchers' },
    { id: '3', name: 'vouchers.approve', group: 'Payment Vouchers', description: 'Approve payment vouchers' },
    { id: '4', name: 'memos.view', group: 'Memos', description: 'View memos' },
    { id: '5', name: 'memos.create', group: 'Memos', description: 'Create and edit memos' },
    { id: '6', name: 'reports.view', group: 'Reports', description: 'View financial reports' },
    { id: '7', name: 'users.manage', group: 'Administration', description: 'Manage users' },
    { id: '8', name: 'roles.manage', group: 'Administration', description: 'Manage roles and permissions' },
    { id: '9', name: 'departments.manage', group: 'Administration', description: 'Manage departments' },
    { id: '10', name: 'ledgers.view', group: 'General Ledger', description: 'View ledger transactions' },
];

export default function Index() {
    const [roleSearch, setRoleSearch] = useState('');
    const [permissionSearch, setPermissionSearch] = useState('');

    const filteredRoles = mockRoles.filter(
        (role) =>
            role.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
            role.description.toLowerCase().includes(roleSearch.toLowerCase())
    );

    const filteredPermissions = mockPermissions.filter(
        (perm) =>
            perm.name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
            perm.group.toLowerCase().includes(permissionSearch.toLowerCase()) ||
            perm.description.toLowerCase().includes(permissionSearch.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles & Permissions" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <header className="space-y-4">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href={dashboard().url} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Dashboard</span>
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-semibold text-black dark:text-white">
                            Roles & Permissions
                        </h1>
                        <p className="mt-1 text-base text-muted-foreground">
                            Assign permissions to roles here; assign roles to users on the User edit page.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Total Roles
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {mockRoles.length}
                                        </p>
                                    </div>
                                    <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Total Permissions
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {mockPermissions.length}
                                        </p>
                                    </div>
                                    <KeyRound className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </header>

                <section aria-labelledby="roles-heading">
                    <Card>
                        <CardHeader>
                            <CardTitle
                                id="roles-heading"
                                className="flex items-center gap-2 text-base"
                            >
                                <ShieldCheck className="h-4 w-4" />
                                Roles
                            </CardTitle>
                            <CardDescription className="mt-1">
                                {filteredRoles.length} role
                                {filteredRoles.length !== 1 ? 's' : ''} shown
                                {roleSearch.trim() &&
                                    ` of ${mockRoles.length}`}
                            </CardDescription>
                            <div className="mt-4">
                                <div className="relative max-w-sm">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search roles..."
                                        value={roleSearch}
                                        onChange={(e) =>
                                            setRoleSearch(e.target.value)
                                        }
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {filteredRoles.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <ShieldCheck className="mb-3 h-12 w-12 text-muted-foreground" />
                                    <p className="text-sm font-medium text-black dark:text-white">
                                        No roles match your search
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Try a different search term.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/50">
                                                <th className="px-4 py-3 font-medium text-black dark:text-white">
                                                    Name
                                                </th>
                                                <th className="px-4 py-3 font-medium text-black dark:text-white">
                                                    Description
                                                </th>
                                                <th className="px-4 py-3 font-medium text-black dark:text-white text-right">
                                                    Permissions
                                                </th>
                                                <th className="px-4 py-3 font-medium text-black dark:text-white text-right">
                                                    Users
                                                </th>
                                                <th className="w-0 px-4 py-3 font-medium text-black dark:text-white">
                                                    <span className="sr-only">Actions</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredRoles.map((role) => (
                                                <tr
                                                    key={role.id}
                                                    className="border-b border-border transition-colors hover:bg-muted/30"
                                                >
                                                    <td className="px-4 py-3 font-medium text-black dark:text-white">
                                                        {role.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {role.description}
                                                    </td>
                                                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                                                        {role.permissions_count}
                                                    </td>
                                                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                                                        {role.users_count}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="gap-2"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={rolesPermissions.edit({ id: role.id }).url}
                                                                className="gap-2"
                                                            >
                                                                <Settings2 className="h-4 w-4" />
                                                                Assign permissions
                                                            </Link>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>

                <section aria-labelledby="permissions-heading">
                    <Card>
                        <CardHeader>
                            <CardTitle
                                id="permissions-heading"
                                className="flex items-center gap-2 text-base"
                            >
                                <KeyRound className="h-4 w-4" />
                                Permissions
                            </CardTitle>
                            <CardDescription className="mt-1">
                                {filteredPermissions.length} permission
                                {filteredPermissions.length !== 1 ? 's' : ''}{' '}
                                shown
                                {permissionSearch.trim() &&
                                    ` of ${mockPermissions.length}`}
                            </CardDescription>
                            <div className="mt-4">
                                <div className="relative max-w-sm">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search permissions..."
                                        value={permissionSearch}
                                        onChange={(e) =>
                                            setPermissionSearch(e.target.value)
                                        }
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {filteredPermissions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <KeyRound className="mb-3 h-12 w-12 text-muted-foreground" />
                                    <p className="text-sm font-medium text-black dark:text-white">
                                        No permissions match your search
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Try a different search term.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/50">
                                                <th className="px-4 py-3 font-medium text-black dark:text-white">
                                                    Permission
                                                </th>
                                                <th className="px-4 py-3 font-medium text-black dark:text-white">
                                                    Group
                                                </th>
                                                <th className="px-4 py-3 font-medium text-black dark:text-white">
                                                    Description
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredPermissions.map(
                                                (perm) => (
                                                    <tr
                                                        key={perm.id}
                                                        className="border-b border-border transition-colors hover:bg-muted/30"
                                                    >
                                                        <td className="px-4 py-3 font-mono text-sm text-black dark:text-white">
                                                            {perm.name}
                                                        </td>
                                                        <td className="px-4 py-3 text-muted-foreground">
                                                            {perm.group}
                                                        </td>
                                                        <td className="px-4 py-3 text-muted-foreground">
                                                            {perm.description}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>
            </div>
        </AppLayout>
    );
}
