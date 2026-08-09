import { Head, Link, router } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Check, Edit, Send } from 'lucide-react';
import { useState } from 'react';
import VoucherAttachments, {
    type Attachment,
} from '@/components/voucher-attachments';
import ConfirmDialog from '@/components/confirm-dialog';
import FlashMessages from '@/components/flash-messages';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import paymentVouchers from '@/routes/payment-vouchers';
import type { BreadcrumbItem } from '@/types';

/** What staff read. The stored status stays 'rejected'. */
const STATUS_LABELS: Record<string, string> = {
    draft: 'Draft',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Returned',
    paid: 'Paid',
};

const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    pending:
        'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    approved:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

const PAYMENT_METHODS: Record<string, string> = {
    cheque: 'Cheque',
    cash: 'Cash',
    bank_transfer: 'Bank transfer',
    mobile_money: 'Mobile money',
};

type Person = { id: string; name: string } | null;

type LedgerEntry = {
    id: string;
    reference: string;
    entry_date_label: string | null;
    description: string;
    debit: string | number;
    credit: string | number;
    account?: { id: string; code: string; name: string } | null;
};

type Voucher = {
    id: string;
    voucher_number: string;
    status: string;
    voucher_date_label: string | null;
    submitted_at_label: string | null;
    approved_at_label: string | null;
    rejected_at_label: string | null;
    paid_at_label: string | null;
    payee_name: string;
    payee_account_number: string | null;
    payee_bank: string | null;
    payee_phone: string | null;
    description: string;
    amount: string | number;
    payment_method: string;
    cheque_number: string | null;
    payment_reference: string | null;
    budget_line: string;
    budget_code: string | null;
    rejection_reason: string | null;
    department?: { id: string; name: string; code: string } | null;
    creator?: Person;
    approver?: Person;
    rejector?: Person;
    payer?: Person;
    ledger_entries?: LedgerEntry[];
};

type Props = {
    voucher: Voucher;
    attachments: Attachment[];
    canUpdate: boolean;
};

const money = (amount: string | number): string =>
    (typeof amount === 'string' ? parseFloat(amount) : amount).toLocaleString(
        undefined,
        { minimumFractionDigits: 2 },
    );

/**
 * An optional field nobody filled in. A dash leaves the reader guessing whether
 * the value is missing or simply does not exist; this says which.
 */
function NotGiven() {
    return <span className="text-muted-foreground">Not given</span>;
}

function Detail({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-sm text-black dark:text-white">{children}</dd>
        </div>
    );
}

