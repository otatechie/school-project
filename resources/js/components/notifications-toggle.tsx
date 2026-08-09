import { Link, router, usePage } from '@inertiajs/react';
import {
    Banknote,
    Bell,
    CheckCircle2,
    Clock,
    Mail,
    XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import notifications from '@/routes/notifications';
import type { SharedData } from '@/types';

/** One icon per event type, matching the icons used on the pages themselves. */
const ICONS: Record<string, typeof Bell> = {
    'voucher.pending': Clock,
    'voucher.approved': CheckCircle2,
    'voucher.rejected': XCircle,
    'voucher.paid': Banknote,
    'memo.created': Mail,
};

/** Recency for anything recent; the standard date once it is older. */
const relativeTime = (iso: string, fallback: string): string => {
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return fallback;
};

export default function NotificationsToggle({
    className = '',
}: {
    className?: string;
}) {
    const { notifications: data } = usePage<SharedData>().props;

    const items = data?.items ?? [];
    const unread = data?.unread ?? 0;

    const open = (id: string, link: string | null, isRead: boolean) => {
        if (!isRead) {
            router.post(
                notifications.read(id).url,
                {},
                { preserveScroll: true, preserveState: true },
            );
        }

        if (link) router.get(link);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn('relative', className)}
                    aria-label={
                        unread > 0
                            ? `Notifications, ${unread} unread`
                            : 'Notifications'
                    }
                >
                    <Bell className="h-5 w-5" />
                    {unread > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white tabular-nums">
                            {unread > 9 ? '9+' : unread}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
                    <p className="text-sm font-semibold text-black dark:text-white">
                        Notifications
                    </p>
                    {unread > 0 && (
                        <button
                            type="button"
                            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                            onClick={() =>
                                router.post(
                                    notifications.readAll().url,
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                {items.length === 0 ? (
                    <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                        Nothing new. Updates on your vouchers appear here.
                    </p>
                ) : (
                    <ul className="max-h-80 overflow-y-auto">
                        {items.map((item) => {
                            const Icon = ICONS[item.type] ?? Bell;
                            const isRead = Boolean(item.read_at);

                            return (
                                <li key={item.id}>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            open(item.id, item.link, isRead)
                                        }
                                        className={cn(
                                            'flex w-full items-start gap-2.5 border-b border-border px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-muted/60',
                                            !isRead && 'bg-muted/30',
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                'mt-0.5 h-4 w-4 shrink-0',
                                                isRead
                                                    ? 'text-muted-foreground'
                                                    : 'text-foreground',
                                            )}
                                            aria-hidden="true"
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span
                                                className={cn(
                                                    'block text-sm',
                                                    isRead
                                                        ? 'text-muted-foreground'
                                                        : 'font-medium text-black dark:text-white',
                                                )}
                                            >
                                                {item.title}
                                            </span>
                                            {item.body && (
                                                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                                    {item.body}
                                                </span>
                                            )}
                                            <span className="mt-0.5 block text-xs text-muted-foreground">
                                                {relativeTime(
                                                    item.created_at,
                                                    item.created_at_label,
                                                )}
                                            </span>
                                        </span>
                                        {!isRead && (
                                            <span
                                                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                                                aria-label="Unread"
                                            />
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}

                <div className="border-t border-border p-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center"
                        asChild
                    >
                        <Link href={notifications.index().url}>
                            View all notifications
                        </Link>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
