/* import { RecordsTable } from '@/components/records-table'; */
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { Auth, Image, Record, UploadLimit, User, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import ImagesUpload from '@/components/images-upload';
import { useAutoReload } from '@/hooks/useAutoReload';
import { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Imágenes',
        href: '',
    },
];


export default function Images({ images, upload_limit }: { images: Image[], upload_limit: UploadLimit | null }) {
    
    const { auth } = usePage<{ auth: Auth}>().props;
    console.log(upload_limit)
    
    const handleImageClick = (image: Image) => {

        console.log('Image ID:', image.id);
        console.log('Record ID:', image.record_id);

        router.visit(route('records.show', image.record_id?.toString() ), {
            method: 'get',
        });
    };
    const { user } = auth;
    useAutoReload(1000);
    /* useEffect(() => {
        window.Echo
        .private(`user.${user.id}`)
        .listen('.records.update', (e: any) => {
            router.reload({ showProgress: false });
        });

        return () => {
        window.Echo.leaveChannel(`private-user.${user.id}`);
        };
    }, []); */
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Images" />
            <ImagesUpload upload_limit={upload_limit}/>
            <div className="p-4">
                <div className="flex flex-row flex-start flex-wrap gap-4">
                    {images.map((image: Image) => (
                        <div key={image.id} className="overflow-hidden cursor-pointer" onClick={() => handleImageClick(image)}>
                            <img
                                src={route('images.show', image.id)}
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
