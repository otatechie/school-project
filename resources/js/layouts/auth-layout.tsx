import AuthLayoutTemplate from '@/layouts/auth/auth-split-layout';
import type { AuthLayoutProps } from '@/types';

export default function AuthLayout(props: AuthLayoutProps) {
    return <AuthLayoutTemplate {...props} />;
}
