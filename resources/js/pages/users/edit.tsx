import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import users from '@/routes/users';
import type { BreadcrumbItem } from '@/types';
import UserForm, { type UserFormData } from './user-form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: users.index().url },
    { title: 'Edit', href: '#' },
];

type Props = {
    user: {
        id: string;
        name: string;
        email: string;
        staff_id: string | null;
        position: string | null;
        phone: string | null;
        department_id: string;
        role: string;
        is_active: boolean;
    };
    departments: Array<{ id: string; name: string }>;
    roles: Record<string, string>;
};

export default function UsersEdit({ user, departments, roles }: Props) {
    const { data, setData, put, processing, errors } = useForm<UserFormData>({
        name: user.name ?? '',
        email: user.email ?? '',
        staff_id: user.staff_id ?? '',
        position: user.position ?? '',
        phone: user.phone ?? '',
        department_id: String(user.department_id ?? ''),
        role: user.role ?? 'viewer',
        is_active: Boolean(user.is_active),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${user.name}`} />
            <UserForm
                data={data}
                setData={setData as never}
                errors={errors}
                processing={processing}
                onSubmit={(e) => {
                    e.preventDefault();
                    put(users.update(user.id).url);
                }}
                departments={departments}
                roles={roles}
                title={`Edit ${user.name}`}
                submitLabel="Save changes"
                busyLabel="Saving..."
            />
        </AppLayout>
    );
}
