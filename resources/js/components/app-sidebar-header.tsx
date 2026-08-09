import AppearanceToggleTab from '@/components/appearance-tabs';
import { Breadcrumbs } from '@/components/breadcrumbs';
import NotificationsToggle from '@/components/notifications-toggle';
import QuickActions from '@/components/quick-actions';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6">
            <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            {/* Notifications must stay reachable on a phone; the new-record
                shortcut and theme toggle can fall away on narrow screens
                because both are available elsewhere. */}
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                <QuickActions className="hidden sm:block" />
                <NotificationsToggle />
                <AppearanceToggleTab className="hidden md:block" />
            </div>
        </header>
    );
}
