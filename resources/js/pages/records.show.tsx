import { RecordsTable } from '@/components/records-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { useRecordsStore } from '@/store/recordsStore';
import { Record, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
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
    console.log(usePage().props.id)
    const [recordId, setRecordId] = useState(usePage().props.id as string);
    console.log("record_id", recordId)
    const record = useRecordsStore((state) => state.selectedRecord);
    const setSelectedRecord = useRecordsStore((state) => state.setSelectedRecord);

    useEffect(() => {
        setSelectedRecord(recordId);
    }, [setSelectedRecord, recordId]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Records" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{record?.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {record && (
                            <>
                                <p>{formatDate(record.created_at)} <span className="float-right">{record.date_diff}</span></p>
                                <br />
                                {record.latitude && record.longitude && (
                                    <p>Location: {record.latitude}, {record.longitude}</p>
                                )}
                                <br />
                                <p>{record.description}</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
