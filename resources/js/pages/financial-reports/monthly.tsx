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
    { title: 'Monthly Report', href: financialReports.monthly().url },
];

type Month = {
    month: string;
    label: string;
    total: number;
    vouchers: number;
};

type Props = {
    year: number;
    years: number[];
    months: Month[];
    total: number;
};

const money = (v: number): string =>
    v.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

export default function MonthlyReport({ year, years, months, total }: Props) {
    const peak = Math.max(...months.map((m) => m.total), 1);
    const options = years.length > 0 ? years : [year];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Monthly Report" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4 md:p-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-black md:text-3xl dark:text-white">
                            Monthly Expenditure
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
                                    financialReports.monthly().url,
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
                                href={`${financialReports.print('monthly').url}?year=${year}`}
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

                        {total === 0 ? (
                            <div className="py-10 text-center">
                                <p className="text-sm font-medium text-black dark:text-white">
                                    No payments recorded in {year}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Months appear here once vouchers are marked
                                    paid.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/30">
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                Month
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                Share
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                                                Vouchers
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {months.map((m) => (
                                            <tr
                                                key={m.month}
                                                className="border-b border-border"
                                            >
                                                <td className="px-4 py-2.5 text-sm whitespace-nowrap text-black dark:text-white">
                                                    {m.label}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <div
                                                        className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted"
                                                        aria-hidden="true"
                                                    >
                                                        <div
                                                            className="h-full rounded-full bg-foreground/70"
                                                            style={{
                                                                width: `${Math.round((m.total / peak) * 100)}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2.5 text-right text-sm text-muted-foreground tabular-nums">
                                                    {m.vouchers}
                                                </td>
                                                <td className="px-4 py-2.5 text-right text-sm text-black tabular-nums dark:text-white">
                                                    {m.total > 0
                                                        ? money(m.total)
                                                        : '—'}
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
                                                {months.reduce(
                                                    (s, m) => s + m.vouchers,
                                                    0,
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-black tabular-nums dark:text-white">
                                                {money(total)}
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