export default function Show({ voucher, attachments, canUpdate }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Payment vouchers', href: paymentVouchers.index().url },
        { title: voucher.voucher_number, href: '#' },
    ];

    // The server decides whether this voucher may still be changed; the button
    // only mirrors that answer.
    const editable =
        canUpdate && ['draft', 'rejected'].includes(voucher.status);

    const entries = voucher.ledger_entries ?? [];

    const [confirmingSubmit, setConfirmingSubmit] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const submitVoucher = () => {
        setSubmitting(true);
        router.post(
            paymentVouchers.submit({ voucher: voucher.id }).url,
            {},
            {
                onFinish: () => {
                    setSubmitting(false);
                    setConfirmingSubmit(false);
                },
            },
        );
    };

    // Only steps that have actually happened. A draft has no approver, and
    // listing empty rows for approval and payment tells the reader nothing
    // except that the future has not occurred yet.
    const history = [
        voucher.creator && {
            label: 'Prepared',
            who: voucher.creator.name,
            when: voucher.submitted_at_label
                ? `Submitted ${voucher.submitted_at_label}`
                : null,
        },
        voucher.approver && {
            label: 'Approved',
            who: voucher.approver.name,
            when: voucher.approved_at_label,
        },
        voucher.rejector && {
            label: 'Returned',
            who: voucher.rejector.name,
            when: voucher.rejected_at_label,
        },
        voucher.payer && {
            label: 'Paid',
            who: voucher.payer.name,
            when: voucher.paid_at_label,
        },
    ].filter((step): step is NonNullable<typeof step> => Boolean(step));

    const nextStep = {
        draft: 'Waiting to be submitted for approval.',
        pending: 'Waiting for an approver.',
        approved: 'Approved. Waiting to be paid.',
        rejected: 'Returned for correction. Edit it and submit it again.',
        paid: null,
    }[voucher.status];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={voucher.voucher_number} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <FlashMessages />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="font-mono text-2xl font-semibold text-black md:text-3xl dark:text-white">
                                {voucher.voucher_number}
                            </h1>
                            <Badge className={statusColors[voucher.status]}>
                                {STATUS_LABELS[voucher.status] ??
                                    voucher.status}
                            </Badge>
                        </div>
                        <p className="text-2xl font-semibold text-black tabular-nums dark:text-white">
                            GHS {money(voucher.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Raised {voucher.voucher_date_label ?? '—'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link
                                href={paymentVouchers.index().url}
                                className="gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Back to vouchers</span>
                            </Link>
                        </Button>
                        {editable && voucher.status === 'draft' && (
                            <Button
                                variant="outline"
                                className="gap-2"
                                onClick={() => setConfirmingSubmit(true)}
                            >
                                <Send className="h-4 w-4" />
                                <span>Submit</span>
                            </Button>
                        )}
                        {editable && (
                            <Button asChild>
                                <Link
                                    href={
                                        paymentVouchers.edit({
                                            voucher: voucher.id,
                                        }).url
                                    }
                                    className="gap-2"
                                >
                                    <Edit className="h-4 w-4" />
                                    <span>Edit voucher</span>
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {voucher.status === 'rejected' && (
                    <div className="rounded-md bg-red-50 px-3 py-2.5 dark:bg-red-950/20">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                            <div>
                                <p className="text-sm font-medium text-red-900 dark:text-red-200">
                                    Returned for correction
                                </p>
                                <p className="mt-0.5 text-sm text-red-900 dark:text-red-200">
                                    {voucher.rejection_reason || (
                                        <span className="italic opacity-80">
                                            No reason was recorded.
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Voucher details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <Detail label="Payee">{voucher.payee_name}</Detail>
                            <Detail label="Bank">
                                {voucher.payee_bank ?? <NotGiven />}
                            </Detail>
                            <Detail label="Account number">
                                {voucher.payee_account_number ? (
                                    <span className="font-mono">
                                        {voucher.payee_account_number}
                                    </span>
                                ) : (
                                    <NotGiven />
                                )}
                            </Detail>
                            <Detail label="Phone">
                                {voucher.payee_phone ?? <NotGiven />}
                            </Detail>
                            <Detail label="Department">
                                {voucher.department?.name ?? <NotGiven />}
                            </Detail>
                            <Detail label="Payment method">
                                {PAYMENT_METHODS[voucher.payment_method] ??
                                    voucher.payment_method}
                            </Detail>
                            {voucher.cheque_number && (
                                <Detail label="Cheque number">
                                    <span className="font-mono">
                                        {voucher.cheque_number}
                                    </span>
                                </Detail>
                            )}
                            {voucher.payment_reference && (
                                <Detail label="Payment reference">
                                    <span className="font-mono">
                                        {voucher.payment_reference}
                                    </span>
                                </Detail>
                            )}
                            <Detail label="Budget line">
                                {voucher.budget_line}
                            </Detail>
                            {voucher.budget_code && (
                                <Detail label="Budget code">
                                    <span className="font-mono">
                                        {voucher.budget_code}
                                    </span>
                                </Detail>
                            )}
                        </dl>

                        <Separator />

                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                                Description
                            </p>
                            <p className="text-sm whitespace-pre-line text-black dark:text-white">
                                {voucher.description}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ol className="space-y-4">
                            {history.map((step) => (
                                <li key={step.label} className="flex gap-3">
                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                    <div className="space-y-0.5">
                                        <p className="text-sm text-black dark:text-white">
                                            {step.label} by {step.who}
                                        </p>
                                        {step.when && (
                                            <p className="text-sm text-muted-foreground">
                                                {step.when}
                                            </p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ol>
                        {nextStep && (
                            <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
                                {nextStep}
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <VoucherAttachments
                            voucherId={voucher.id}
                            attachments={attachments}
                            canUpload={false}
                        />
                    </CardContent>
                </Card>

                {voucher.status === 'paid' && entries.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Ledger entries</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/30">
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                Reference
                                            </th>
                                            <th className="hidden px-4 py-3 text-left text-sm font-semibold text-black lg:table-cell dark:text-white">
                                                Date
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-white">
                                                Account
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                                                Debit
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-black dark:text-white">
                                                Credit
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entries.map((entry) => (
                                            <tr
                                                key={entry.id}
                                                className="border-b border-border transition-colors hover:bg-muted/50"
                                            >
                                                <td className="px-4 py-3">
                                                    <code className="rounded-md bg-muted px-2 py-1 font-mono text-sm font-medium text-muted-foreground">
                                                        {entry.reference}
                                                    </code>
                                                </td>
                                                <td className="hidden px-4 py-3 text-sm whitespace-nowrap text-muted-foreground lg:table-cell">
                                                    {entry.entry_date_label}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="text-sm text-muted-foreground">
                                                        {entry.account?.code ??
                                                            '—'}
                                                    </span>
                                                    <span className="block text-sm text-black dark:text-white">
                                                        {entry.account?.name ??
                                                            '—'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-black tabular-nums dark:text-white">
                                                    {parseFloat(
                                                        String(entry.debit),
                                                    ) > 0
                                                        ? money(entry.debit)
                                                        : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-black tabular-nums dark:text-white">
                                                    {parseFloat(
                                                        String(entry.credit),
                                                    ) > 0
                                                        ? money(entry.credit)
                                                        : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <ConfirmDialog
                open={confirmingSubmit}
                onOpenChange={setConfirmingSubmit}
                title="Submit for approval?"
                description="Once submitted you cannot edit this voucher. An approver must return it before you can change anything."
                confirmLabel="Submit"
                processing={submitting}
                onConfirm={submitVoucher}
            />
        </AppLayout>
    );
}
