import {Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import InputError from '@/components/input-error';
import VoucherCheckPanel from '@/components/voucher-check-panel';
import { useVoucherChecks } from '@/hooks/use-voucher-checks';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import FlashMessages from '@/components/flash-messages';
import AppLayout from '@/layouts/app-layout';
import paymentVouchers from '@/routes/payment-vouchers';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payment Vouchers',
        href: paymentVouchers.index().url,
    },
    {
        title: 'Create',
        href: '#',
    },
];

type Department = { id: string; name: string; code: string };

const FIELD_LABELS: Record<string, string> = {
    voucher_date: 'Voucher Date',
    department_id: 'Department',
    payee_name: 'Payee Name',
    payee_phone: 'Payee Phone',
    payee_bank: 'Bank Name',
    payee_account_number: 'Account Number',
    amount: 'Amount',
    payment_method: 'Payment Method',
    cheque_number: 'Cheque Number',
    payment_reference: 'Payment Reference',
    description: 'Description',
    budget_line: 'Budget Line',
    budget_code: 'Budget Code',
};

export default function Create({ departments }: { departments: Department[] }) {
    const { data, setData, post, processing, errors, isDirty } = useForm({
        voucher_date: new Date().toISOString().split('T')[0],
        payee_name: '',
        payee_account_number: '',
        payee_bank: '',
        payee_phone: '',
        description: '',
        amount: '',
        payment_method: 'cheque',
        cheque_number: '',
        payment_reference: '',
        budget_line: '',
        budget_code: '',
        department_id: '',
    });

    const errorList = Object.entries(errors) as [string, string][];

    const { findings, suggestedBudgetLine } = useVoucherChecks({
        payee_name: data.payee_name,
        amount: data.amount,
        description: data.description,
        budget_line: data.budget_line,
        department_id: data.department_id,
    });

    const showSuggestion =
        suggestedBudgetLine !== null &&
        suggestedBudgetLine.toLowerCase() !== data.budget_line.toLowerCase();

    // Warn before losing a part-filled voucher to a refresh or tab close.
    useEffect(() => {
        const warn = (e: BeforeUnloadEvent) => {
            if (isDirty) e.preventDefault();
        };
        window.addEventListener('beforeunload', warn);

        return () => window.removeEventListener('beforeunload', warn);
    }, [isDirty]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(paymentVouchers.store().url, {
            onError: () => {
                document
                    .getElementById('voucher-error-summary')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Payment Voucher" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4 md:p-6">
                <FlashMessages />
                <div className="space-y-2">
                    <Button variant="ghost" size="sm" asChild className="-ml-2">
                        <Link
                            href={paymentVouchers.index().url}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Payment Vouchers</span>
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold text-black md:text-3xl dark:text-white">
                        Create Payment Voucher
                    </h1>
                </div>

                <Card className="max-w-3xl py-5">
                    <CardContent>
                        {errorList.length > 0 && (
                            <div
                                id="voucher-error-summary"
                                role="alert"
                                tabIndex={-1}
                                className="mb-6 rounded-md border border-destructive/50 bg-destructive/5 px-4 py-3"
                            >
                                <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
                                    <AlertCircle
                                        className="h-4 w-4 shrink-0"
                                        aria-hidden="true"
                                    />
                                    This voucher could not be saved &mdash;{' '}
                                    {errorList.length}{' '}
                                    {errorList.length === 1
                                        ? 'field needs'
                                        : 'fields need'}{' '}
                                    attention
                                </p>
                                <ul className="mt-2 list-inside list-disc space-y-1">
                                    {errorList.map(([field, message]) => (
                                        <li key={field} className="text-sm">
                                            <a
                                                href={`#${field}`}
                                                className="text-destructive underline-offset-4 hover:underline"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    const el =
                                                        document.getElementById(
                                                            field,
                                                        );
                                                    el?.scrollIntoView({
                                                        behavior: 'smooth',
                                                        block: 'center',
                                                    });
                                                    el?.focus();
                                                }}
                                            >
                                                {FIELD_LABELS[field] ?? field}
                                            </a>
                                            : {message}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                    Voucher
                                </h2>

                                <div className="grid gap-x-5 gap-y-3.5 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="voucher_date">
                                            Voucher Date{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="voucher_date"
                                            type="date"
                                            value={data.voucher_date}
                                            onChange={(e) =>
                                                setData(
                                                    'voucher_date',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            autoFocus
                                        />
                                        <InputError
                                            message={errors.voucher_date}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="department_id">
                                            Department{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={data.department_id}
                                            onValueChange={(value) =>
                                                setData('department_id', value)
                                            }
                                        >
                                            <SelectTrigger id="department_id">
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map((d) => (
                                                    <SelectItem
                                                        key={d.id}
                                                        value={d.id}
                                                    >
                                                        {d.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors.department_id}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                    Payee
                                </h2>

                                <div className="grid gap-x-5 gap-y-3.5 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="payee_name">
                                            Payee Name{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="payee_name"
                                            type="text"
                                            value={data.payee_name}
                                            onChange={(e) =>
                                                setData(
                                                    'payee_name',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Enter payee name"
                                            required
                                        />
                                        <InputError
                                            message={errors.payee_name}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="payee_phone">
                                            Payee Phone
                                        </Label>
                                        <Input
                                            id="payee_phone"
                                            type="tel"
                                            value={data.payee_phone}
                                            onChange={(e) =>
                                                setData(
                                                    'payee_phone',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g., +233 XX XXX XXXX"
                                        />
                                        <InputError
                                            message={errors.payee_phone}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="payee_bank">
                                            Bank Name
                                        </Label>
                                        <Input
                                            id="payee_bank"
                                            type="text"
                                            value={data.payee_bank}
                                            onChange={(e) =>
                                                setData(
                                                    'payee_bank',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g., GCB Bank"
                                        />
                                        <InputError
                                            message={errors.payee_bank}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="payee_account_number">
                                            Account Number
                                        </Label>
                                        <Input
                                            id="payee_account_number"
                                            type="text"
                                            value={data.payee_account_number}
                                            onChange={(e) =>
                                                setData(
                                                    'payee_account_number',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Enter account number"
                                        />
                                        <InputError
                                            message={
                                                errors.payee_account_number
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                    Payment
                                </h2>

                                <div className="grid gap-x-5 gap-y-3.5 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="amount">
                                            Amount{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <div className="relative">
                                            <span
                                                className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground"
                                                aria-hidden="true"
                                            >
                                                GH₵
                                            </span>
                                            <Input
                                                id="amount"
                                                type="text"
                                                inputMode="decimal"
                                                value={data.amount}
                                                onChange={(e) =>
                                                    setData(
                                                        'amount',
                                                        e.target.value.replace(
                                                            /[^\d.]/g,
                                                            '',
                                                        ),
                                                    )
                                                }
                                                placeholder="0.00"
                                                className="pl-12 tabular-nums"
                                                required
                                            />
                                        </div>
                                        <InputError message={errors.amount} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="payment_method">
                                            Payment Method{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={data.payment_method}
                                            onValueChange={(value) =>
                                                setData('payment_method', value)
                                            }
                                        >
                                            <SelectTrigger id="payment_method">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cheque">
                                                    Cheque
                                                </SelectItem>
                                                <SelectItem value="bank_transfer">
                                                    Bank Transfer
                                                </SelectItem>
                                                <SelectItem value="cash">
                                                    Cash
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors.payment_method}
                                        />
                                    </div>

                                    {data.payment_method === 'cheque' && (
                                        <div className="space-y-1.5">
                                            <Label htmlFor="cheque_number">
                                                Cheque Number{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="cheque_number"
                                                type="text"
                                                value={data.cheque_number}
                                                onChange={(e) =>
                                                    setData(
                                                        'cheque_number',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Enter cheque number"
                                            />
                                            <InputError
                                                message={errors.cheque_number}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <Label htmlFor="payment_reference">
                                            Payment Reference
                                        </Label>
                                        <Input
                                            id="payment_reference"
                                            type="text"
                                            value={data.payment_reference}
                                            onChange={(e) =>
                                                setData(
                                                    'payment_reference',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Optional reference number"
                                        />
                                        <InputError
                                            message={errors.payment_reference}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="description">
                                    Description{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Describe the purpose of this payment..."
                                    rows={4}
                                    required
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                                    Budget
                                </h2>

                                <div className="grid gap-x-5 gap-y-3.5 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="budget_line">
                                            Budget Line{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="budget_line"
                                            type="text"
                                            value={data.budget_line}
                                            onChange={(e) =>
                                                setData(
                                                    'budget_line',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g., Office Supplies"
                                            required
                                        />
                                        {showSuggestion && (
                                            <p className="text-sm text-muted-foreground">
                                                Based on the description, this
                                                looks like{' '}
                                                <button
                                                    type="button"
                                                    className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
                                                    onClick={() =>
                                                        setData(
                                                            'budget_line',
                                                            suggestedBudgetLine,
                                                        )
                                                    }
                                                >
                                                    {suggestedBudgetLine}
                                                </button>
                                                . Click to use it.
                                            </p>
                                        )}
                                        <InputError
                                            message={errors.budget_line}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="budget_code">
                                            Budget Code
                                        </Label>
                                        <Input
                                            id="budget_code"
                                            type="text"
                                            value={data.budget_code}
                                            onChange={(e) =>
                                                setData(
                                                    'budget_code',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Optional budget code"
                                        />
                                        <InputError
                                            message={errors.budget_code}
                                        />
                                    </div>
                                </div>
                            </div>

                            <VoucherCheckPanel findings={findings} />

                            <Separator />

                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                    disabled={processing}
                                >
                                    <Link href={paymentVouchers.index().url}>
                                        Cancel
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Payment Voucher'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
