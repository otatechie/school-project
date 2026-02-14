import { Head, Link } from '@inertiajs/react';
import {
    Users,
    Edit,
    Plus,
    Search,
    Trash2,
    UserCheck,
    UserX,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import users from '@/routes/users';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: users.index().url,
    },
];

// Mock data for UI design
const mockUsers = [
    {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        staff_id: 'STF001',
        department: 'Finance',
        position: 'Accountant',
        phone: '+233 24 123 4567',
        approval_level: 2,
        approval_limit: 50000.0,
        is_active: true,
        last_login_at: '2024-01-27T10:30:00',
    },
    {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        staff_id: 'STF002',
        department: 'Procurement',
        position: 'Procurement Officer',
        phone: '+233 24 234 5678',
        approval_level: 1,
        approval_limit: 25000.0,
        is_active: true,
        last_login_at: '2024-01-27T09:15:00',
    },
    {
        id: '3',
        name: 'Michael Brown',
        email: 'michael.brown@example.com',
        staff_id: 'STF003',
        department: 'Admin',
        position: 'Administrator',
        phone: '+233 24 345 6789',
        approval_level: 3,
        approval_limit: 100000.0,
        is_active: true,
        last_login_at: '2024-01-26T16:45:00',
    },
    {
        id: '4',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        staff_id: 'STF004',
        department: 'IT',
        position: 'IT Support',
        phone: '+233 24 456 7890',
        approval_level: 1,
        approval_limit: 10000.0,
        is_active: false,
        last_login_at: '2024-01-20T14:20:00',
    },
    {
        id: '5',
        name: 'David Wilson',
        email: 'david.wilson@example.com',
        staff_id: 'STF005',
        department: 'Finance',
        position: 'Finance Manager',
        phone: '+233 24 567 8901',
        approval_level: 4,
        approval_limit: 200000.0,
        is_active: true,
        last_login_at: '2024-01-27T11:00:00',
    },
];

export default function Index() {
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<{
        id: string;
        name: string;
        email: string;
    } | null>(null);

    const filteredUsers = mockUsers.filter(
        (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.staff_id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeCount = mockUsers.filter((u) => u.is_active).length;
    const inactiveCount = mockUsers.filter((u) => !u.is_active).length;

    const handleDeleteClick = (user: {
        id: string;
        name: string;
        email: string;
    }) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        // UI only - no actual deletion
        setDeleteDialogOpen(false);
        setUserToDelete(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                {/* Header Section */}
                <div className="space-y-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-black dark:text-white">
                            User Management
                        </h1>
                        <p className="mt-1 text-base text-muted-foreground">
                            Manage system users, roles, and permissions
                        </p>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Total Users
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {mockUsers.length}
                                        </p>
                                    </div>
                                    <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Active Users
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {activeCount}
                                        </p>
                                    </div>
                                    <UserCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Inactive Users
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {inactiveCount}
                                        </p>
                                    </div>
                                    <UserX className="h-8 w-8 text-red-600 dark:text-red-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Main Content Card */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>All Users</CardTitle>
                                <CardDescription className="mt-1">
                                    {filteredUsers.length} user
                                    {filteredUsers.length !== 1 ? 's' : ''} found
                                    {searchQuery &&
                                        ` matching "${searchQuery}"`}
                                </CardDescription>
                            </div>
                            <Button asChild>
                                <Link href={users.create().url} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    <span>Add User</span>
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* Search and Filter Section */}
                        <div className="mb-6 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search users by name, email, or staff ID..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <Separator className="mb-6" />

                        {/* Table */}
                        {filteredUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
                                    {searchQuery
                                        ? 'No users found'
                                        : 'No users found'}
                                </h3>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    {searchQuery
                                        ? `No users match "${searchQuery}". Try a different search term.`
                                        : 'Get started by creating a new user.'}
                                </p>
                                {!searchQuery && (
                                    <Button asChild>
                                        <Link
                                            href={users.create().url}
                                            className="gap-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            <span>Create User</span>
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full" role="table">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/30">
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Name
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Staff ID
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Email
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Department
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Position
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Approval Level
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map((user) => (
                                                <tr
                                                    key={user.id}
                                                    className="border-b border-border transition-colors hover:bg-muted/50"
                                                >
                                                    <td className="px-4 py-4">
                                                        <div className="text-sm text-black dark:text-white">
                                                            {user.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <code className="rounded-md bg-muted px-2.5 py-1.5 text-sm font-mono font-medium text-muted-foreground">
                                                            {user.staff_id}
                                                        </code>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="text-sm text-muted-foreground">
                                                            {user.email}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="text-sm text-muted-foreground">
                                                            {user.department}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="text-sm text-muted-foreground">
                                                            {user.position}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <Badge variant="outline">
                                                            Level {user.approval_level}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <Badge
                                                            variant={
                                                                user.is_active
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                            className={
                                                                user.is_active
                                                                    ? 'border-transparent bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                                                                    : ''
                                                            }
                                                        >
                                                            {user.is_active
                                                                ? 'Active'
                                                                : 'Inactive'}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                asChild
                                                                title="Edit user"
                                                            >
                                                                <Link
                                                                    href={users.edit({ id: user.id }).url}
                                                                    className="gap-2"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                    <span className="hidden sm:inline">
                                                                        Edit
                                                                    </span>
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleDeleteClick({
                                                                        id: user.id,
                                                                        name: user.name,
                                                                        email: user.email,
                                                                    });
                                                                }}
                                                                title="Delete user"
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                <span className="sr-only">
                                                                    Delete
                                                                </span>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <Separator className="my-6" />
                                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                                    <p className="text-sm text-muted-foreground">
                                        Showing{' '}
                                        <span className="font-medium text-black dark:text-white">
                                            1
                                        </span>{' '}
                                        to{' '}
                                        <span className="font-medium text-black dark:text-white">
                                            {filteredUsers.length}
                                        </span>{' '}
                                        of{' '}
                                        <span className="font-medium text-black dark:text-white">
                                            {filteredUsers.length}
                                        </span>{' '}
                                        users
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled
                                        >
                                            Previous
                                        </Button>
                                        <Button variant="default" size="sm">
                                            1
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            2
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            3
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogTitle>
                            Are you sure you want to delete this user?
                        </DialogTitle>
                        <DialogDescription>
                            Once the user account is deleted, all of its resources
                            and data will also be permanently deleted. This action
                            cannot be undone.
                        </DialogDescription>

                        {userToDelete && (
                            <div className="rounded-md bg-muted p-4">
                                <p className="text-sm font-medium text-muted-foreground mb-2">
                                    User Details
                                </p>
                                <p className="text-sm text-black dark:text-white">
                                    {userToDelete.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {userToDelete.email}
                                </p>
                            </div>
                        )}

                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setDeleteDialogOpen(false);
                                        setUserToDelete(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteConfirm}
                            >
                                Delete User
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
