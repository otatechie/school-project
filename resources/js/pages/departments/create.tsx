import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Info, Loader2 } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import departments from '@/routes/departments';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Departments',
        href: departments.index().url,
    },
    {
        title: 'Create',
        href: '#',
    },
];

export default function Create() {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        is_active: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const errors: Record<string, string> = {};
    const successMessage = '';

    const codeLength = formData.code.length;
    const maxCodeLength = 10;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => setIsSubmitting(false), 800);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New department" />
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
                            New department
                        </h1>
                        <p className="mt-1 text-base text-muted-foreground">
                            Add a new department to the system
                        </p>
                    </div>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Department details</CardTitle>
                        <CardDescription>
                            Enter the details for the new department. All
                            required fields are marked with an asterisk (*).
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
                            {/* Required Fields Section */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Department Name{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
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
                                        autoFocus
                                        autoComplete="organization-unit"
                                        disabled={isSubmitting}
                                    />
                                    <InputError message={errors.name} />
                                    <p className="text-sm text-muted-foreground">
                                        Enter the full name of the department
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="code">
                                            Department Code{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <span className="text-sm text-muted-foreground">
                                            {codeLength}/{maxCodeLength}
                                        </span>
                                    </div>
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
                                        maxLength={maxCodeLength}
                                        required
                                        autoComplete="off"
                                        className="font-mono"
                                        disabled={isSubmitting}
                                    />
                                    <InputError message={errors.code} />
                                    <div className="flex items-start gap-2 rounded-md bg-muted/50 p-2">
                                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            Maximum {maxCodeLength} characters.
                                            Must be unique. This code will be
                                            used for identification and
                                            reporting.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Optional Fields Section */}
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-base font-semibold text-black dark:text-white">
                                        Status
                                    </Label>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Control whether this department is
                                        active in the system
                                    </p>
                                </div>
                                <div className="flex items-start space-x-3 rounded-lg border border-border bg-muted/30 p-4">
                                    <Checkbox
                                        id="is_active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) =>
                                            setFormData({
                                                ...formData,
                                                is_active: checked === true,
                                            })
                                        }
                                        className="mt-0.5"
                                    />
                                    <div className="flex-1 space-y-1">
                                        <Label
                                            htmlFor="is_active"
                                            className="cursor-pointer font-medium text-black dark:text-white"
                                        >
                                            Department is active
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Inactive departments cannot be
                                            assigned to new users but existing
                                            assignments remain
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                    disabled={isSubmitting}
                                >
                                    <Link href={departments.index().url}>
                                        Cancel
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'New department'
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
