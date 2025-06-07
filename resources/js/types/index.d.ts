import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}
export interface Record {
  id: number
  user_id: number
  title: string
  description: any
  latitude: number
  longitude: number
  time: string | null
  created_at: string
  updated_at: string
  date_diff: string
  image: Image
}

export interface Image {
  id: number
  record_id: number
  record: Record
  generated_description: string
  file_latitude: number
  file_longitude: number
  file_date: string
  original_filename: string
  image_path: string
  created_at: string
  updated_at: string
  file_date_diff: string
  image_processing_jobs: ImageProcessingJob[] | null;
}

export interface Favorite {
  id: number
  user_id: number
  title: string
}

export interface ImageProcessingJob {
  id: number
  image_id: number
  image: Image
  type: string
  status: string
  queued_at: string
  started_at: string
  finished_at: string
  error: string | null
  created_at: string
  updated_at: string
  position_in_queue: number | null;
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
    is_admin: boolean;
    user_limit: UserLimit | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface UserLimit {
    id: number;
    user: User | null;
    can_upload_images: boolean;
    can_process_images: boolean;
    daily_upload_limit: number | null;
    daily_process_limit: number | null;
    created_at: string;
    updated_at: string;
}
export interface UploadLimit {
  limit: number 
  left: number
  time: string | null
  can_upload: boolean
}

