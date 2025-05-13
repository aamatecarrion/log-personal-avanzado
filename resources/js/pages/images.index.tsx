import { RecordsTable } from '@/components/records-table';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { Image, Record, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Images',
        href: '',
    },
];
export default function Images({ images }: { images: Image[] }) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Images" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {
                    images.map((image: Image) => (
                        <div key={image.id} className="flex flex-col gap-2">
                            <img src={route('images.show', image.id)} className="w-full h-auto rounded-lg" />
                        </div>
                    ))
                }
            </div>
        </AppLayout>
    );
}
