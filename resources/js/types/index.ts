export type * from './auth';
export type * from './navigation';
export type * from './ui';

import type { Auth } from './auth';

export type AppNotification = {
    id: string;
    type: string;
    title: string;
    body: string | null;
    link: string | null;
    read_at: string | null;
    created_at: string;
    created_at_label: string;
};

export type SharedData = {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    notifications?: {
        unread: number;
        items: AppNotification[];
    };
    [key: string]: unknown;
};
