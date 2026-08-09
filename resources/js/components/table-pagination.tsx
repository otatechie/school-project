import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import type { Paginated } from '@/types';

/**
 * Pagination controls for a paginated list.
 *
 * Renders nothing on a single page. A list that says "showing 10 of 13" with
 * no way to reach the other three is a bug, so every paginated table uses this.
 */
export default function TablePagination<T>({
    page,
}: {
    page: Paginated<T> | null;
}) {
    if (!page || page.last_page <= 1) return null;

    const go = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true, preserveScroll: true });
        }
    };

    return (
        <nav
            aria-label="Pagination"
            className="flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row"
        >
            <p className="text-sm text-muted-foreground">
                Showing{' '}
                <span className="font-medium text-foreground tabular-nums">
                    {page.from ?? 0}
                </span>
                {'–'}
                <span className="font-medium text-foreground tabular-nums">
                    {page.to ?? 0}
                </span>
                {' of '}
                <span className="font-medium text-foreground tabular-nums">
                    {page.total}
                </span>
            </p>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!page.prev_page_url}
                    onClick={() => go(page.prev_page_url)}
                >
                    Previous
                </Button>
                <span className="px-1 text-sm text-muted-foreground tabular-nums">
                    Page {page.current_page} of {page.last_page}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!page.next_page_url}
                    onClick={() => go(page.next_page_url)}
                >
                    Next
                </Button>
            </div>
        </nav>
    );
}
