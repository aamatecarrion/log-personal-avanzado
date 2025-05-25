import { MapShow } from '@/components/map-show';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { spanishTimestampConvert } from '@/lib/utils';
import { useRecordsStore } from '@/store/recordsStore';
import { Record, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { use, useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Records', href: '/records' },
  { title: 'Record', href: '' },
];


export default function RecordsShow({ id }: { id: string }) {

  const { selectedRecord, fetchRecord } = useRecordsStore((state) => state);

  useEffect(() => {
      fetchRecord(id)
  }, [id, fetchRecord]);

  console.log('Record:', selectedRecord);
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
                    <p>{spanishTimestampConvert(selectedRecord.image?.file_date ?? selectedRecord.created_at)}</p>
                    <span>{selectedRecord.image?.file_date_diff ?? selectedRecord.date_diff}</span>
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
                    <div className="overflow-hidden max-h-[60vh]">
                      <img
                        src={route('api.images.show', selectedRecord.image.id)}
                        alt={`Imagen ${selectedRecord.image.id}`}
                        className="rounded-lg shadow max-h-full object-contain"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <h2 className="text-lg font-semibold">Metadata</h2>
                      <div className="text-sm space-y-1 max-w-[50vh] ">
                        <p><strong>Nombre original:</strong> {selectedRecord.image.original_filename}</p>
                        <p><strong>Creado:</strong> {spanishTimestampConvert(selectedRecord.image.created_at)}</p>
                        <p><strong>Actualizado:</strong> {spanishTimestampConvert(selectedRecord.image.updated_at)}</p>
                        {selectedRecord.image.file_date && (
                          <p><strong>Fecha del archivo:</strong> {spanishTimestampConvert(selectedRecord.image.file_date)}</p>
                        )}
                        {selectedRecord.image.generated_description && (
                          <div className="text-sm">
                            <p><strong>Descripción generada:</strong></p>
                            <p className="text-sm">{selectedRecord.image.generated_description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {selectedRecord.latitude && selectedRecord.longitude && (
                  <div className="h-[400px] mt-4 rounded overflow-hidden">
                    <MapShow record={selectedRecord} />
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
