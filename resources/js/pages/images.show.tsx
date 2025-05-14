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
export default function ImagesShow({ images }: { images: Image[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Images" />
            <div className="p-4">
                <div className="flex flex-row">
                    {images.map((image: Image) => (
                        <div key={image.id} className="overflow-overlay rounded-lg shadow hover:shadow-lg transition-all duration-200 border">
                            <img
                                src={route('api.images.show', image.id)}
                                alt={`Imagen ${image.id}`}
                                className="w-full h-60 object-cover transition-transform duration-200"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
