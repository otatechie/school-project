import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import users from '@/routes/users';
import type { BreadcrumbItem } from '@/types';
import UserForm, { type UserFormData } from './user-form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: users.index().url },
    { title: 'Add', href: '#' },
];

type Props = {
    departments: Array<{ id: string; name: string }>;
    roles: Record<string, string>;
};

export default function UsersCreate({ departments, roles }: Props) {
    const { data, setData, post, processing, errors } = useForm<UserFormData>({
        name: '',
        email: '',
        staff_id: '',
        position: '',
        phone: '',
        department_id: '',
        role: 'viewer',
        is_active: true,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add staff member" />
            <UserForm
                data={data}
                setData={setData as never}
                errors={errors}
                processing={processing}
                onSubmit={(e) => {
                    e.preventDefault();
                    post(users.store().url);
                }}
                departments={departments}
                roles={roles}
                title="Add staff member"
                submitLabel="Add staff member"
                busyLabel="Adding..."
            />
        </AppLayout>
    );
}
