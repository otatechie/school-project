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

/**
 * Derived server-side from the same policies the controllers authorize
 * against, so the interface can never offer an action the server refuses.
 */
export type Permissions = {
    createVoucher: boolean;
    createMemo: boolean;
    reviewVouchers: boolean;
    manageDepartments: boolean;
    manageStaff: boolean;
    viewAuditLog: boolean;
};

export type Auth = {
    user: User;
    can: Permissions | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
