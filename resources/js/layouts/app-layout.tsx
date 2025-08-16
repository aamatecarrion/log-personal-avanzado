import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { usePage } from '@inertiajs/react';

interface AppLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
  const flash = (usePage().props as { flash?: { success?: string; error?: string; warning?: string } | null }).flash;

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
    if (flash?.warning) toast.warning(flash.warning);
  }, [flash]);

  return (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
      {children}
      <Toaster position="top-right" />
    </AppLayoutTemplate>
  );
};
