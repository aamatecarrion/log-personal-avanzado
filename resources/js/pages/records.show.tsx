import { MapShow } from '@/components/map-show';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { spanishTimestampConvert } from '@/lib/utils';
import { Record, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { use, useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Records', href: '/records' },
  { title: 'Record', href: '' },
];


export default function RecordsShow({ record }: { record: Record }) {


  
  console.log('Record:', record);
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Records" />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Card className={record?.latitude && record?.longitude ? 'h-full' : ''}>
          <CardHeader>
            <CardTitle>{record?.title}</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {record && (
              <>
                <CardDescription className="text-muted-foreground text-sm">
                  <div className="flex justify-between">
                    <p>{spanishTimestampConvert(record.image?.file_date ?? record.created_at)}</p>
                    <span>{record.image?.file_date_diff ?? record.date_diff}</span>
                  </div>
                </CardDescription>

                {record.latitude && record.longitude && (
                  <p className="text-sm">
                    <strong>Ubicación:</strong> {record.latitude}, {record.longitude}
                  </p>
                )}

                <p className="text-base">{record.description}</p>

                {record.image && (
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="overflow-hidden max-h-[60vh]">
                      <img
                        src={route('api.images.show', record.image.id)}
                        alt={`Imagen ${record.image.id}`}
                        className="rounded-lg shadow max-h-full object-contain"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <h2 className="text-lg font-semibold">Metadata</h2>
                      <div className="text-sm space-y-1 max-w-[50vh] ">
                        <p><strong>Nombre original:</strong> {record.image.original_filename}</p>
                        <p><strong>Creado:</strong> {spanishTimestampConvert(record.image.created_at)}</p>
                        <p><strong>Actualizado:</strong> {spanishTimestampConvert(record.image.updated_at)}</p>
                        {record.image.file_date && (
                          <p><strong>Fecha del archivo:</strong> {spanishTimestampConvert(record.image.file_date)}</p>
                        )}
                        {record.image.generated_description && (
                          <div className="text-sm">
                            <p><strong>Descripción generada:</strong></p>
                            <p className="text-sm">{record.image.generated_description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {record.latitude && record.longitude && (
                  <div className="h-[400px] mt-4 rounded overflow-hidden">
                    <MapShow record={record} />
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
