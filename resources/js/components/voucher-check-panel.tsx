import { AlertTriangle, Copy, Info, TrendingUp } from 'lucide-react';
import type { Finding } from '@/hooks/use-voucher-checks';

const ICONS = {
    duplicate: Copy,
    outlier: TrendingUp,
    budget_line: Info,
} as const;

/**
 * Shows the automated checks that flagged on the voucher being prepared.
 *
 * These are warnings, not errors: every one of them can be a legitimate
 * payment, so nothing here blocks saving. The preparer is told what looks
 * unusual and decides.
 */
export default function VoucherCheckPanel({
    findings,
}: {
    findings: Finding[];
}) {
    if (findings.length === 0) return null;

    return (
        <div
            className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30"
            role="status"
            aria-live="polite"
        >
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
                <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                {findings.length} thing{findings.length === 1 ? '' : 's'} worth
                checking
            </p>
            <ul className="mt-2 space-y-1.5">
                {findings.map((finding) => {
                    const Icon = ICONS[finding.type] ?? Info;

                    return (
                        <li
                            key={finding.type}
                            className="flex items-start gap-2 text-sm text-amber-900 dark:text-amber-200"
                        >
                            <Icon
                                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                                aria-hidden="true"
                            />
                            <span>{finding.message}</span>
                        </li>
                    );
                })}
            </ul>
            <p className="mt-2 text-xs text-amber-900/80 dark:text-amber-200/80">
                These are warnings, not errors. You can still save this voucher.
            </p>
        </div>
    );
}
