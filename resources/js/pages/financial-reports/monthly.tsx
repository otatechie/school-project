import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BarChart3, TrendingDown, TrendingUp } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Financial Reports', href: '/financial-reports/monthly' },
    { title: 'Monthly Report', href: '/financial-reports/monthly' },
];

const monthlyData = [
    { month: 'Jul', spent: 245000, budget: 280000 },
    { month: 'Aug', spent: 268000, budget: 280000 },
    { month: 'Sep', spent: 272000, budget: 280000 },
    { month: 'Oct', spent: 258000, budget: 280000 },
    { month: 'Nov', spent: 265000, budget: 280000 },
    { month: 'Dec', spent: 278000, budget: 280000 },
];

const summary = {
    totalSpent: 1586000,
    totalBudget: 1680000,
    variance: 94000,
    variancePercent: 5.6,
};

export default function MonthlyReport() {
    const underBudget = summary.variance >= 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Monthly Financial Report" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <header className="space-y-1">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href={dashboard().url} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Dashboard</span>
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-semibold text-black dark:text-white">
                        Monthly Financial Report
                    </h1>
                    <p className="text-base text-muted-foreground">
                        Spending vs budget by month (GHS)
                    </p>
                </header>

                <section aria-labelledby="summary-heading">
                    <h2 id="summary-heading" className="sr-only">
                        Summary
                    </h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total spent (6 months)
                                </p>
                                <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                    GHS {summary.totalSpent.toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total budget (6 months)
                                </p>
                                <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                    GHS {summary.totalBudget.toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Variance
                                        </p>
                                        <p
                                            className={`mt-1 text-2xl font-bold ${underBudget ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                                        >
                                            GHS {Math.abs(summary.variance).toLocaleString()}{' '}
                                            {underBudget ? 'under' : 'over'}
                                        </p>
                                        <p className="mt-0.5 text-sm text-muted-foreground">
                                            {summary.variancePercent}% of budget
                                        </p>
                                    </div>
                                    {underBudget ? (
                                        <TrendingDown className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    ) : (
                                        <TrendingUp className="h-8 w-8 text-red-600 dark:text-red-400" />
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <section aria-labelledby="chart-heading">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle id="chart-heading" className="text-base font-semibold text-black dark:text-white">
                                Spending by month
                            </CardTitle>
                            <CardDescription>
                                Budget vs actual expenditure (GHS)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[320px] min-h-[320px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={monthlyData}
                                        margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={{ stroke: 'hsl(var(--border))' }}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            cursor={false}
                                            formatter={(value: number | string | (number | string)[] | undefined) => {
                                                if (value === undefined) return ['', ''];
                                                const val = Array.isArray(value) ? value[0] : value;
                                                return [`GHS ${Number(val).toLocaleString()}`, ''];
                                            }}
                                            labelFormatter={(label) => `Month: ${label}`}
                                            contentStyle={{ fontSize: 12 }}
                                        />
                                        <Bar dataKey="budget" fill="#94a3b8" name="Budget" radius={[2, 2, 0, 0]} />
                                        <Bar dataKey="spent" fill="#0ea5e9" name="Spent" radius={[2, 2, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </AppLayout>
    );
}
