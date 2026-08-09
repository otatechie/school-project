import { Link, usePage } from '@inertiajs/react';
import {
    Banknote,
    BookOpen,
    Building2,
    ClipboardCheck,
    History,
    LayoutGrid,
    Mail,
    Paperclip,
    PieChart,
    Receipt,
    ShieldCheck,
    Users,
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
import departments from '@/routes/departments';
import documents from '@/routes/documents';
import financialReports from '@/routes/financial-reports';
import ledgers from '@/routes/ledgers';
import memos from '@/routes/memos';
import paymentVouchers from '@/routes/payment-vouchers';
import rolesPermissions from '@/routes/roles-permissions';
import systemLogs from '@/routes/system-logs';
import users from '@/routes/users';
import type { NavItem, SharedData } from '@/types';
import AppLogo from './app-logo';

/**
 * Navigation follows the money: prepare a voucher, approve it, pay it, then
 * record it. Reports and administration sit below that daily path.
 *
 * Pages that create records are reached from the list they belong to, not
 * from the sidebar — a "Create" entry beside "All vouchers" duplicates the
 * button already on the list page.
 */
const operationsNav: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Payment vouchers',
        href: paymentVouchers.index(),
        icon: Receipt,
    },
    {
        title: 'Awaiting approval',
        href: paymentVouchers.pending(),
        icon: ClipboardCheck,
    },
    {
        title: 'Memos',
        href: memos.index(),
        icon: Mail,
    },
];

const recordsNav: NavItem[] = [
    {
        title: 'Supporting documents',
        href: documents.index(),
        icon: Paperclip,
    },
    {
        title: 'Transactions',
        href: ledgers.transactions(),
        icon: Banknote,
    },
    {
        title: 'Chart of accounts',
        href: ledgers.chartOfAccounts(),
        icon: BookOpen,
    },
    {
        title: 'Reports',
        icon: PieChart,
        items: [
            { title: 'By month', href: financialReports.monthly().url },
            { title: 'By department', href: financialReports.department().url },
        ],
    },
];

const adminNav: NavItem[] = [
    {
        title: 'Departments',
        href: departments.index(),
        icon: Building2,
    },
    {
        title: 'Staff',
        href: users.index(),
        icon: Users,
    },
    {
        title: 'Roles',
        href: rolesPermissions.index(),
        icon: ShieldCheck,
    },
    {
        title: 'Audit log',
        href: systemLogs.index(),
        icon: History,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user?.role === 'admin';

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
                <NavMain items={operationsNav} label="Payments" />
                <NavMain items={recordsNav} label="Records" />
                {/* Administration is authorised server-side; hiding it here
                    keeps the sidebar honest rather than offering dead ends. */}
                {isAdmin && <NavMain items={adminNav} label="Administration" />}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
