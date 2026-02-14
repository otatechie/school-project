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
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import users from '@/routes/users';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: users.index().url,
    },
    {
        title: 'Create',
        href: '#',
    },
];

export default function Create() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        staff_id: '',
        department_id: '',
        position: '',
        phone: '',
        approval_level: '1',
        approval_limit: '',
        is_active: true,
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
            <Head title="Create User" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="space-y-4">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href={users.index().url} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Users</span>
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-semibold text-black dark:text-white">
                            Create User
                        </h1>
                        <p className="mt-1 text-base text-muted-foreground">
                            Add a new user to the system
                        </p>
                    </div>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                        <CardDescription>
                            Enter the details for the new user. All required
                            fields are marked with an asterisk (*).
                        </CardDescription>
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
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Required Fields Section */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Full Name{' '}
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
                                        placeholder="e.g., John Doe"
                                        required
                                        autoFocus
                                        autoComplete="name"
                                        disabled={isSubmitting}
                                    />
                                    <InputError message={errors.name} />
                                    <p className="text-sm text-muted-foreground">
                                        Enter the user's full name
                                    </p>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">
                                            Email Address{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    email: e.target.value,
                                                })
                                            }
                                            placeholder="email@example.com"
                                            required
                                            autoComplete="email"
                                            disabled={isSubmitting}
                                        />
                                        <InputError message={errors.email} />
                                        <p className="text-sm text-muted-foreground">
                                            User's email address for login
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="staff_id">
                                            Staff ID{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="staff_id"
                                            type="text"
                                            value={formData.staff_id}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    staff_id: e.target.value.toUpperCase(),
                                                })
                                            }
                                            placeholder="e.g., STF001"
                                            required
                                            autoComplete="off"
                                            className="font-mono"
                                            disabled={isSubmitting}
                                        />
                                        <InputError message={errors.staff_id} />
                                        <p className="text-sm text-muted-foreground">
                                            Unique staff identification number
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">
                                            Password{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    password: e.target.value,
                                                })
                                            }
                                            placeholder="Enter password"
                                            required
                                            autoComplete="new-password"
                                            disabled={isSubmitting}
                                        />
                                        <InputError message={errors.password} />
                                        <p className="text-sm text-muted-foreground">
                                            Minimum 8 characters
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">
                                            Confirm Password{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={formData.password_confirmation}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    password_confirmation:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="Confirm password"
                                            required
                                            autoComplete="new-password"
                                            disabled={isSubmitting}
                                        />
                                        <InputError message={errors.password_confirmation} />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Department & Position Section */}
                            <div>
                                <Label className="text-base font-semibold text-black dark:text-white">
                                    Department & Position
                                </Label>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Assign department and job position
                                </p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="department_id">
                                        Department{' '}
                                        <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={formData.department_id}
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                department_id: value,
                                            })
                                        }
                                        disabled={isSubmitting}
                                    >
                                        <SelectTrigger id="department_id">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Finance</SelectItem>
                                            <SelectItem value="2">
                                                Procurement
                                            </SelectItem>
                                            <SelectItem value="3">Admin</SelectItem>
                                            <SelectItem value="4">IT</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.department_id} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="position">
                                        Position
                                    </Label>
                                    <Input
                                        id="position"
                                        type="text"
                                        value={formData.position}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                position: e.target.value,
                                            })
                                        }
                                        placeholder="e.g., Accountant, Manager"
                                        autoComplete="organization-title"
                                        disabled={isSubmitting}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        User's job title or position
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">
                                    Phone Number
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            phone: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., +233 XX XXX XXXX"
                                    autoComplete="tel"
                                    disabled={isSubmitting}
                                />
                                <p className="text-sm text-muted-foreground">
                                    Contact phone number for notifications
                                </p>
                            </div>

                            <Separator />

                            {/* Approval Settings Section */}
                            <div>
                                <Label className="text-base font-semibold text-black dark:text-white">
                                    Approval Settings
                                </Label>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Configure approval level and limits
                                </p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="approval_level">
                                        Approval Level
                                    </Label>
                                    <Select
                                        value={formData.approval_level}
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                approval_level: value,
                                            })
                                        }
                                        disabled={isSubmitting}
                                    >
                                        <SelectTrigger id="approval_level">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Level 1</SelectItem>
                                            <SelectItem value="2">Level 2</SelectItem>
                                            <SelectItem value="3">Level 3</SelectItem>
                                            <SelectItem value="4">Level 4</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground">
                                        User's approval authority level
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="approval_limit">
                                        Approval Limit (GHS)
                                    </Label>
                                    <Input
                                        id="approval_limit"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.approval_limit}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                approval_limit: e.target.value,
                                            })
                                        }
                                        placeholder="0.00"
                                        disabled={isSubmitting}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Maximum amount user can approve
                                    </p>
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
                                        Control whether this user is active in the
                                        system
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
                                        disabled={isSubmitting}
                                    />
                                    <div className="flex-1 space-y-1">
                                        <Label
                                            htmlFor="is_active"
                                            className="cursor-pointer font-medium text-black dark:text-white"
                                        >
                                            User is active
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Inactive users cannot log in to the
                                            system
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
                                    <Link href={users.index().url}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create User'
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
