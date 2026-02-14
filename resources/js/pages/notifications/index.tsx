import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    Bell,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    Mail,
    FileText,
    Search,
} from 'lucide-react';
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
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import notifications from '@/routes/notifications';
import type { BreadcrumbItem } from '@/types';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Notifications', href: notifications.index().url },
];

type NotificationType =
    | 'approval'
    | 'pending'
    | 'alert'
    | 'rejected'
    | 'memo';

type Notification = {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    time: string;
    read: boolean;
    href?: string;
};

const mockNotifications: Notification[] = [
    {
        id: '1',
        type: 'approval',
        title: 'Voucher Approved',
        message: 'Payment voucher PV-2024-001 has been approved',
        time: '2 minutes ago',
        read: false,
        href: '/payment-vouchers',
    },
    {
        id: '2',
        type: 'pending',
        title: 'Approval Required',
        message: 'Payment voucher PV-2024-002 requires your approval',
        time: '15 minutes ago',
        read: false,
        href: '/payment-vouchers/pending',
    },
    {
        id: '3',
        type: 'alert',
        title: 'Budget Limit Warning',
        message: 'Procurement department has reached 85% of monthly budget',
        time: '1 hour ago',
        read: false,
        href: '/dashboard',
    },
    {
        id: '4',
        type: 'approval',
        title: 'Voucher Approved',
        message: 'Payment voucher PV-2024-003 has been approved',
        time: '2 hours ago',
        read: true,
        href: '/payment-vouchers',
    },
    {
        id: '5',
        type: 'rejected',
        title: 'Voucher Rejected',
        message: 'Payment voucher PV-2024-004 was rejected. Review required.',
        time: '3 hours ago',
        read: false,
        href: '/payment-vouchers/rejected',
    },
    {
        id: '6',
        type: 'memo',
        title: 'Memo Finalized',
        message: 'Memo MEMO-2024-002 has been finalized and is ready for printing.',
        time: '45 minutes ago',
        read: false,
        href: '/memos',
    },
    {
        id: '7',
        type: 'memo',
        title: 'New Memo Draft',
        message: 'Draft memo MEMO-2024-003 is awaiting your review.',
        time: '5 hours ago',
        read: true,
        href: '/memos',
    },
];

function getNotificationIcon(type: NotificationType) {
    switch (type) {
        case 'approval':
            return (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
            );
        case 'pending':
            return (
                <Clock className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            );
        case 'alert':
            return (
                <AlertCircle className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
            );
        case 'rejected':
            return (
                <XCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
            );
        case 'memo':
            return (
                <Mail className="h-5 w-5 shrink-0 text-slate-600 dark:text-slate-400" />
            );
        default:
            return (
                <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
            );
    }
}

type FilterType = NotificationType | 'all';
type FilterRead = 'all' | 'read' | 'unread';

export default function NotificationsIndex() {
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [filterRead, setFilterRead] = useState<FilterRead>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const notifications = mockNotifications.filter((n) => {
        if (filterType !== 'all' && n.type !== filterType) return false;
        if (filterRead === 'read' && !n.read) return false;
        if (filterRead === 'unread' && n.read) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            if (
                !n.title.toLowerCase().includes(q) &&
                !n.message.toLowerCase().includes(q)
            ) {
                return false;
            }
        }
        return true;
    });

    const unreadCount = mockNotifications.filter((n) => !n.read).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <header className="space-y-1">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href={dashboard().url} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Dashboard</span>
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-semibold text-black dark:text-white">
                        Notifications
                    </h1>
                    <p className="text-base text-muted-foreground">
                        {unreadCount > 0
                            ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                            : 'View and manage your notifications'}
                    </p>
                </header>

                <section aria-labelledby="notifications-list-heading">
                    <h2 id="notifications-list-heading" className="sr-only">
                        All notifications
                    </h2>
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Bell className="h-4 w-4" />
                                        All notifications
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        {notifications.length} notification
                                        {notifications.length !== 1 ? 's' : ''} shown
                                        {(filterType !== 'all' || filterRead !== 'all' || searchQuery) &&
                                            ` of ${mockNotifications.length}`}
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="relative flex-1 sm:max-w-xs">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search by title or message..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="pl-9"
                                    />
                                </div>
                                <Select
                                    value={filterType}
                                    onValueChange={(v) =>
                                        setFilterType(v as FilterType)
                                    }
                                >
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All types</SelectItem>
                                        <SelectItem value="approval">Approval</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="alert">Alert</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="memo">Memo</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filterRead}
                                    onValueChange={(v) =>
                                        setFilterRead(v as FilterRead)
                                    }
                                >
                                    <SelectTrigger className="w-full sm:w-[160px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="unread">Unread</SelectItem>
                                        <SelectItem value="read">Read</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Bell className="mb-3 h-12 w-12 text-muted-foreground" />
                                <p className="text-sm font-medium text-black dark:text-white">
                                    {searchQuery || filterType !== 'all' || filterRead !== 'all'
                                        ? 'No notifications match your filters'
                                        : 'No notifications'}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {searchQuery || filterType !== 'all' || filterRead !== 'all'
                                        ? 'Try changing the search or filters.'
                                        : 'When you have notifications, they will appear here.'}
                                </p>
                                <Button variant="outline" size="sm" className="mt-4" asChild>
                                    <Link href={dashboard().url}>Go to Dashboard</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50',
                                            !notification.read && 'bg-muted/30'
                                        )}
                                    >
                                        <div className="mt-0.5 shrink-0">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            {notification.href ? (
                                                <Link
                                                    href={notification.href}
                                                    className="block space-y-0.5"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-sm font-medium text-black dark:text-white">
                                                            {notification.title}
                                                        </p>
                                                        {!notification.read && (
                                                            <span
                                                                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                                                                aria-hidden
                                                            />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {notification.time}
                                                    </p>
                                                </Link>
                                            ) : (
                                                <div className="space-y-0.5">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-sm font-medium text-black dark:text-white">
                                                            {notification.title}
                                                        </p>
                                                        {!notification.read && (
                                                            <span
                                                                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                                                                aria-hidden
                                                            />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {notification.time}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        </CardContent>
                    </Card>
                </section>
            </div>
        </AppLayout>
    );
}
