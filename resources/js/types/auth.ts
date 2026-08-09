export type User = {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    phone?: string | null;
    staff_id?: string | null;
    department_id?: string | null;
    position?: string | null;
    is_active?: boolean;
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
