import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

export type MonthlyPoint = {
    label: string;
    month: string;
    total: number;
    vouchers: number;
};

export type DepartmentPoint = {
    name: string;
    code: string;
    total: number;
    vouchers: number;
};

const cedis = (value: number): string =>
    new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GHS',
        maximumFractionDigits: 0,
    }).format(value);

/** Compact axis labels — "GHS 1.2M" reads better than the full figure. */
const compact = (value: number): string => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
    return String(value);
};

type TooltipEntry = {
    payload: MonthlyPoint | DepartmentPoint;
};

function ChartTooltip({
    active,
    payload,
    titleKey,
}: {
    active?: boolean;
    payload?: TooltipEntry[];
    titleKey: 'month' | 'name';
}) {
    if (!active || !payload?.length) return null;

    const point = payload[0].payload;
    const title =
        titleKey === 'month'
            ? (point as MonthlyPoint).month
            : (point as DepartmentPoint).name;

    return (
        <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm shadow-md">
            <p className="font-medium text-popover-foreground">{title}</p>
            <p className="mt-0.5 text-popover-foreground tabular-nums">
                {cedis(point.total)}
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
                {point.vouchers} voucher{point.vouchers === 1 ? '' : 's'}
            </p>
        </div>
    );
}

const axisStyle = {
    fontSize: 12,
    fill: 'var(--muted-foreground)',
};

/**
 * Paid expenditure over the last twelve months.
 *
 * Rendered as a table for screen readers — a bar chart alone is not an
 * accessible way to publish public financial figures.
 */
export function MonthlyExpenditureChart({ data }: { data: MonthlyPoint[] }) {
    const hasData = data.some((d) => d.total > 0);

    if (!hasData) {
        return (
            <p className="py-8 text-center text-sm text-muted-foreground">
                No payments recorded in the last twelve months.
            </p>
        );
    }

    return (
        <>
            <div className="h-56 w-full" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 4, right: 4, bottom: 0, left: -12 }}
                    >
                        <CartesianGrid
                            vertical={false}
                            stroke="var(--border)"
                            strokeDasharray="3 3"
                        />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tick={axisStyle}
                        />
                        <YAxis
                            tickFormatter={compact}
                            tickLine={false}
                            axisLine={false}
                            tick={axisStyle}
                            width={48}
                        />
                        <Tooltip
                            cursor={{ fill: 'var(--muted)' }}
                            content={<ChartTooltip titleKey="month" />}
                        />
                        <Bar
                            dataKey="total"
                            fill="var(--primary)"
                            radius={[3, 3, 0, 0]}
                            maxBarSize={44}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <table className="sr-only">
                <caption>Paid expenditure by month</caption>
                <thead>
                    <tr>
                        <th scope="col">Month</th>
                        <th scope="col">Total</th>
                        <th scope="col">Vouchers</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={row.month}>
                            <th scope="row">{row.month}</th>
                            <td>{cedis(row.total)}</td>
                            <td>{row.vouchers}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}

/** Distinct hues so each department is separable without reading the axis. */
const DEPARTMENT_COLOURS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
];

/**
 * Paid expenditure by department for the current year, largest first.
 * Horizontal bars so long department names stay readable.
 */
export function DepartmentExpenditureChart({
    data,
}: {
    data: DepartmentPoint[];
}) {
    if (data.length === 0) {
        return (
            <p className="py-8 text-center text-sm text-muted-foreground">
                No payments recorded this year.
            </p>
        );
    }

    return (
        <>
            <div
                className="w-full"
                style={{ height: Math.max(140, data.length * 40) }}
                aria-hidden="true"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 0, right: 12, bottom: 0, left: 8 }}
                    >
                        <CartesianGrid
                            horizontal={false}
                            stroke="var(--border)"
                            strokeDasharray="3 3"
                        />
                        <XAxis
                            type="number"
                            tickFormatter={compact}
                            tickLine={false}
                            axisLine={false}
                            tick={axisStyle}
                        />
                        <YAxis
                            type="category"
                            dataKey="code"
                            tickLine={false}
                            axisLine={false}
                            tick={axisStyle}
                            width={52}
                        />
                        <Tooltip
                            cursor={{ fill: 'var(--muted)' }}
                            content={<ChartTooltip titleKey="name" />}
                        />
                        <Bar
                            dataKey="total"
                            radius={[0, 3, 3, 0]}
                            maxBarSize={28}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={entry.code}
                                    fill={
                                        DEPARTMENT_COLOURS[
                                            index % DEPARTMENT_COLOURS.length
                                        ]
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <table className="sr-only">
                <caption>Paid expenditure by department this year</caption>
                <thead>
                    <tr>
                        <th scope="col">Department</th>
                        <th scope="col">Total</th>
                        <th scope="col">Vouchers</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={row.code}>
                            <th scope="row">{row.name}</th>
                            <td>{cedis(row.total)}</td>
                            <td>{row.vouchers}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}
