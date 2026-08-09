import { Head, Link, router } from '@inertiajs/react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import notifications from '@/routes/notifications';
import type { BreadcrumbItem, Paginated } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Notifications', href: notifications.index().url },
];

type Notification = {
    id: string;
    type: string;
    title: string;
    body: string | null;
    link: string | null;
    read_at: string | null;
    created_at: string;
    created_at_label: string;
};

type Props = {
    notifications: Paginated<Notification>;
    unreadCount: number;
};

/** Recency for anything recent; the standard date once it is older. */
const relativeTime = (iso: string, fallback: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    return fallback;
};

export default function NotificationsIndex({
    notifications: data,
    unreadCount,
}: Props) {
    const items = data.data ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4 md:p-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-black md:text-3xl dark:text-white">
                            Notifications
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {unreadCount > 0
                                ? `${unreadCount} unread`
                                : 'You are all caught up.'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() =>
                                router.post(
                                    notifications.readAll().url,
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                        >
                            <CheckCheck className="h-4 w-4" />
                            Mark all as read
                        </Button>
                    )}
                </header>

                <Card className="py-5">
                    <CardContent className="space-y-3">
                        <CardDescription>
                            {data.total} notification
                            {data.total !== 1 ? 's' : ''}
                        </CardDescription>

                        {items.length === 0 ? (
                            <div className="py-10 text-center">
                                <Bell
                                    className="mx-auto mb-3 h-10 w-10 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <p className="text-sm font-medium text-black dark:text-white">
                                    No notifications
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    You will be notified when a voucher needs
                                    your attention.
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-border">
                                {items.map((item) => (
                                    <li
                                        key={item.id}
                                        className={`flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between ${
                                            item.read_at ? '' : 'bg-muted/30'
                                        }`}
                                    >
                                        <div className="min-w-0 px-1">
                                            <p className="flex items-center gap-2 text-sm font-medium text-black dark:text-white">
                                                {!item.read_at && (
                                                    <span
                                                        className="h-2 w-2 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400"
                                                        aria-label="Unread"
                                                    />
                                                )}
                                                {item.title}
                                            </p>
                                            {item.body && (
                                                <p className="mt-0.5 text-sm text-muted-foreground">
                                                    {item.body}
                                                </p>
                                            )}
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {relativeTime(
                                                    item.created_at,
                                                    item.created_at_label,
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2 px-1">
                                            {item.link && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link href={item.link}>
                                                        View
                                                    </Link>
                                                </Button>
                                            )}
                                            {!item.read_at && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-1.5"
                                                    onClick={() =>
                                                        router.post(
                                                            notifications.read(
                                                                item.id,
                                                            ).url,
                                                            {},
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        )
                                                    }
                                                >
                                                    <Check className="h-4 w-4" />
                                                    Mark read
                                                </Button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
