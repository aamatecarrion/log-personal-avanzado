import { MapShow } from '@/components/map-show';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { spanishTimestampConvert } from '@/lib/utils';
import { Record, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Trash, X } from 'lucide-react';
import { use, useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Records', href: '/records' },
  { title: 'Record', href: '' },
];


export default function RecordsShow({ record }: { record: Record }) {

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [finalConfirmOpen, setFinalConfirmOpen] = useState(false);
  const [clickCountDown, setClickCountDown] = useState(10);

  const handleDelete = (id: number) => {
    setClickCountDown(prev => prev - 1);
    if (clickCountDown <= 0) {
      router.delete(route('records.destroy', id));
    }
  };

  console.log('Record:', record);
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Records" />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Card className={record?.latitude && record?.longitude ? 'h-full' : ''}>
          <CardHeader className="flex flex-row justify-between">
            <CardTitle>{record?.title}</CardTitle>

            {/* Primer diálogo: Confirmación inicial */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogTrigger asChild>
                <Trash className="h-4 w-4 cursor-pointer" />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete record</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this record?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-between">
                  <DialogClose asChild>
                    <Button variant="secondary" className='cursor-pointer'>Cancel</Button>
                  </DialogClose>
                  <Button variant="destructive" className='cursor-pointer' onClick={() => {
                    setConfirmOpen(false);
                    setFinalConfirmOpen(true);
                  }}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Segundo diálogo: Confirmación definitiva */}
            <Dialog open={finalConfirmOpen} onOpenChange={setFinalConfirmOpen}>
              <DialogContent
                className="max-h-[50vh] overflow-y-auto bg-zinc-950 text-white shadow-xl border border-red-700"
              >
                {/* Overlay negro */}
                <div className="absolute inset-0 z-[-2] bg-black/80" />

                <DialogHeader>
                  <DialogTitle className="text-2xl text-red-600">⚠️ ARE YOU REALLY SURE???</DialogTitle>
                  <DialogDescription className="text-white/80">
                    THIS RECORD WILL BE HARD DESTROYED FOREVER AND CANNOT BE RECOVERED EVER AGAIN IN ALL ETERNITY OF THE UNIVERSE OR EVEN THE MULTIUNIVERSE DO YOU REALLY WANT TO GO THAT FURTHER? PLEASE RECONSIDER YOUR DECISION
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row f-end justify-between pt-4">
                  <DialogClose asChild>
                    <Button variant="secondary" className='cursor-pointer' onClick={() => setClickCountDown(10)}>Cancelar</Button>
                  </DialogClose>
                  <Button variant="destructive" className="cursor-pointer" onClick={() => handleDelete(record.id)}>
                    DELETE FOREVER {clickCountDown > 0 && `(${clickCountDown})`}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

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
                        src={route('images.show', record.image.id)}
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
