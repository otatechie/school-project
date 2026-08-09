import { Head, Link } from '@inertiajs/react';
import { Check, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import rolesPermissions from '@/routes/roles-permissions';
import users from '@/routes/users';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Roles', href: rolesPermissions.index().url },
];

type Holder = {
    id: string;
    name: string;
    department: string | null;
    is_active: boolean;
    limit: string | null;
};

type Role = {
    key: string;
    label: string;
    abilities: string[];
    holders: Holder[];
};

type Props = {
    roles: Role[];
    canManageStaff: boolean;
};

export default function RolesPermissions({ roles, canManageStaff }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-black md:text-3xl dark:text-white">
                            Roles
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            What each role may do, and who holds it. Roles are
                            fixed in the system and checked on every action.
                        </p>
                    </div>
                    {canManageStaff && (
                        <Button variant="outline" asChild>
                            <Link href={users.index().url} className="gap-2">
                                <Users className="h-4 w-4" />
                                Manage staff
                            </Link>
                        </Button>
                    )}
                </header>

                <div className="grid gap-4 lg:grid-cols-2">
                    {roles.map((role) => (
                        <Card key={role.key} className="py-5">
                            <CardContent className="space-y-4">
                                <div>
                                    <h2 className="text-base font-semibold text-black dark:text-white">
                                        {role.label}
                                    </h2>
                                    <ul className="mt-2 space-y-1.5">
                                        {role.abilities.map((ability) => (
                                            <li
                                                key={ability}
                                                className="flex items-start gap-2 text-sm text-muted-foreground"
                                            >
                                                <Check
                                                    className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400"
                                                    aria-hidden="true"
                                                />
                                                {ability}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="border-t border-border pt-3">
                                    {role.holders.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            Nobody currently holds this role.
                                        </p>
                                    ) : (
                                        <ul className="space-y-1.5">
                                            {role.holders.map((holder) => (
                                                <li
                                                    key={holder.id}
                                                    className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-sm"
                                                >
                                                    <span className="text-black dark:text-white">
                                                        {holder.name}
                                                        {!holder.is_active && (
                                                            <span className="ml-2 text-xs text-muted-foreground">
                                                                (deactivated)
                                                            </span>
                                                        )}
                                                    </span>
                                                    {/* Only approvers carry a
                                                        ceiling, so it appears
                                                        only where it applies. */}
                                                    <span className="text-xs text-muted-foreground tabular-nums">
                                                        {holder.limit
                                                            ? `up to ${holder.limit}`
                                                            : (holder.department ??
                                                              '')}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
