import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl, type IsCurrentUrlFn } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';

export function NavMain({
    items = [],
    label,
}: {
    items: NavItem[];
    label?: string;
}) {
    const { isCurrentUrl } = useCurrentUrl();

    if (items.length === 0) {
        return null;
    }

    return (
        <SidebarGroup className="px-2 py-0">
            {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
            <SidebarMenu>
                {items.map((item) => {
                    if (item.items && item.items.length > 0) {
                        return (
                            <NavItemWithChildren
                                key={item.title}
                                item={item}
                                isCurrentUrl={isCurrentUrl}
                            />
                        );
                    }

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild={!!item.href}
                                isActive={
                                    item.href ? isCurrentUrl(item.href) : false
                                }
                                tooltip={{ children: item.title }}
                            >
                                {item.href ? (
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                ) : (
                                    <>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </>
                                )}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}

function NavItemWithChildren({
    item,
    isCurrentUrl,
}: {
    item: NavItem;
    isCurrentUrl: IsCurrentUrlFn;
}) {
    const [open, setOpen] = useState(false);
    const hasActiveChild = item.items?.some((child) =>
        child.href ? isCurrentUrl(child.href) : false,
    );

    return (
        <Collapsible open={open} onOpenChange={setOpen} asChild>
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        tooltip={{ children: item.title }}
                        isActive={hasActiveChild}
                    >
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight
                            className={cn(
                                'ml-auto transition-transform duration-200',
                                open && 'rotate-90',
                            )}
                        />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                    asChild
                                    isActive={
                                        subItem.href
                                            ? isCurrentUrl(subItem.href)
                                            : false
                                    }
                                >
                                    {subItem.href ? (
                                        <Link href={subItem.href} prefetch>
                                            <span>{subItem.title}</span>
                                        </Link>
                                    ) : (
                                        <div>
                                            <span>{subItem.title}</span>
                                        </div>
                                    )}
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
}
