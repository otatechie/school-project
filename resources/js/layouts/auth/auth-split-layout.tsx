import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps, SharedData } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col justify-between overflow-hidden p-10 text-white lg:flex dark:border-r">
                {/* Hero image from public folder */}
                <img
                    src="/images/hero.jpg"
                    alt="Digital accounting operations"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

                <Link
                    href={home()}
                    className="relative z-20 flex items-center text-lg font-medium"
                >
                    <AppLogoIcon className="mr-2 size-8 fill-current text-white" />
                    {name}
                </Link>
                <div className="relative z-20 max-w-md space-y-4">
                    <h2 className="text-2xl font-bold">Digital Accounting Operations</h2>
                    <p className="text-sm leading-relaxed text-white/90">
                        Transform manual processes into automated workflows. Reduce errors, improve processing speed, and gain real-time visibility with seamless GIFMIS integration.
                    </p>
                </div>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        <AppLogoIcon className="h-10 fill-current text-sky-500 sm:h-12" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-2xl font-bold text-black dark:text-white">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
