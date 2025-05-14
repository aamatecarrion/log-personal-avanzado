import { RecordsTable } from '@/components/records-table';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { Image, Record, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Images',
        href: '/images',
    },
    {
        title: 'Image',
        href: "",
    },
];
export default function ImagesShow({ image }: { image: Image }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Images" />
            <div className="p-4 flex flex-row gap-4">
                <div className="overflow-auto">
                    <img
                        src={route('api.images.show', image.id)}
                        alt={`Imagen ${image.id}`}
                        className="h-[50vh] object-cover"
                    />
                </div>
                <div className="flex flex-row gap-4">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold">Metadata</h2>
                        <div className="flex flex-col gap-1">
                            <span><strong>Original filename:</strong> {image.original_filename}</span>
                            <span><strong>Created at:</strong> {image.created_at}</span>
                            <span><strong>Updated at:</strong> {image.updated_at}</span>
                            <span><strong>Latitude:</strong> {image.file_latitude || 'N/A'}</span>
                            <span><strong>Longitude: </strong> {image.file_longitude || 'N/A'} </span>
                            <span><strong>File date:</strong> {image.file_date || 'N/A'}</span>
                            
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
