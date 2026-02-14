import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import departments from '@/routes/departments';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Departments',
        href: departments.index().url,
    },
    {
        title: 'Edit',
        href: '#',
    },
];

// Mock department data for UI; replace with props.department when wired to backend.
const mockDepartment = {
    id: '1',
    name: 'Finance',
    code: 'FIN',
    is_active: true,
};

export default function Edit() {
    const [formData, setFormData] = useState({
        name: mockDepartment.name,
        code: mockDepartment.code,
        is_active: mockDepartment.is_active,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const errors: Record<string, string> = {};
    const successMessage = '';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => setIsSubmitting(false), 800);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Department" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="space-y-4">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href={departments.index().url} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Departments</span>
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-semibold text-black dark:text-white">
                            Edit Department
                        </h1>
                        <p className="mt-1 text-base text-muted-foreground">
                            Update department information
                        </p>
                    </div>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Department Information</CardTitle>
                        <CardDescription>
                            Update the details for this department
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {successMessage && (
                            <div
                                className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-200"
                                role="status"
                            >
                                {successMessage}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Department Name{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., Finance, Human Resources"
                                    required
                                    disabled={isSubmitting}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="code">
                                    Department Code{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="code"
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            code: e.target.value.toUpperCase(),
                                        })
                                    }
                                    placeholder="e.g., FIN, HR"
                                    maxLength={10}
                                    required
                                    disabled={isSubmitting}
                                />
                                <InputError message={errors.code} />
                                <p className="text-sm text-muted-foreground">
                                    Maximum 10 characters. Must be unique.
                                </p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) =>
                                        setFormData({
                                            ...formData,
                                            is_active: checked === true,
                                        })
                                    }
                                    disabled={isSubmitting}
                                />
                                <Label
                                    htmlFor="is_active"
                                    className="cursor-pointer font-normal"
                                >
                                    Department is active
                                </Label>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                    disabled={isSubmitting}
                                >
                                    <Link href={departments.index().url}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Department'
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
