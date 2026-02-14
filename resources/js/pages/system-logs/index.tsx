import { Head } from '@inertiajs/react';
import {
    History,
    Search,
    CheckCircle2,
    XCircle,
    AlertCircle,
    FileText,
    User,
    Shield,
    Database,
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
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'System Audit Log',
        href: '/system-logs',
    },
];

// Mock data for UI design
const mockLogs = [
    {
        id: '1',
        action: 'Voucher Approved',
        user: 'John Doe',
        user_email: 'john.doe@example.com',
        type: 'voucher',
        status: 'success',
        description: 'Approved payment voucher #2024-012',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        created_at: '2024-01-27T14:30:00',
    },
    {
        id: '2',
        action: 'User Created',
        user: 'Jane Smith',
        user_email: 'jane.smith@example.com',
        type: 'user',
        status: 'success',
        description: 'Created new user account for Sarah Johnson',
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        created_at: '2024-01-27T13:15:00',
    },
    {
        id: '3',
        action: 'Failed Login Attempt',
        user: 'Unknown',
        user_email: 'admin@example.com',
        type: 'authentication',
        status: 'failed',
        description: 'Failed login attempt with incorrect password',
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        created_at: '2024-01-27T12:45:00',
    },
    {
        id: '4',
        action: 'Department Updated',
        user: 'Michael Brown',
        user_email: 'michael.brown@example.com',
        type: 'department',
        status: 'success',
        description: 'Updated Finance department details',
        ip_address: '192.168.1.103',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        created_at: '2024-01-27T11:20:00',
    },
    {
        id: '5',
        action: 'GIFMIS Sync Failed',
        user: 'System',
        user_email: 'system@example.com',
        type: 'system',
        status: 'failed',
        description: 'GIFMIS synchronization failed: Connection timeout',
        ip_address: '127.0.0.1',
        user_agent: 'System Process',
        created_at: '2024-01-27T10:00:00',
    },
    {
        id: '6',
        action: 'Voucher Rejected',
        user: 'David Wilson',
        user_email: 'david.wilson@example.com',
        type: 'voucher',
        status: 'success',
        description: 'Rejected payment voucher #2024-010 - Missing documents',
        ip_address: '192.168.1.104',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        created_at: '2024-01-27T09:30:00',
    },
    {
        id: '7',
        action: 'Permission Changed',
        user: 'Admin User',
        user_email: 'admin@example.com',
        type: 'security',
        status: 'success',
        description: 'Changed approval level for user STF003',
        ip_address: '192.168.1.105',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        created_at: '2024-01-26T16:45:00',
    },
    {
        id: '8',
        action: 'Report Generated',
        user: 'Sarah Johnson',
        user_email: 'sarah.johnson@example.com',
        type: 'report',
        status: 'success',
        description: 'Generated Monthly Financial Report',
        ip_address: '192.168.1.106',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        created_at: '2024-01-26T15:20:00',
    },
];

const getActionIcon = (type: string) => {
    switch (type) {
        case 'voucher':
            return FileText;
        case 'user':
            return User;
        case 'authentication':
            return Shield;
        case 'department':
            return Database;
        case 'system':
            return AlertCircle;
        case 'security':
            return Shield;
        case 'report':
            return FileText;
        default:
            return History;
    }
};

const getStatusIcon = (status: string) => {
    return status === 'success' ? CheckCircle2 : XCircle;
};

