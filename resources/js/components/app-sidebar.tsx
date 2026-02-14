import { Link } from '@inertiajs/react';
import {
    FileText,
    FolderTree,
    LayoutGrid,
    Mail,
    Receipt,
    ShieldCheck,
    Users,
    BarChart3,
    Building2,
    History,
} from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const coreNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Payment Vouchers',
        icon: Receipt,
        items: [
            {
                title: 'Create Voucher',
                href: '/payment-vouchers/create',
            },
            {
                title: 'View All Vouchers',
                href: '/payment-vouchers',
            },
            {
                title: 'Pending Approval',
                href: '/payment-vouchers/pending',
            },
            {
                title: 'Rejected Vouchers',
                href: '/payment-vouchers/rejected',
            },
        ],
    },
    {
        title: 'General Ledger',
        icon: FolderTree,
        items: [
            {
                title: 'View Transactions',
                href: '/ledgers/transactions',
            },
            {
                title: 'Chart of Accounts',
                href: '/ledgers/chart-of-accounts',
            },
        ],
    },
];

const reportsNavItems: NavItem[] = [
    {
        title: 'Financial Reports',
        icon: BarChart3,
        items: [
            {
                title: 'Monthly Report',
                href: '/financial-reports/monthly',
            },
            {
                title: 'Department Report',
                href: '/financial-reports/department',
            },
        ],
    },
    {
        title: 'Document Management',
        href: '/documents',
        icon: FileText,
    },
    {
        title: 'Memos',
        href: '/memos',
        icon: Mail,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Department Management',
        href: '/departments',
        icon: Building2,
    },
    {
        title: 'User Management',
        href: '/users',
        icon: Users,
    },
    {
        title: 'Roles & Permissions',
        href: '/roles-permissions',
        icon: ShieldCheck,
    },
    {
        title: 'System Audit Log',
        href: '/system-logs',
        icon: History,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={coreNavItems} label="Financial Operations" />
                <NavMain items={reportsNavItems} label="Reports & Documents" />
                <NavMain items={adminNavItems} label="Administration" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
