import { usePage } from '@inertiajs/react';
import { CheckCircle2, XCircle } from 'lucide-react';

/**
 * Success and error messages carried over from the last request.
 *
 * Every list and form page needs these, so the markup lives here rather than
 * being repeated — and the colour is always paired with an icon, so the
 * meaning survives for anyone who cannot distinguish green from red.
 */
export default function FlashMessages() {
    const { props } = usePage();
    const flash = (props.flash ?? {}) as { success?: string; error?: string };

    if (!flash.success && !flash.error) return null;

    return (
        <>
            {flash.success && (
                <p
                    className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-200"
                    role="status"
                >
                    <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0"
                        aria-hidden="true"
                    />
                    {flash.success}
                </p>
            )}
            {flash.error && (
                <p
                    className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200"
                    role="alert"
                >
                    <XCircle
                        className="mt-0.5 h-4 w-4 shrink-0"
                        aria-hidden="true"
                    />
                    {flash.error}
                </p>
            )}
        </>
    );
}
