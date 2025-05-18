import { RecordsMap } from '@/components/records-map';

import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { Record, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Map',
        href: '/map',
    },
];
export default function Map() {
    const { props: { records, record} } = usePage<{ records: Record[], record: Record }>();
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Map" />
            <RecordsMap records={records} selectedRecord={record ?? null}></RecordsMap>
        </AppLayout>
    );
}