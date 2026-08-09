import { Head, Link, router } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import financialReports from '@/routes/financial-reports';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Expenditure by department',
        href: financialReports.department().url,
    },
];

type Row = {
    id: string;
    name: string;
    code: string;
    paidTotal: number;
    paidCount: number;
    pendingTotal: number;
    pendingCount: number;
};

type Props = {
    year: number;
    years: number[];
    departments: Row[];
    total: number;
};

const money = (v: number): string =>
    v.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

export default function DepartmentReport({
    year,
    years,
    departments,
    total,
}: Props) {
    const peak = Math.max(...departments.map((d) => d.paidTotal), 1);
    const options = years.length > 0 ? years : [year];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Expenditure by department" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4 md:p-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-black md:text-3xl dark:text-white">
                            Expenditure by department
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Vouchers paid in {year}, in GHS.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Select
                            value={String(year)}
                            onValueChange={(v) =>
                                router.get(
                                    financialReports.department().url,
                                    { year: v },
                                    { preserveState: true },
                                )
                            }
                        >
                            <SelectTrigger className="w-full sm:w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {options.map((y) => (
                                    <SelectItem key={y} value={String(y)}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" asChild>
                            <Link
                                href={`${financialReports.print('department').url}?year=${year}`}
                                className="gap-2"
                            >
                                <Printer className="h-4 w-4" />
                                Print report
                            </Link>
                        </Button>
                    </div>
                </header>

                <Card className="py-5">
                    <CardContent className="space-y-4">
                        <CardDescription>
                            Total paid in {year}:{' '}
                            <span className="font-semibold text-foreground tabular-nums">
                                GHS {money(total)}
                            </span>
                        </CardDescription>

                        {departments.length === 0 ? (
                            <div className="py-10 text-center">
                                <p className="text-sm font-medium text-black dark:text-white">
                                    No departmental activity in {year}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Departments appear here once they have paid
                                    or pending vouchers.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/30">
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                Department
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                Share of paid
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                                                Paid
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                                                Pending
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {departments.map((d) => (
                                            <tr
                                                key={d.id}
                                                className="border-b border-border"
                                            >
                                                <td className="px-4 py-2.5 whitespace-nowrap">
                                                    <span className="text-sm text-black dark:text-white">
                                                        {d.name}
                                                    </span>
                                                    <span className="block text-xs text-muted-foreground">
                                                        {d.code}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <div
                                                        className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted"
                                                        aria-hidden="true"
                                                    >
                                                        <div
                                                            className="h-full rounded-full bg-foreground/70"
                                                            style={{
                                                                width: `${Math.round((d.paidTotal / peak) * 100)}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                                                    <span className="text-sm text-black tabular-nums dark:text-white">
                                                        {d.paidTotal > 0
                                                            ? money(d.paidTotal)
                                                            : '—'}
                                                    </span>
                                                    <span className="block text-xs text-muted-foreground tabular-nums">
                                                        {d.paidCount} voucher
                                                        {d.paidCount !== 1
                                                            ? 's'
                                                            : ''}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                                                    <span className="text-sm text-muted-foreground tabular-nums">
                                                        {d.pendingTotal > 0
                                                            ? money(
                                                                  d.pendingTotal,
                                                              )
                                                            : '—'}
                                                    </span>
                                                    <span className="block text-xs text-muted-foreground tabular-nums">
                                                        {d.pendingCount} voucher
                                                        {d.pendingCount !== 1
                                                            ? 's'
                                                            : ''}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t-2 border-border font-semibold">
                                            <td
                                                className="px-4 py-3 text-sm text-black dark:text-white"
                                                colSpan={2}
                                            >
                                                Total
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-black tabular-nums dark:text-white">
                                                {money(total)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-muted-foreground tabular-nums">
                                                {money(
                                                    departments.reduce(
                                                        (s, d) =>
                                                            s + d.pendingTotal,
                                                        0,
                                                    ),
                                                )}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
