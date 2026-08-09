import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { update as updateProfile } from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

type Department = {
    id: string;
    name: string;
};

export default function Profile({
    mustVerifyEmail,
    status,
    departments = [],
}: {
    mustVerifyEmail: boolean;
    status?: string;
    departments?: Department[];
}) {
    const { auth } = usePage<SharedData>().props;
    const [departmentId, setDepartmentId] = useState<string>(
        auth.user.department_id ?? '',
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profile information"
                        description="Update your name, email, and work details"
                    />

                    <Form
                        {...updateProfile.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>

                                        <Input
                                            id="name"
                                            className="mt-1 block w-full"
                                            defaultValue={auth.user.name}
                                            name="name"
                                            required
                                            autoComplete="name"
                                            placeholder="Full name"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.name}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">
                                            Email address
                                        </Label>

                                        <Input
                                            id="email"
                                            type="email"
                                            className="mt-1 block w-full"
                                            defaultValue={auth.user.email}
                                            name="email"
                                            required
                                            autoComplete="username"
                                            placeholder="Email address"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.email}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Phone</Label>

                                        <Input
                                            id="phone"
                                            type="tel"
                                            className="mt-1 block w-full"
                                            defaultValue={auth.user.phone ?? ''}
                                            name="phone"
                                            autoComplete="tel"
                                            placeholder="e.g. +233 24 123 4567"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.phone}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="staff_id">
                                            Staff ID
                                        </Label>

                                        <Input
                                            id="staff_id"
                                            type="text"
                                            className="mt-1 block w-full"
                                            defaultValue={
                                                auth.user.staff_id ?? ''
                                            }
                                            name="staff_id"
                                            placeholder="Employee or staff number"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.staff_id}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="department_id">
                                            Department
                                        </Label>

                                        <input
                                            type="hidden"
                                            name="department_id"
                                            value={
                                                departmentId === '__none__'
                                                    ? ''
                                                    : departmentId
                                            }
                                        />
                                        <Select
                                            value={
                                                departmentId
                                                    ? departmentId
                                                    : undefined
                                            }
                                            onValueChange={setDepartmentId}
                                        >
                                            <SelectTrigger
                                                id="department_id"
                                                className="mt-1 w-full"
                                            >
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="__none__">
                                                    None
                                                </SelectItem>
                                                {departments.map((dept) => (
                                                    <SelectItem
                                                        key={dept.id}
                                                        value={dept.id}
                                                    >
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <InputError
                                            className="mt-2"
                                            message={errors.department_id}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="position">
                                            Position
                                        </Label>

                                        <Input
                                            id="position"
                                            type="text"
                                            className="mt-1 block w-full"
                                            defaultValue={
                                                auth.user.position ?? ''
                                            }
                                            name="position"
                                            placeholder="Job title or role"
                                        />

                                        <InputError
                                            className="mt-2"
                                            message={errors.position}
                                        />
                                    </div>
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                Your email address is
                                                unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Click here to resend the
                                                    verification email.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    A new verification link has
                                                    been sent to your email
                                                    address.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Save
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Saved
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
