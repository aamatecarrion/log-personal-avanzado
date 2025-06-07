import { MapShow } from '@/components/map-show';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAutoReload } from '@/hooks/useAutoReload';
import AppLayout from '@/layouts/app-layout';
import { spanishTimestampConvert } from '@/lib/utils';
import { Record, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Clock, Loader2, RefreshCcw, Sparkle, Sparkles, SquarePen, Trash, X } from 'lucide-react';
import { title } from 'process';
import { use, useEffect, useState } from 'react';
import axios from 'axios';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Records', href: '/records' },
  { title: 'Record', href: '' },
];


export default function RecordsShow({ record, total_in_queue }: { record: Record, total_in_queue: number }) {

  useAutoReload(10000);

  const [confirmOpen, setConfirmOpen] = useState(false);
  
  const [confirmGenerateTitleOpen, setConfirmGenerateTitleOpen] = useState(false);
  const [confirmGenerateDescriptionOpen, setConfirmGenerateDescriptionOpen] = useState(false);
  
  const [titleEditOpen, setTitleEditOpen] = useState(false);
  const [descriptionEditOpen, setDescriptionEditOpen] = useState(false);
  
  const [newTitle, setNewTitle] = useState(record.title);
  const [newDescription, setNewDescription] = useState(record.description);

  const [editTitleButtonVisible, setEditTitleButtonVisible] = useState(false);

  const handleDelete = (id: number) => {    
      router.delete(route('records.destroy', id));
  };
  const handleRegenerateTitle = () => {
    router.post(route('imageprocessing.generate-title',
      { id: record.image.id }))
  };
  const handleRegenerateDescription = () => {
    router.post(route('imageprocessing.generate-description',
      { id: record.image.id }))
  };

  
  const handleTitleEdit = async () => {
    if (titleEditOpen) {
      setTitleEditOpen(false);
      return;
    }

    const job = record.image?.image_processing_jobs?.find(job => job.type === 'title');

    if (!job) {
      setTitleEditOpen(true); // No hay job, puedes editar directamente
      return;
    }

    try {
      await axios.put(route('imageprocessing.cancel', job.id));
      setTitleEditOpen(true); // Cancelado con éxito
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 410) {
        // Job ya terminado: permitir edición
        console.warn('Job terminado, puedes editar:', message);
        setTitleEditOpen(true);
      } else if (status === 409) {
        // Job en proceso: NO permitir edición
        console.warn('Job en proceso, no puedes editar:', message);
        setTitleEditOpen(false);
      } else {
        console.error('Error inesperado:', message || error.message);
        setTitleEditOpen(false);
      }
    }
  };




  console.log('Record:', record);

  const jobs = record?.image?.image_processing_jobs;

  // Obtener estados individuales
  const descriptionJob = jobs?.find(job => job.type === 'description');
  const titleJob = jobs?.find(job => job.type === 'title');

  useEffect(() => {
    if (titleJob?.status !== 'processing') setEditTitleButtonVisible(true);
  
  }, [titleJob?.status]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Records" />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Card className={record?.latitude && record?.longitude ? 'h-full' : ''}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center">
              <div className='flex flex-col gap-2'>
              {titleEditOpen ? (
                <input
                  type="text"
                  defaultValue={record.title}
                  className="border px-2 py-1 rounded"
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              ) : (
                <CardTitle>{record?.title}</CardTitle>
              )}
              {titleEditOpen && (
              <Button
                onClick={() => {
                  router.put(
                    route('records.update', record.id),
                    { title: newTitle },
                    {
                      onSuccess: () => {
                        setTitleEditOpen(false);
                        router.reload({ only: ['record'] }); // <-- Esto fuerza recarga del record
                      },
                    }
                  );
                }}
              >
                Guardar título
              </Button>
            )}

              {titleJob?.status == 'pending' && (
                <span className="flex items-center gap-1 ml-2 text-orange-500">
                  <Clock className="h-4 w-4" />Generación en cola ({titleJob.position_in_queue}/{total_in_queue})
                </span>
              )}
              {titleJob?.status == 'processing' && (
                <span className="flex items-center  gap-1 text-blue-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Title generation in progress
                </span>
              )}
              {titleJob?.status == 'failed'  && (
                <span className="flex items-center gap-1 text-red-500">
                  <span className="h-4 w-4">❌</span> Title generation failed
                </span>
              )}
              </div>
              <div>

               
                  <>
                  <Dialog open={confirmGenerateTitleOpen} onOpenChange={setConfirmGenerateTitleOpen}>
                    <DialogTrigger asChild className='cursor-pointer ml-2'>
                      <Button variant="secondary" className="cursor-pointer">
                          <Sparkles className="h-5 w-5 cursor-pointer text-yellow-500" />
                        Regenerate title
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Regenerate title</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to regenerate the title for this record?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="flex justify-between">
                        <DialogClose asChild>
                          <Button variant="secondary" className='cursor-pointer'>Cancel</Button>
                        </DialogClose>
                        <Button  className='cursor-pointer' onClick={handleRegenerateTitle}>
                            <Sparkles className="h-5 w-5 cursor-pointer text-yellow-500" />
                          Regenerate
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  </>
               
              </div>
                <Button variant="secondary" className="ml-2 cursor-pointer" onClick={handleTitleEdit}>
                  { titleEditOpen ?
                    <>
                      <X className="h-4 w-4" />
                      Cancel
                    </>
                  :
                    <>
                      <SquarePen className="h-4 w-4" />
                      Edit
                    </>
                  }
                </Button>
            </div>
            

            {/* Primer diálogo: Confirmación inicial */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogTrigger asChild className='hover:text-red-600 cursor-pointer'>
                <Trash className="h-4 w-4 cursor-pointer" />
              </DialogTrigger>
              <DialogContent className="max-h-[50vh] overflow-y-auto bg-zinc-950 text-white shadow-xl border border-red-700">
                <div className="absolute inset-0 z-[-2] bg-black/80" />

                <DialogHeader>
                  <DialogTitle className="text-2xl text-red-600">⚠️ Delete record</DialogTitle>
                  <DialogDescription className="text-white/80">
                    Are you sure you want to delete this record?
                  </DialogDescription>
                </DialogHeader>
               <DialogFooter className="flex flex-row f-end justify-between pt-4">
                  <DialogClose asChild>
                    <Button variant="secondary" className='cursor-pointer'>Cancel</Button>
                  </DialogClose>
                  <Button variant="destructive" className='cursor-pointer' onClick={() => handleDelete(record.id)}>⚠️ Delete</Button>
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
                        {descriptionJob?.status == 'pending' && (
                          <span className="flex items-center gap-1 text-orange-500">
                            <Clock className="h-4 w-4" /> Description generation queued ({descriptionJob.position_in_queue}/{total_in_queue})
                          </span>
                        )}
                        {descriptionJob?.status == 'processing' && (
                          <span className="flex items-center  gap-1 text-blue-500">
                            <Loader2 className="h-4 w-4 animate-spin" /> Description generation in progress
                          </span>
                        )}
                        {descriptionJob?.status == 'failed'  && (
                          <span className="flex items-center gap-1 text-red-500">
                            <span className="h-4 w-4">❌</span> Description generation failed
                          </span>
                        )}
                        {(descriptionJob?.status == 'completed' || descriptionJob?.status == 'failed') && (
                          <>
                          <Dialog open={confirmGenerateDescriptionOpen} onOpenChange={setConfirmGenerateDescriptionOpen}>
                            <DialogTrigger asChild>
                              <Button variant="secondary" className="mt-2 cursor-pointer">
                                 <Sparkles className="h-5 w-5 cursor-pointer text-yellow-500" />
                                Regenerate description
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Regenerate description</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to regenerate the description for this record?
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter className="flex justify-between">
                                <DialogClose asChild>
                                  <Button variant="secondary" className='cursor-pointer'>Cancel</Button>
                                </DialogClose>
                                <Button  className='cursor-pointer' onClick={handleRegenerateDescription}>
                                   <Sparkles className="h-5 w-5 cursor-pointer text-yellow-500" />
                                  Regenerate
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          </>
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
