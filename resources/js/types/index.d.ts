import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface ProcessingJob {
    id: number;
    type: 'description' | 'title';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    position_in_queue: number | null;
    error: string | null;
    queued_at: string | null;
    started_at: string | null;
    finished_at: string | null;
    image: Image | null;
    record: Record | null;
}

export interface Record {
    id: number;
    user_id: number;
    image: Image | null;
    title: string | null;
    description: string | null;
    latitude: number;
    longitude: number;
    created_at: string;
    updated_at: string;
    time: string | null;
    day: string | null;
    date_diff: string;
}

export interface Image {
    id: number;
    original_filename: string;
    image_path: string;
    user_id: number;
    record_id: number | null;
    generated_description: string | null;
    file_latitude: number | null;
    file_longitude: number | null;
    file_date: date | null;
    file_date_diff: string | null;
    created_at: date | null;
    updated_at: date | null;
    processing_jobs: ProcessingJob[];
}

export interface Image {
  id: number;
  original_filename: string;
  image_path: string;
  generated_description: string | null;
  file_latitude: number | null;
  file_longitude: number | null;
  file_date: string | null;
  record: Record | null;
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
