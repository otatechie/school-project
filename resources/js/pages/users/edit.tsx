import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
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
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
    {
        title: 'Edit',
        href: '#',
    },
];

// Mock user data
const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    staff_id: 'STF001',
    department_id: '1',
    position: 'Accountant',
    phone: '+233 24 123 4567',
    approval_level: '2',
    approval_limit: '50000.00',
    is_active: true,
};

export default function Edit() {
    const [formData, setFormData] = useState({
        name: mockUser.name,
        email: mockUser.email,
        staff_id: mockUser.staff_id,
        department_id: mockUser.department_id,
        position: mockUser.position,
        phone: mockUser.phone,
        approval_level: mockUser.approval_level,
        approval_limit: mockUser.approval_limit,
        is_active: mockUser.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit User" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="space-y-4">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href="/users" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Users</span>
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-semibold text-black dark:text-white">
                            Edit User
                        </h1>
                        <p className="mt-1 text-base text-muted-foreground">
                            Update user information
                        </p>
                    </div>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                        <CardDescription>
                            Update the details for this user
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                        required
                                    />
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
                                            required
                                        />
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
                                            required
                                            className="font-mono"
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Unique staff identification number
                                        </p>
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
                                    >
                                        <SelectTrigger id="department_id">
                                            <SelectValue />
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
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/users">Cancel</Link>
                                </Button>
                                <Button type="submit">Update User</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
