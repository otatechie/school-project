import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import departments from '@/routes/departments';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Departments', href: departments.index().url },
    { title: 'Edit', href: '#' },
];

type Props = {
    department: {
        id: string;
        name: string;
        code: string;
        is_active: boolean;
    };
};

export default function DepartmentsEdit({ department }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: department.name ?? '',
        code: department.code ?? '',
        is_active: Boolean(department.is_active),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${department.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4 md:p-6">
                <div className="space-y-2">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href={departments.index().url} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Departments</span>
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold text-black md:text-3xl dark:text-white">
                        Edit {department.name}
                    </h1>
                </div>

                <Card className="max-w-2xl py-5">
                    <CardContent>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                put(departments.update(department.id).url);
                            }}
                            className="space-y-5"
                        >
                            <div className="space-y-1.5">
                                <Label htmlFor="name">
                                    Department name{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="e.g. Finance"
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="code">
                                    Department code{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="code"
                                    value={data.code}
                                    onChange={(e) =>
                                        setData(
                                            'code',
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    placeholder="e.g. FIN"
                                    required
                                />
                                <InputError message={errors.code} />
                                <p className="text-xs text-muted-foreground">
                                    A short identifier used on vouchers and
                                    reports.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) =>
                                        setData('is_active', Boolean(checked))
                                    }
                                />
                                <Label
                                    htmlFor="is_active"
                                    className="font-normal"
                                >
                                    Active — can be selected on new vouchers
                                </Label>
                            </div>
                            <InputError message={errors.is_active} />

                            <Separator />

                            <div className="flex items-center justify-end gap-3">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={departments.index().url}>
                                        Cancel
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save changes'
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
