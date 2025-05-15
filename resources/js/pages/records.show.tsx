import { MapShow } from '@/components/map-show';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { useRecordsStore } from '@/store/recordsStore';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Records', href: '/records' },
  { title: 'Record', href: '' },
];

function formatDate(dateString: string) {
  const dateUTC = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  let formattedDate = new Intl.DateTimeFormat('es-ES', options).format(dateUTC);
  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}

export default function RecordsShow() {
  const [recordId, setRecordId] = useState(usePage().props.id as string);
  console.log('Record ID:', recordId);
  const selectedRecord = useRecordsStore((state) => state.selectedRecord);
  const setSelectedRecord = useRecordsStore((state) => state.setSelectedRecord);

  useEffect(() => {
    setSelectedRecord(recordId);
  }, [setSelectedRecord, recordId]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Records" />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Card className={selectedRecord?.latitude && selectedRecord?.longitude ? 'h-full' : ''}>
          <CardHeader>
            <CardTitle>{selectedRecord?.title}</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {selectedRecord && (
              <>
                <CardDescription className="text-muted-foreground text-sm">
                  <div className="flex justify-between">
                    <p>{formatDate(selectedRecord.created_at)}</p>
                    <span>{selectedRecord.date_diff}</span>
                  </div>
                </CardDescription>

                {selectedRecord.latitude && selectedRecord.longitude && (
                  <p className="text-sm">
                    <strong>Ubicación:</strong> {selectedRecord.latitude}, {selectedRecord.longitude}
                  </p>
                )}

                <p className="text-base">{selectedRecord.description}</p>

                {selectedRecord.image && (
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="overflow-hidden max-h-[50vh]">
                      <img
                        src={route('api.images.show', selectedRecord.image.id)}
                        alt={`Imagen ${selectedRecord.image.id}`}
                        className="rounded-lg shadow max-h-full object-contain"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <h2 className="text-lg font-semibold">Metadata</h2>
                      <div className="text-sm space-y-1">
                        <p><strong>Nombre original:</strong> {selectedRecord.image.original_filename}</p>
                        <p><strong>Creado:</strong> {selectedRecord.image.created_at}</p>
                        <p><strong>Actualizado:</strong> {selectedRecord.image.updated_at}</p>
                        <p><strong>Latitud:</strong> {selectedRecord.image.file_latitude || 'N/A'}</p>
                        <p><strong>Longitud:</strong> {selectedRecord.image.file_longitude || 'N/A'}</p>
                        <p><strong>Fecha del archivo:</strong> {selectedRecord.image.file_date || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedRecord.latitude && selectedRecord.longitude && (
                  <div className="h-[400px] mt-4 rounded overflow-hidden">
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
