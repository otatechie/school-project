import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type DemoAccount = {
    email: string;
    label: string;
};

type Props = {
    status?: string;
    canResetPassword: boolean;
    defaultEmail?: string | null;
    defaultPassword?: string | null;
    demoAccounts?: DemoAccount[] | null;
};

export default function Login({
    status,
    canResetPassword,
    defaultEmail = '',
    defaultPassword = '',
    demoAccounts,
}: Props) {
    // Controlled so choosing a demonstration account can fill the form.
    const [email, setEmail] = useState(defaultEmail ?? '');
    const [password, setPassword] = useState(defaultPassword ?? '');

    const isDemo = Boolean(demoAccounts?.length);

    return (
        <AuthLayout
            title="Sign in"
            description="Use the email address issued to you by the office."
        >
            <Head title="Log in" />

            {status && (
                <div
                    className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-200"
                    role="status"
                >
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            {/* Demonstration mode only. Kept to a single row so it never
                competes with the sign-in form above it. */}
            {isDemo && (
                <div className="space-y-2 border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground">
                        Demo accounts &mdash; select one to fill the form:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {demoAccounts?.map((account) => (
                            <button
                                key={account.email}
                                type="button"
                                onClick={() => {
                                    setEmail(account.email);
                                    setPassword(defaultPassword ?? '');
                                }}
                                aria-pressed={account.email === email}
                                className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                                    account.email === email
                                        ? 'border-primary bg-primary/10 font-medium text-foreground'
                                        : 'border-border text-muted-foreground hover:bg-muted'
                                }`}
                            >
                                {account.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </AuthLayout>
    );
}
