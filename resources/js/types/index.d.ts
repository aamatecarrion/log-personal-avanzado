import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface Record {
    id: number;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    created_at: string;
    updated_at: string;
    local_time: string;
    date_diff: string;
}

export interface Image {
    id: number;
    record_id: number | null;
    user_id: number;
    generated_description: string | null;
    file_latitude: number | null;
    file_longitude: number | null;
    file_date: date | null;
    original_filename: string;
    image_path: string;
    created_at: date | null;
    updated_at: date | null;
}

export interface Config {
    user_id: number;
    ask_location_permission: boolean;
}
export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
