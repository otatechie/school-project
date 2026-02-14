import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Building2 } from 'lucide-react';
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
    { title: 'Financial Reports', href: '/financial-reports/department' },
    { title: 'Department Report', href: '/financial-reports/department' },
];

const departmentData = [
    { name: 'Finance', spent: 425000 },
    { name: 'Procurement', spent: 380000 },
    { name: 'Admin', spent: 198000 },
    { name: 'HR', spent: 156000 },
    { name: 'IT', spent: 127000 },
];

const totalSpent = departmentData.reduce((sum, d) => sum + d.spent, 0);

export default function DepartmentReport() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Department Financial Report" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <header className="space-y-1">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link href={dashboard().url} className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Dashboard</span>
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-semibold text-black dark:text-white">
                        Department Financial Report
                    </h1>
                    <p className="text-base text-muted-foreground">
                        Expenditure by department (GHS)
                    </p>
                </header>

                <section aria-labelledby="summary-heading">
                    <h2 id="summary-heading" className="sr-only">
                        Summary
                    </h2>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Total expenditure
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-black dark:text-white">
                                        GHS {totalSpent.toLocaleString()}
                                    </p>
                                </div>
                                <Building2 className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section aria-labelledby="chart-heading">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle id="chart-heading" className="text-base font-semibold text-black dark:text-white">
                                Spending by department
                            </CardTitle>
                            <CardDescription>
                                Current period (GHS)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[320px] min-h-[320px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={departmentData}
                                        layout="vertical"
                                        margin={{ top: 8, right: 24, left: 64, bottom: 8 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                                        <XAxis
                                            type="number"
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            tick={{ fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                            width={56}
                                        />
                                        <Tooltip
                                            cursor={false}
                                            formatter={(value: number | string | (number | string)[] | undefined) => {
                                                if (value === undefined) return ['', ''];
                                                const val = Array.isArray(value) ? value[0] : value;
                                                return [`GHS ${Number(val).toLocaleString()}`, 'Spent'];
                                            }}
                                            contentStyle={{ fontSize: 12 }}
                                        />
                                        <Bar dataKey="spent" fill="#0ea5e9" name="Spent" radius={[0, 2, 2, 0]} />
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
