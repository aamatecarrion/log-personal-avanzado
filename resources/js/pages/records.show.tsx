import { MapShow } from '@/components/map-show';
import { RecordsTable } from '@/components/records-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { useRecordsStore } from '@/store/recordsStore';
import { Record, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Records',
        href: '/records',
    },
    {
        title: 'Record',
        href: "",
    },
];

function formatDate(dateString: string) {
    const dateUTC = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
    let formattedDate = new Intl.DateTimeFormat("es-ES", options).format(dateUTC)
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)
    return formattedDate
  }
export default function RecordsShow() {

    const [recordId, setRecordId] = useState(usePage().props.id as string);
    const selectedRecord = useRecordsStore((state) => state.selectedRecord);

    const setSelectedRecord = useRecordsStore((state) => state.setSelectedRecord);

    useEffect(() => {
        setSelectedRecord(recordId);
    }, [setSelectedRecord, recordId]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Records" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Card className={selectedRecord?.latitude && selectedRecord?.longitude ? "h-full" : ""}>
                    <CardHeader>
                        <CardTitle>{selectedRecord?.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                        {selectedRecord && (
                            <>  
                                <p>{formatDate(selectedRecord.created_at)} <span className="float-right">{selectedRecord.date_diff}</span></p>
                                <br />
                                {selectedRecord.latitude && selectedRecord.longitude && (
                                    <p>Location: {selectedRecord.latitude}, {selectedRecord.longitude}</p>
                                )}
                                <br />
                                <p>{selectedRecord.description}</p>
                                <div className="overflow-auto">
                                    
                                            {selectedRecord.image && (
                                                <div onClick={() => { selectedRecord.image && router.visit(route('images.show', selectedRecord.image.id), { method: 'get' })}} className="overflow-hidden cursor-pointer">
                                                    <img
                                                        src={route('api.images.show', selectedRecord.image.id)}
                                                        alt={`Imagen ${selectedRecord.image.id}`}
                                                        className="w-60 h-60 object-cover"
                                                    />
                                                </div>
                                            )}
                                    </div>
                                <br />
                                {selectedRecord.latitude && selectedRecord.longitude && (
                                    <div className="flex-1">
                                        <MapShow />
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