const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function Index() {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filteredLogs = mockLogs.filter((log) => {
        const matchesSearch =
            log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.user_email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = typeFilter === 'all' || log.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
    });

    const successCount = mockLogs.filter((l) => l.status === 'success').length;
    const failedCount = mockLogs.filter((l) => l.status === 'failed').length;
    const typeCounts = mockLogs.reduce(
        (acc, log) => {
            acc[log.type] = (acc[log.type] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Audit Log" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                {/* Header Section */}
                <div className="space-y-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-black dark:text-white">
                            System Audit Log
                        </h1>
                        <p className="mt-1 text-base text-muted-foreground">
                            Track all system activities, user actions, and security
                            events
                        </p>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Total Logs
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {mockLogs.length}
                                        </p>
                                    </div>
                                    <History className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Successful
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {successCount}
                                        </p>
                                    </div>
                                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Failed
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {failedCount}
                                        </p>
                                    </div>
                                    <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Today
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                            {
                                                mockLogs.filter((log) => {
                                                    const logDate = new Date(
                                                        log.created_at
                                                    );
                                                    const today = new Date();
                                                    return (
                                                        logDate.toDateString() ===
                                                        today.toDateString()
                                                    );
                                                }).length
                                            }
                                        </p>
                                    </div>
                                    <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400" />
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
                                <CardTitle>All Logs</CardTitle>
                                <CardDescription className="mt-1">
                                    {filteredLogs.length} log
                                    {filteredLogs.length !== 1 ? 's' : ''} found
                                    {searchQuery &&
                                        ` matching "${searchQuery}"`}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* Search and Filter Section */}
                        <div className="mb-6 space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search by action, user, or description..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="pl-9"
                                    />
                                </div>
                                <Select
                                    value={typeFilter}
                                    onValueChange={setTypeFilter}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="voucher">
                                            Voucher
                                        </SelectItem>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="authentication">
                                            Authentication
                                        </SelectItem>
                                        <SelectItem value="department">
                                            Department
                                        </SelectItem>
                                        <SelectItem value="system">System</SelectItem>
                                        <SelectItem value="security">
                                            Security
                                        </SelectItem>
                                        <SelectItem value="report">Report</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={statusFilter}
                                    onValueChange={setStatusFilter}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="success">
                                            Successful
                                        </SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Separator className="mb-6" />

                        {/* Table */}
                        {filteredLogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <History className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
                                    {searchQuery
                                        ? 'No logs found'
                                        : 'No logs found'}
                                </h3>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    {searchQuery
                                        ? `No logs match "${searchQuery}". Try a different search term.`
                                        : 'No system logs available.'}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full" role="table">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/30">
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Action
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    User
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Type
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Description
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    IP Address
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                    Timestamp
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredLogs.map((log) => {
                                                const ActionIcon = getActionIcon(
                                                    log.type
                                                );
                                                const StatusIcon = getStatusIcon(
                                                    log.status
                                                );
                                                return (
                                                    <tr
                                                        key={log.id}
                                                        className="border-b border-border transition-colors hover:bg-muted/50"
                                                    >
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <ActionIcon className="h-4 w-4 text-muted-foreground" />
                                                                <span className="font-medium text-black dark:text-white">
                                                                    {log.action}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div>
                                                                <div className="font-medium text-black dark:text-white">
                                                                    {log.user}
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {log.user_email}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <Badge variant="outline">
                                                                {log.type}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className="text-sm text-muted-foreground">
                                                                {log.description}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <Badge
                                                                variant={
                                                                    log.status ===
                                                                    'success'
                                                                        ? 'default'
                                                                        : 'destructive'
                                                                }
                                                                className="gap-1.5"
                                                            >
                                                                <StatusIcon className="h-3 w-3" />
                                                                {log.status === 'success'
                                                                    ? 'Success'
                                                                    : 'Failed'}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <code className="rounded-md bg-muted px-2 py-1 text-sm font-mono text-muted-foreground">
                                                                {log.ip_address}
                                                            </code>
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <span className="text-sm text-muted-foreground">
                                                                {formatDateTime(
                                                                    log.created_at
                                                                )}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
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
                                            {filteredLogs.length}
                                        </span>{' '}
                                        of{' '}
                                        <span className="font-medium text-black dark:text-white">
                                            {filteredLogs.length}
                                        </span>{' '}
                                        logs
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
            </div>
        </AppLayout>
    );
}
