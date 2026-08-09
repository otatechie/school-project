import { useEffect, useRef, useState } from 'react';
import paymentVouchers from '@/routes/payment-vouchers';

export type Finding = {
    type: 'duplicate' | 'outlier' | 'budget_line';
    severity: 'high' | 'medium' | 'low';
    message: string;
};

type CheckInput = {
    payee_name: string;
    amount: string;
    description: string;
    budget_line: string;
    department_id: string;
};

type CheckResult = {
    findings: Finding[];
    suggestedBudgetLine: string | null;
};

/**
 * Runs the server's deterministic voucher checks against the form as it is
 * filled in, so a preparer sees a duplicate or an out-of-range amount before
 * submitting rather than after an approver returns it.
 *
 * Debounced, and silent on failure — these checks assist the preparer but must
 * never block them from saving.
 */
export function useVoucherChecks(input: CheckInput, voucherId?: string) {
    const [result, setResult] = useState<CheckResult>({
        findings: [],
        suggestedBudgetLine: null,
    });
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Serialised so the effect compares values, not object identity.
    const signature = JSON.stringify(input);

    useEffect(() => {
        const values = JSON.parse(signature) as CheckInput;

        // Nothing worth checking until there is a payee or an amount.
        if (!values.payee_name && !values.amount && !values.description) {
            setResult({ findings: [], suggestedBudgetLine: null });

            return;
        }

        if (timer.current) clearTimeout(timer.current);

        const controller = new AbortController();

        timer.current = setTimeout(async () => {
            try {
                const response = await fetch(paymentVouchers.check().url, {
                    method: 'POST',
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') ?? '',
                    },
                    body: JSON.stringify({ ...values, voucher_id: voucherId }),
                });

                if (!response.ok) return;

                setResult(await response.json());
            } catch {
                // A failed check must not interrupt data entry.
            }
        }, 500);

        return () => {
            controller.abort();
            if (timer.current) clearTimeout(timer.current);
        };
    }, [signature, voucherId]);

    return result;
}
