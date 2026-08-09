import {Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    Copy,
    Info,
    Loader2,
    Lock,
    Search,
    Sparkles,
    TrendingUp,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import FlashMessages from '@/components/flash-messages';
import TablePagination from '@/components/table-pagination';
import AppLayout from '@/layouts/app-layout';
import paymentVouchers from '@/routes/payment-vouchers';
import type { BreadcrumbItem, Paginated } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Payment Vouchers', href: paymentVouchers.index().url },
    { title: 'Pending Approval', href: '#' },
];

type Voucher = {
    id: string;
    voucher_number: string;
    voucher_date: string;
    payee_name: string;
    amount: string | number;
    description?: string | null;
    budget_line?: string | null;
    department?: { id: string; name: string; code: string } | null;
    creator?: { id: string; name: string } | null;
    submitted_at?: string | null;
};

type Finding = {
    type: 'duplicate' | 'outlier' | 'budget_line';
    severity: 'high' | 'medium' | 'low';
    message: string;
};

type Routing = {
    band: string;
    level: number;
    canApprove: boolean;
    isOwn: boolean;
};

type AiReview = {
    risk: 'low' | 'medium' | 'high';
    summary: string;
    findings: string[];
};

type Props = {
    vouchers: Paginated<Voucher>;
    checks: Record<string, Finding[]>;
    routing: Record<string, Routing>;
    aiEnabled: boolean;
};

