import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import rolesPermissions from '@/routes/roles-permissions';
import type { BreadcrumbItem } from '@/types';

// Mock data for UI design; replace with props when wired to backend.
const mockRoles: Record<
    string,
    { id: string; name: string; description: string }
> = {
    '1': {
        id: '1',
        name: 'Administrator',
        description: 'Full system access',
    },
    '2': {
        id: '2',
        name: 'Finance Manager',
        description: 'Manage vouchers, approvals, and reports',
    },
    '3': {
        id: '3',
        name: 'Approver',
        description: 'Approve payment vouchers within limit',
    },
    '4': {
        id: '4',
        name: 'Accountant',
        description: 'Create and edit vouchers, view reports',
    },
    '5': {
        id: '5',
        name: 'Viewer',
        description: 'Read-only access to documents and reports',
    },
};

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

// Which permissions each role has (mock); Administrator has all.
const mockRolePermissionIds: Record<string, string[]> = {
    '1': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    '2': ['1', '2', '3', '4', '5', '6', '10'],
    '3': ['1', '3', '6', '10'],
    '4': ['1', '2', '4', '5', '6', '10'],
    '5': ['1', '4', '6', '10'],
};

const permissionsByGroup = mockPermissions.reduce<Record<string, typeof mockPermissions>>(
    (acc, perm) => {
        if (!acc[perm.group]) acc[perm.group] = [];
        acc[perm.group].push(perm);
        return acc;
    },
    {}
);
const groupOrder = ['Payment Vouchers', 'Memos', 'Reports', 'General Ledger', 'Administration'];

export default function Edit({ id }: { id: string }) {
    const role = mockRoles[id] ?? mockRoles['1'];
    const initialSelected = new Set(mockRolePermissionIds[id] ?? mockRolePermissionIds['1']);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(initialSelected);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Roles & Permissions', href: rolesPermissions.index().url },
        { title: role.name, href: '#' },
    ];

    const togglePermission = (permId: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(permId)) next.delete(permId);
            else next.add(permId);
            return next;
        });
    };

    const handleSelectAllInGroup = (group: string, checked: boolean) => {
        const perms = permissionsByGroup[group] ?? [];
        setSelectedIds((prev) => {
            const next = new Set(prev);
            perms.forEach((p) => (checked ? next.add(p.id) : next.delete(p.id)));
            return next;
        });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSuccessMessage('');
        // UI only: simulate save; replace with real submit when backend is ready.
        setTimeout(() => {
            setIsSubmitting(false);
            setSuccessMessage('Permissions updated successfully.');
        }, 600);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Assign permissions: ${role.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <header className="space-y-4">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href={rolesPermissions.index().url} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Roles & Permissions</span>
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-semibold text-black dark:text-white">
                            Assign permissions to role
                        </h1>
                        <p className="mt-1 text-base text-muted-foreground">
                            Choose which permissions the role &quot;{role.name}&quot; has. Users with this role will inherit these permissions.
                        </p>
                    </div>

                    <Card className="border-primary/20 bg-muted/20">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-black dark:text-white">
                                        {role.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {role.description}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <KeyRound className="h-4 w-4" />
                            Permissions for this role
                        </CardTitle>
                        <CardDescription>
                            Check the permissions that this role should have. Users assigned this role will receive these permissions.
                        </CardDescription>
                        <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
                            {selectedIds.size} of {mockPermissions.length} permissions selected
                        </p>
                    </CardHeader>
                    <CardContent>
                        {successMessage && (
                            <div
                                className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-200"
                                role="status"
                                aria-live="polite"
                            >
                                {successMessage}
                            </div>
                        )}
                        <form onSubmit={handleSave} className="space-y-6">
                            {groupOrder.map((group) => {
                                const perms = permissionsByGroup[group];
                                if (!perms?.length) return null;
                                const allChecked = perms.every((p) => selectedIds.has(p.id));
                                return (
                                    <div key={group}>
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-semibold text-black dark:text-white">
                                                {group}
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`group-${group}`}
                                                    checked={allChecked}
                                                    onCheckedChange={(checked) =>
                                                        handleSelectAllInGroup(group, checked === true)
                                                    }
                                                    disabled={isSubmitting}
                                                />
                                                <Label
                                                    htmlFor={`group-${group}`}
                                                    className="cursor-pointer text-sm text-muted-foreground"
                                                >
                                                    Select all
                                                </Label>
                                            </div>
                                        </div>
                                        <ul className="mt-2 space-y-2 rounded-md border border-border bg-muted/20 p-3">
                                            {perms.map((perm) => (
                                                <li
                                                    key={perm.id}
                                                    className="flex items-start gap-3 rounded p-2 hover:bg-muted/40"
                                                >
                                                    <Checkbox
                                                        id={perm.id}
                                                        checked={selectedIds.has(perm.id)}
                                                        onCheckedChange={() =>
                                                            togglePermission(perm.id)
                                                        }
                                                        disabled={isSubmitting}
                                                        className="mt-0.5"
                                                    />
                                                    <div className="flex-1">
                                                        <Label
                                                            htmlFor={perm.id}
                                                            className="cursor-pointer font-mono text-sm font-medium text-black dark:text-white"
                                                        >
                                                            {perm.name}
                                                        </Label>
                                                        <p className="mt-0.5 text-sm text-muted-foreground">
                                                            {perm.description}
                                                        </p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}

                            <Separator />

                            <div className="flex items-center justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                    disabled={isSubmitting}
                                >
                                    <Link href={rolesPermissions.index().url}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save permissions'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
