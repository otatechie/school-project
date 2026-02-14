import { Link } from '@inertiajs/react';
import { index as notificationsIndex } from '@/routes/notifications';
import {
    Bell,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    FileText,
    Mail,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type Notification = {
    id: string;
    type: 'approval' | 'pending' | 'alert' | 'rejected' | 'memo';
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

const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
        case 'approval':
            return (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            );
        case 'pending':
            return (
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            );
        case 'alert':
            return (
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            );
        case 'rejected':
            return (
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            );
        case 'memo':
            return (
                <Mail className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            );
        default:
            return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
};

export default function NotificationsToggle({
    className = '',
}: {
    className?: string;
}) {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const unreadCount = Array.isArray(notifications) ? notifications.filter((n) => !n.read).length : 0;

    const markAsRead = (id: string) => {
        if (!Array.isArray(notifications)) return;
        setNotifications(
            notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
            )
        );
    };

    const markAllAsRead = () => {
        if (!Array.isArray(notifications)) return;
        setNotifications(notifications.map((n) => ({ ...n, read: true })));
    };

    return (
        <div className={cn('', className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative h-9 w-9 cursor-pointer"
                    >
                        <Bell className="h-4 w-4" />
                        {unreadCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                        <span className="sr-only">Notifications</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-96 p-0">
                    <div className="flex items-center justify-between border-b border-border px-3 py-2">
                        <DropdownMenuLabel className="p-0 text-sm font-semibold text-black dark:text-white">
                            Notifications
                        </DropdownMenuLabel>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="h-6 text-sm text-muted-foreground hover:text-foreground"
                            >
                                Mark all as read
                            </Button>
                        )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                        {!Array.isArray(notifications) || notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Bell className="mb-3 h-10 w-10 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    No notifications
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            'group relative px-3 py-2 transition-colors hover:bg-muted/50',
                                            !notification.read &&
                                                'bg-muted/30'
                                        )}
                                    >
                                        {notification.href ? (
                                            <Link
                                                href={notification.href}
                                                onClick={() =>
                                                    markAsRead(notification.id)
                                                }
                                                className="flex items-start gap-2.5"
                                            >
                                                <div className="mt-0.5 shrink-0">
                                                    {getNotificationIcon(
                                                        notification.type
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-0.5">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-sm font-medium text-black dark:text-white line-clamp-1">
                                                            {
                                                                notification.title
                                                            }
                                                        </p>
                                                        {!notification.read && (
                                                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {notification.time}
                                                    </p>
                                                </div>
                                            </Link>
                                        ) : (
                                            <div className="flex items-start gap-2.5">
                                                <div className="mt-0.5 shrink-0">
                                                    {getNotificationIcon(
                                                        notification.type
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-0.5">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-sm font-medium text-black dark:text-white line-clamp-1">
                                                            {
                                                                notification.title
                                                            }
                                                        </p>
                                                        {!notification.read && (
                                                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {notification.time}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {Array.isArray(notifications) && notifications.length > 0 && (
                        <>
                            <Separator />
                            <div className="p-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-full text-sm"
                                    asChild
                                >
                                    <Link href={notificationsIndex().url}>
                                        View all notifications
                                    </Link>
                                </Button>
                            </div>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
