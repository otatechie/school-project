import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * A date input that echoes back the date it has understood.
 *
 * The browser renders `<input type="date">` in the viewer's own locale, so the
 * same field reads 09/08/2026 as 9 August in Ghana and 8 September in the US.
 * On a financial record that ambiguity matters, and the native control cannot
 * be restyled — so the parsed date is spelled out beneath it instead.
 */
export default function DateField({
    id,
    label,
    value,
    onChange,
    error,
    required = false,
    autoFocus = false,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
    autoFocus?: boolean;
}) {
    const spelled = value
        ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          })
        : null;

    return (
        <div className="space-y-1.5">
            <Label htmlFor={id}>
                {label}{' '}
                {required && <span className="text-destructive">*</span>}
            </Label>
            <Input
                id={id}
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                autoFocus={autoFocus}
                aria-describedby={spelled ? `${id}-spelled` : undefined}
            />
            {spelled && (
                <p
                    id={`${id}-spelled`}
                    className="text-sm text-muted-foreground"
                >
                    {spelled}
                </p>
            )}
            <InputError message={error} />
        </div>
    );
}
