import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    Edit,
    Plus,
    Search,
    Trash2,
    Users,
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
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Departments',
        href: '/departments',
    },
];

// Mock data for UI design
const mockDepartments = [
    {
        id: '1',
        name: 'Finance',
        code: 'FIN',
        is_active: true,
        users_count: 12,
    },
    {
        id: '2',
        name: 'Human Resources',
        code: 'HR',
        is_active: true,
        users_count: 8,
    },
    {
        id: '3',
        name: 'Procurement',
        code: 'PROC',
        is_active: true,
        users_count: 15,
    },
    {
        id: '4',
        name: 'Administration',
        code: 'ADMIN',
        is_active: false,
        users_count: 5,
    },
    {
        id: '5',
        name: 'Accounts',
        code: 'ACC',
        is_active: true,
        users_count: 20,
    },
];

export default function Index() {
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState<{
        id: string;
        name: string;
        code: string;
    } | null>(null);

    const filteredDepartments = mockDepartments.filter(
        (dept) =>
            dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dept.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeCount = mockDepartments.filter((d) => d.is_active).length;
    const totalUsers = mockDepartments.reduce(
        (sum, d) => sum + d.users_count,
        0
    );

    const handleDeleteClick = (department: {
        id: string;
        name: string;
        code: string;
    }) => {
        setDepartmentToDelete(department);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        // UI only - no actual deletion
        setDeleteDialogOpen(false);
        setDepartmentToDelete(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Departments" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                {/* Header Section */}
                <div className="space-y-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-black dark:text-white">
                            Department Management
                        </h1>
                        <p className="mt-1 text-base text-muted-foreground">
                            Manage organizational departments and their settings
                        </p>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Total Departments
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {mockDepartments.length}
                                        </p>
                                    </div>
                                    <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Active Departments
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {activeCount}
                                        </p>
                                    </div>
                                    <Building2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Total Users
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {totalUsers}
                                        </p>
                                    </div>
                                    <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
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
                                <CardTitle>All Departments</CardTitle>
                                <CardDescription className="mt-1">
                                    {filteredDepartments.length} department
                                    {filteredDepartments.length !== 1 ? 's' : ''}{' '}
                                    found
                                    {searchQuery &&
                                        ` matching "${searchQuery}"`}
                                </CardDescription>
                            </div>
                            <Button asChild>
                                <Link href="/departments/create" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    <span>Add Department</span>
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
                                    placeholder="Search departments by name or code..."
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
                        {filteredDepartments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
                                    {searchQuery
                                        ? 'No departments found'
                                        : 'No departments found'}
                                </h3>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    {searchQuery
                                        ? `No departments match "${searchQuery}". Try a different search term.`
                                        : 'Get started by creating a new department.'}
                                </p>
                                {!searchQuery && (
                                    <Button asChild>
                                        <Link
                                            href="/departments/create"
                                            className="gap-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            <span>Create Department</span>
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
                                                    Department Name
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Code
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Users
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
                                            {filteredDepartments.map(
                                                (department) => (
                                                    <tr
                                                        key={department.id}
                                                        className="border-b border-border transition-colors hover:bg-muted/50"
                                                    >
                                                        <td className="px-4 py-4">
                                                            <div className="text-sm text-black dark:text-white">
                                                                {
                                                                    department.name
                                                                }
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <code className="rounded-md bg-muted px-2.5 py-1.5 text-sm font-mono font-medium text-muted-foreground">
                                                                {
                                                                    department.code
                                                                }
                                                            </code>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                                <span className="text-sm font-medium text-black dark:text-white">
                                                                    {
                                                                        department.users_count
                                                                    }
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <Badge
                                                                variant={
                                                                    department.is_active
                                                                        ? 'default'
                                                                        : 'secondary'
                                                                }
                                                                className={
                                                                    department.is_active
                                                                        ? 'border-transparent bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                                                                        : ''
                                                                }
                                                            >
                                                                {department.is_active
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
                                                                    title="Edit department"
                                                                >
                                                                    <Link
                                                                        href={`/departments/${department.id}/edit`}
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
                                                                            id: department.id,
                                                                            name: department.name,
                                                                            code: department.code,
                                                                        });
                                                                    }}
                                                                    title="Delete department"
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
                                                )
                                            )}
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
                                            {filteredDepartments.length}
                                        </span>{' '}
                                        of{' '}
                                        <span className="font-medium text-black dark:text-white">
                                            {filteredDepartments.length}
                                        </span>{' '}
                                        departments
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
                <Dialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                >
                    <DialogContent>
                        <DialogTitle>
                            Are you sure you want to delete this department?
                        </DialogTitle>
                        <DialogDescription>
                            Once the department is deleted, all of its resources
                            and data will also be permanently deleted. This
                            action cannot be undone.
                        </DialogDescription>

                        {departmentToDelete && (
                            <div className="rounded-md bg-muted p-4">
                                <p className="mb-2 text-sm font-medium text-muted-foreground">
                                    Department Details
                                </p>
                                <p className="text-sm text-black dark:text-white">
                                    {departmentToDelete.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Code: {departmentToDelete.code}
                                </p>
                            </div>
                        )}

                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setDeleteDialogOpen(false);
                                        setDepartmentToDelete(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteConfirm}
                            >
                                Delete Department
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
