export type User = {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    phone?: string | null;
    staff_id?: string | null;
    department_id?: string | null;
    position?: string | null;
    last_login_at?: string | null;
    last_login_ip?: string | null;
    approval_level?: number | null;
    approval_limit?: string | null;
    is_active?: boolean;
    password_changed_at?: string | null;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
