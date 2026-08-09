import { Link } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import users from '@/routes/users';

export type UserFormData = {
    name: string;
    email: string;
    staff_id: string;
    position: string;
    phone: string;
    department_id: string;
    role: string;
    is_active: boolean;
};

const FIELD_LABELS: Record<string, string> = {
    name: 'Full name',
    email: 'Email',
    staff_id: 'Staff ID',
    position: 'Position',
    phone: 'Phone',
    department_id: 'Department',
    role: 'Role',
};

type Props = {
    data: UserFormData;
    setData: (key: keyof UserFormData, value: string | boolean) => void;
    errors: Partial<Record<keyof UserFormData, string>>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    departments: Array<{ id: string; name: string }>;
    roles: Record<string, string>;
    submitLabel: string;
    busyLabel: string;
    title: string;
};

export default function UserForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    departments,
    roles,
    submitLabel,
    busyLabel,
    title,
}: Props) {
    const errorList = Object.entries(errors) as [string, string][];

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4 md:p-6">
            <div className="space-y-2">
                <Button variant="ghost" size="sm" asChild className="-ml-2">
                    <Link href={users.index().url} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Users</span>
                    </Link>
                </Button>
                <h1 className="text-2xl font-semibold text-black md:text-3xl dark:text-white">
                    {title}
                </h1>
            </div>

            <Card className="max-w-3xl py-5">
                <CardContent>
                    {errorList.length > 0 && (
                        <div
                            role="alert"
                            className="mb-5 rounded-md border border-destructive/50 bg-destructive/5 px-4 py-3"
                        >
                            <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
                                <AlertCircle
                                    className="h-4 w-4 shrink-0"
                                    aria-hidden="true"
                                />
                                {errorList.length}{' '}
                                {errorList.length === 1 ? 'field' : 'fields'}{' '}
                                need attention
                            </p>
                            <ul className="mt-2 list-inside list-disc space-y-1">
                                {errorList.map(([field, message]) => (
                                    <li key={field} className="text-sm">
                                        <a
                                            href={`#${field}`}
                                            className="text-destructive underline-offset-4 hover:underline"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const el =
                                                    document.getElementById(
                                                        field,
                                                    );
                                                el?.scrollIntoView({
                                                    behavior: 'smooth',
                                                    block: 'center',
                                                });
                                                el?.focus();
                                            }}
                                        >
                                            {FIELD_LABELS[field] ?? field}
                                        </a>
                                        : {message}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                Person
                            </h2>
                            <div className="grid gap-x-5 gap-y-3.5 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="name">
                                        Full name{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        required
                                        autoFocus
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="email">
                                        Email{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        required
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="staff_id">Staff ID</Label>
                                    <Input
                                        id="staff_id"
                                        value={data.staff_id}
                                        onChange={(e) =>
                                            setData('staff_id', e.target.value)
                                        }
                                        placeholder="e.g. STF-0012"
                                    />
                                    <InputError message={errors.staff_id} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData('phone', e.target.value)
                                        }
                                        placeholder="e.g. +233 XX XXX XXXX"
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                Placement
                            </h2>
                            <div className="grid gap-x-5 gap-y-3.5 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="department_id">
                                        Department{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Select
                                        value={data.department_id}
                                        onValueChange={(v) =>
                                            setData('department_id', v)
                                        }
                                    >
                                        <SelectTrigger id="department_id">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((d) => (
                                                <SelectItem
                                                    key={d.id}
                                                    value={d.id}
                                                >
                                                    {d.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.department_id}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="position">Position</Label>
                                    <Input
                                        id="position"
                                        value={data.position}
                                        onChange={(e) =>
                                            setData('position', e.target.value)
                                        }
                                        placeholder="e.g. Accountant"
                                    />
                                    <InputError message={errors.position} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="role">
                                        Role{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Select
                                        value={data.role}
                                        onValueChange={(v) =>
                                            setData('role', v)
                                        }
                                    >
                                        <SelectTrigger id="role">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                    <InputError message={errors.role} />
                                    <p className="text-xs text-muted-foreground">
                                        Determines what this person can do.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                'is_active',
                                                Boolean(checked),
                                            )
                                        }
                                    />
                                    <Label
                                        htmlFor="is_active"
                                        className="font-normal"
                                    >
                                        Active — can sign in
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-end gap-3">
                            <Button type="button" variant="outline" asChild>
                                <Link href={users.index().url}>Cancel</Link>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {busyLabel}
                                    </>
                                ) : (
                                    submitLabel
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
