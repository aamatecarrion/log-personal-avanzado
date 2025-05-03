import { RecordsMap } from '@/components/records-map';
import { RecordsTable } from '@/components/records-table';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { Record, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Map',
        href: '/map',
    },
];
export default function Map() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Map" />
            <RecordsMap></RecordsMap>
        </AppLayout>
    );
}