const money = (value: string | number): string =>
    (typeof value === 'string' ? parseFloat(value) : value).toLocaleString(
        'en-GB',
        { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    );

const FINDING_ICONS = {
    duplicate: Copy,
    outlier: TrendingUp,
    budget_line: Info,
} as const;

export default function Pending({
    vouchers,
    checks,
    routing,
    aiEnabled,
}: Props) {

    const [searchQuery, setSearchQuery] = useState('');
    const [rejectingFor, setRejectingFor] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [approving, setApproving] = useState<Voucher | null>(null);

    const [reviews, setReviews] = useState<Record<string, AiReview>>({});
    const [reviewing, setReviewing] = useState<string | null>(null);
    const [reviewError, setReviewError] = useState<Record<string, string>>({});

    const items = vouchers.data ?? [];

    // Search filters the current page only; the count below says so plainly
    // rather than implying it searched everything.
    const filtered = searchQuery
        ? items.filter(
              (v) =>
                  v.voucher_number
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                  v.payee_name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()),
          )
        : items;

    const daysPending = (submittedAt?: string | null): number | null => {
        if (!submittedAt) return null;
        const diff = Date.now() - new Date(submittedAt).getTime();
        return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    };

    const isUrgent = (submittedAt?: string | null): boolean => {
        const days = daysPending(submittedAt);
        return days !== null && days >= 3;
    };

    const pendingLabel = (submittedAt?: string | null): string => {
        const days = daysPending(submittedAt);
        if (days === null) return 'unknown';
        if (days === 0) return 'today';
        return `${days} day${days === 1 ? '' : 's'}`;
    };

    const urgentCount = items.filter((v) => isUrgent(v.submitted_at)).length;
    const totalAmount = items.reduce(
        (sum, v) =>
            sum +
            (typeof v.amount === 'string' ? parseFloat(v.amount) : v.amount),
        0,
    );
    const runAiReview = async (id: string) => {
        setReviewing(id);
        setReviewError((prev) => ({ ...prev, [id]: '' }));

        try {
            const response = await fetch(
                paymentVouchers.aiReview({ voucher: id }).url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') ?? '',
                    },
                },
            );
            const data = await response.json();

            if (data.available) {
                setReviews((prev) => ({ ...prev, [id]: data.review }));
            } else {
                setReviewError((prev) => ({ ...prev, [id]: data.message }));
            }
        } catch {
            setReviewError((prev) => ({
                ...prev,
                [id]: 'Could not reach the review service. Use your own judgement.',
            }));
        } finally {
            setReviewing(null);
        }
    };

    const approveVoucher = () => {
        if (!approving) return;

        setSubmitting(true);
        router.post(
            paymentVouchers.review({ voucher: approving.id }).url,
            { action: 'approve' },
            {
                onFinish: () => {
                    setSubmitting(false);
                    setApproving(null);
                },
            },
        );
    };

    const rejectVoucher = (id: string) => {
        if (!rejectionReason.trim()) return;

        setSubmitting(true);
        router.post(
            paymentVouchers.review({ voucher: id }).url,
            { action: 'reject', rejection_reason: rejectionReason },
            {
                onFinish: () => {
                    setSubmitting(false);
                    setRejectingFor(null);
                    setRejectionReason('');
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pending Approval" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">
                <FlashMessages />

                <header>
                    <h1 className="text-2xl font-semibold text-black md:text-3xl dark:text-white">
                        Pending Approval
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Review and decide on submitted vouchers.
                    </p>
                </header>

                <Card className="py-5">
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                <span>
                                    {searchQuery
                                        ? `${filtered.length} of ${items.length} match "${searchQuery}"`
                                        : `${vouchers.total} voucher${vouchers.total === 1 ? '' : 's'}`}
                                    {', '}
                                    <span className="font-semibold text-foreground tabular-nums">
                                        GHS {money(totalAmount)}
                                    </span>
                                </span>
                                {urgentCount > 0 && (
                                    <span className="flex items-center gap-1.5 font-medium text-red-700 dark:text-red-400">
                                        <Clock
                                            className="h-4 w-4"
                                            aria-hidden="true"
                                        />
                                        {urgentCount} waiting 3+ days
                                    </span>
                                )}
                            </CardDescription>
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Filter this page..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                {searchQuery ? (
                                    <>
                                        <Search
                                            className="mb-3 h-10 w-10 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                        <p className="text-sm font-medium text-black dark:text-white">
                                            Nothing on this page matches your
                                            filter
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-3"
                                            onClick={() => setSearchQuery('')}
                                        >
                                            Clear filter
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2
                                            className="mb-3 h-10 w-10 text-green-600 dark:text-green-400"
                                            aria-hidden="true"
                                        />
                                        <p className="text-sm font-medium text-black dark:text-white">
                                            No vouchers awaiting approval
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Everything submitted has been
                                            decided.
                                        </p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {filtered.map((voucher) => {
                                    const findings = checks[voucher.id] ?? [];
                                    const route = routing[voucher.id];
                                    const review = reviews[voucher.id];
                                    const blocked = route && !route.canApprove;

                                    return (
                                        <li key={voucher.id}>
                                            <Card className="py-4">
                                                <CardContent className="space-y-3">
                                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                        <div className="min-w-0 space-y-1">
                                                            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                                                                <span className="font-mono text-sm text-muted-foreground">
                                                                    {
                                                                        voucher.voucher_number
                                                                    }
                                                                </span>
                                                                {/* The amount
                                                                    drives the
                                                                    decision, so
                                                                    it outranks
                                                                    the payee. */}
                                                                <span className="text-base font-semibold text-black tabular-nums dark:text-white">
                                                                    GHS{' '}
                                                                    {money(
                                                                        voucher.amount,
                                                                    )}
                                                                </span>
                                                                <span className="text-sm text-foreground">
                                                                    {
                                                                        voucher.payee_name
                                                                    }
                                                                </span>
                                                            </div>
                                                            {/* One line of
                                                                context, each
                                                                fact stated
                                                                once. */}
                                                            <p className="text-sm text-muted-foreground">
                                                                {voucher
                                                                    .department
                                                                    ?.name ??
                                                                    '—'}
                                                                {' · Prepared by '}
                                                                {voucher.creator
                                                                    ?.name ??
                                                                    '—'}
                                                                {route
                                                                    ? ` · ${route.band}`
                                                                    : ''}
                                                                {' · Waiting '}
                                                                <span
                                                                    className={
                                                                        isUrgent(
                                                                            voucher.submitted_at,
                                                                        )
                                                                            ? 'font-medium text-red-700 dark:text-red-400'
                                                                            : ''
                                                                    }
                                                                >
                                                                    {pendingLabel(
                                                                        voucher.submitted_at,
                                                                    )}
                                                                </span>
                                                            </p>
                                                        </div>

                                                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                                                            {aiEnabled &&
                                                                !review && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="gap-2"
                                                                        disabled={
                                                                            reviewing ===
                                                                            voucher.id
                                                                        }
                                                                        onClick={() =>
                                                                            runAiReview(
                                                                                voucher.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        {reviewing ===
                                                                        voucher.id ? (
                                                                            <>
                                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                                Reviewing
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Sparkles className="h-4 w-4" />
                                                                                AI
                                                                                review
                                                                            </>
                                                                        )}
                                                                    </Button>
                                                                )}
                                                            <Button
                                                                size="sm"
                                                                className="gap-2"
                                                                disabled={
                                                                    blocked
                                                                }
                                                                onClick={() =>
                                                                    setApproving(
                                                                        voucher,
                                                                    )
                                                                }
                                                            >
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                className="gap-2"
                                                                disabled={
                                                                    blocked
                                                                }
                                                                onClick={() => {
                                                                    setRejectionReason(
                                                                        '',
                                                                    );
                                                                    setRejectingFor(
                                                                        rejectingFor ===
                                                                            voucher.id
                                                                            ? null
                                                                            : voucher.id,
                                                                    );
                                                                }}
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                                Return
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {blocked && (
                                                        <p className="flex items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                                                            <Lock
                                                                className="mt-0.5 h-4 w-4 shrink-0"
                                                                aria-hidden="true"
                                                            />
                                                            {route.isOwn
                                                                ? 'You prepared this voucher, so you cannot approve it. It must be decided by another approver.'
                                                                : 'This amount is above your approval limit. It must be decided by a more senior approver.'}
                                                        </p>
                                                    )}

                                                    {findings.length > 0 && (
                                                        <ul className="space-y-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-900 dark:bg-amber-950/30">
                                                            {findings.map(
                                                                (finding) => {
                                                                    const Icon =
                                                                        FINDING_ICONS[
                                                                            finding
                                                                                .type
                                                                        ] ??
                                                                        Info;

                                                                    return (
                                                                        <li
                                                                            key={
                                                                                finding.type
                                                                            }
                                                                            className="flex items-start gap-2 text-sm text-amber-900 dark:text-amber-200"
                                                                        >
                                                                            <Icon
                                                                                className="mt-0.5 h-4 w-4 shrink-0"
                                                                                aria-hidden="true"
                                                                            />
                                                                            <span>
                                                                                {
                                                                                    finding.message
                                                                                }
                                                                            </span>
                                                                        </li>
                                                                    );
                                                                },
                                                            )}
                                                        </ul>
                                                    )}

                                                    {rejectingFor ===
                                                        voucher.id && (
                                                        <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
                                                            <label
                                                                htmlFor={`reason-${voucher.id}`}
                                                                className="text-sm font-medium text-black dark:text-white"
                                                            >
                                                                What needs
                                                                correcting?
                                                            </label>
                                                            <Textarea
                                                                id={`reason-${voucher.id}`}
                                                                value={
                                                                    rejectionReason
                                                                }
                                                                onChange={(e) =>
                                                                    setRejectionReason(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="e.g. The supplier invoice is not attached."
                                                                rows={2}
                                                                autoFocus
                                                                autoComplete="off"
                                                                data-1p-ignore
                                                                data-lpignore="true"
                                                            />
                                                            <p className="text-xs text-muted-foreground">
                                                                The preparer
                                                                sees this, so
                                                                say exactly what
                                                                to correct.
                                                            </p>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    disabled={
                                                                        submitting ||
                                                                        !rejectionReason.trim()
                                                                    }
                                                                    onClick={() =>
                                                                        rejectVoucher(
                                                                            voucher.id,
                                                                        )
                                                                    }
                                                                >
                                                                    Return for
                                                                    correction
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setRejectingFor(
                                                                            null,
                                                                        );
                                                                        setRejectionReason(
                                                                            '',
                                                                        );
                                                                    }}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                                {!rejectionReason.trim() && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        Add a
                                                                        reason
                                                                        to
                                                                        continue
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {reviewError[
                                                        voucher.id
                                                    ] && (
                                                        <p
                                                            className="text-sm text-muted-foreground"
                                                            role="status"
                                                        >
                                                            {
                                                                reviewError[
                                                                    voucher.id
                                                                ]
                                                            }
                                                        </p>
                                                    )}

                                                    {review && (
                                                        <div
                                                            className={`rounded-md border px-3 py-2.5 ${
                                                                review.risk ===
                                                                'high'
                                                                    ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30'
                                                                    : review.risk ===
                                                                        'medium'
                                                                      ? 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30'
                                                                      : 'border-border bg-muted/40'
                                                            }`}
                                                        >
                                                            <p className="flex items-center gap-2 text-sm font-medium text-black dark:text-white">
                                                                <Sparkles
                                                                    className="h-4 w-4 shrink-0"
                                                                    aria-hidden="true"
                                                                />
                                                                AI review
                                                                &mdash;{' '}
                                                                <span className="capitalize">
                                                                    {
                                                                        review.risk
                                                                    }{' '}
                                                                    attention
                                                                </span>
                                                            </p>
                                                            <p className="mt-1 text-sm text-muted-foreground">
                                                                {review.summary}
                                                            </p>
                                                            {review.findings
                                                                .length > 0 && (
                                                                <ul className="mt-2 list-inside list-disc space-y-1">
                                                                    {review.findings.map(
                                                                        (
                                                                            finding,
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    finding
                                                                                }
                                                                                className="text-sm text-muted-foreground"
                                                                            >
                                                                                {
                                                                                    finding
                                                                                }
                                                                            </li>
                                                                        ),
                                                                    )}
                                                                </ul>
                                                            )}
                                                            <p className="mt-2 text-xs text-muted-foreground">
                                                                AI-generated
                                                                guidance. The
                                                                approval
                                                                decision and its
                                                                audit record are
                                                                yours.
                                                            </p>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                                <TablePagination page={vouchers} />
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={approving !== null}
                onOpenChange={(open) => !open && setApproving(null)}
                title="Approve this payment?"
                description="This clears the voucher for payment and cannot be undone."
                confirmLabel="Approve"
                processing={submitting}
                onConfirm={approveVoucher}
                detail={
                    approving && (
                        <div className="space-y-3">
                            <dl className="space-y-1 rounded-md border border-border bg-muted/40 px-3 py-2.5 text-sm">
                                <div className="flex justify-between gap-4">
                                    <dt className="text-muted-foreground">
                                        Voucher
                                    </dt>
                                    <dd className="font-mono">
                                        {approving.voucher_number}
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-muted-foreground">
                                        Payee
                                    </dt>
                                    <dd>{approving.payee_name}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-muted-foreground">
                                        Amount
                                    </dt>
                                    <dd className="font-semibold tabular-nums">
                                        GHS {money(approving.amount)}
                                    </dd>
                                </div>
                            </dl>
                            {/* The browser's own dialog could not show these,
                                so an approver confirming a flagged voucher
                                saw only a bare count. */}
                            {(checks[approving.id]?.length ?? 0) > 0 && (
                                <ul className="space-y-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-900 dark:bg-amber-950/30">
                                    {checks[approving.id].map((finding) => (
                                        <li
                                            key={finding.type}
                                            className="text-sm text-amber-900 dark:text-amber-200"
                                        >
                                            {finding.message}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )
                }
            />
        </AppLayout>
    );
}
