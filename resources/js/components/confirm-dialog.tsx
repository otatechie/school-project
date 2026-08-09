import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

/**
 * Confirmation before an action that cannot be undone.
 *
 * Replaces the browser's own confirm box, which cannot be styled, cannot show
 * the figures being confirmed, and labels its buttons "OK" and "Cancel"
 * regardless of what is about to happen.
 */
export default function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    detail,
    confirmLabel = 'Confirm',
    destructive = false,
    processing = false,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    /** Figures or warnings the decision depends on. */
    detail?: ReactNode;
    confirmLabel?: string;
    destructive?: boolean;
    processing?: boolean;
    onConfirm: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                </DialogHeader>

                {detail}

                <DialogFooter className="gap-2 sm:gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={processing}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant={destructive ? 'destructive' : 'default'}
                        onClick={onConfirm}
                        disabled={processing}
                        autoFocus
                    >
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
