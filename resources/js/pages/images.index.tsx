import { RecordsTable } from '@/components/records-table';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { Image, Record, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Images',
        href: '',
    },
];
export default function Images({ images }: { images: Image[] }) {
    const handleImageClick = (image: Image) => {

        console.log('Image ID:', image.id);
        console.log('Record ID:', image.record_id);

        router.visit(route('records.show', image.record_id?.toString() ), {
            method: 'get',
        });
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Images" />
            <div className="p-4">
                <div className="flex flex-row flex-start flex-wrap gap-4">
                    {images.map((image: Image) => (
                        <div key={image.id} className="overflow-hidden cursor-pointer" onClick={() => handleImageClick(image)}>
                            <img
                                src={route('api.images.show', image.id)}
                                alt={`Imagen ${image.id}`}
                                className="w-full h-60 object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
