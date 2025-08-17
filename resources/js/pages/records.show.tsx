import { MapShow } from '@/components/map-show';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAutoReload } from '@/hooks/useAutoReload';
import AppLayout from '@/layouts/app-layout';
import { spanishTimestampConvert } from '@/lib/utils';
import { Record, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Ban, Clock, Loader2, RefreshCcw, Sparkle, Sparkles, SquarePen, Trash, X } from 'lucide-react';
import { title } from 'process';
import { use, useEffect, useState } from 'react';
import axios from 'axios';
import DeleteRecordDialog from '@/components/delete-record-dialog';
import GenerateTitleDialog from '@/components/generate-title-dialog';
import { Textarea } from '@/components/ui/textarea';
import GenerateDescriptionDialog from '@/components/generate-description-dialog';
import CancelJobDialog from '@/components/cancel-job-dialog';
import ScrollTopButton from '@/components/ScrollTopButton';
import BottomMenu from '@/components/BottomMenu';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Registros', href: '/records' },
  { title: 'Registro', href: '' },
];

export default function RecordsShow({ record, total_in_queue }: { record: Record, total_in_queue: number }) {

  const { user } = usePage<any>().props.auth;

  const [titleEditOpen, setTitleEditOpen] = useState(false);
  const [descriptionEditOpen, setDescriptionEditOpen] = useState(false);

  const [newTitle, setNewTitle] = useState(record.title);
  const [newDescription, setNewDescription] = useState(record.description);

  const [editTitleButtonVisible, setEditTitleButtonVisible] = useState(false);
  const [editDescriptionButtonVisible, setEditDescriptionButtonVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Echo) {
      window.Echo.private(`user.${user.id}`)
        .listen('.records.delete', (e: any) => {
            console.log('Record deleted:', e);
            router.visit(route('records.index'), {
              preserveScroll: false,
              preserveState: false,
            });
        })
        .listen('.records.update', (e: any) => {
          console.log('Records updated:', e);
          router.reload();
          
        })
        .listen('.image-processing-jobs.update', (e: any) => {
          console.log('Image processing jobs updated:', e);
          router.reload();
        });

      return () => {
        window.Echo.leave(`user.${user.id}`);
      };
    }
  }, [user.id]);
    
  const handleTitleEdit = () => {
    setTitleEditOpen(!titleEditOpen); 
  };
  
  
  
  const StatusMessage = () => {
    switch (titleJob?.status) {
      case 'pending': return <span className="flex flex-row items-center gap-1 text-orange-500"><Clock className="h-4 w-4" /> Generación en cola ({titleJob.position_in_queue}/{total_in_queue})</span>
      case 'processing': return <span className="flex flex-row items-center gap-1 text-blue-500"><Loader2 className="h-4 w-4 animate-spin" /> Generación en curso</span>
      case 'failed': return <span className="flex flex-row items-center gap-1 text-red-500"><X />Generación fallida</span>

    }
  }

  console.log('Record:', record);

  const jobs = record?.image?.image_processing_jobs;

  // Obtener estados individuales
  const descriptionJob = jobs?.find(job => job.type === 'description');
  const titleJob = jobs?.find(job => job.type === 'title');

  useEffect(() => {
    if (titleJob?.status !== 'processing') setEditTitleButtonVisible(true)
    else setEditTitleButtonVisible(false)

  }, [titleJob?.status]);

  useEffect(() => {
    if (descriptionJob?.status !== 'processing') setEditDescriptionButtonVisible(true)
    else setEditDescriptionButtonVisible(false)
  })

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Registros" />
      <div className="p-4 ">
        <Card className={record?.latitude && record?.longitude ? 'h-full' : ''}>

          <CardHeader >
            <div className="flex flex-col items-start gap-2">
              <div className="w-full">
                {titleEditOpen && titleJob?.status !== 'processing' ? (
                  <input
                    type="text"
                    defaultValue={record.title}
                    className="px-2 py-1 w-full border border-gray-300 rounded-md "
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                ) : (
                  <CardTitle>{record?.title}</CardTitle>
                )}
              </div>
              <div className="flex flex-row flex-wrap gap-2">
                {titleEditOpen && (
                  <Button className='cursor-pointer'
                    onClick={() => {
                      router.put(
                        route('records.update', record.id),
                        { title: newTitle },
                        {
                          onSuccess: () => {
                            setTitleEditOpen(false);
                            router.reload({ only: ['record'] });
                          },
                        }
                      );
                    }}
                  >
                    Guardar título
                  </Button>
                )}

                {titleJob ? (
                  titleJob.status === 'processing' || titleJob.status === 'pending' ? (
                    <CancelJobDialog job={titleJob} />
                  ) : (
                    <GenerateTitleDialog record={record} />
                  )
                ) : null}
                
                <Button variant="secondary" className="cursor-pointer" onClick={handleTitleEdit}>
                  {titleEditOpen ?
                    <><X className="h-4 w-4" />Cancelar</>
                    :
                    <><SquarePen className="h-4 w-4" />Editar</>
                  }
                </Button>

                {!titleEditOpen &&
                  !descriptionEditOpen &&
                  titleJob?.status !== 'processing' &&
                  descriptionJob?.status !== 'processing' &&
                  <DeleteRecordDialog record={record} />
                }
              </div>
              <StatusMessage />
            </div>

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

                <div className="flex flex-col md:flex-row gap-6">
                  {record.image && (
                    <div className="overflow-hidden max-h-[60vh]">
                      <img
                        src={route('images.show', record.image.id)}
                        alt={`Imagen ${record.image.id}`}
                        className="rounded-lg shadow max-h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    {record.image && (

                      <>
                        <h2 className="text-lg font-semibold">Metadatos</h2>
                        <div className="text-sm space-y-1 max-w-[50vh] ">
                          <p><strong>Nombre original:</strong> {record.image.original_filename}</p>
                          {record.image.file_date && (
                            <p><strong>Fecha del archivo:</strong> {spanishTimestampConvert(record.image.file_date)}</p>
                          )}

                          {record.image.generated_description &&
                            <p><strong>Descripcion generada:</strong> {record.image.generated_description}</p>
                          }
                          {descriptionJob?.status == 'pending' && (
                            <span className="flex items-center gap-1 text-orange-500">
                              <Clock className="h-4 w-4" /> Generación en cola ({descriptionJob.position_in_queue}/{total_in_queue})
                            </span>
                          )}
                          {descriptionJob?.status == 'processing' && (
                            <span className="flex items-center  gap-1 text-blue-500">
                              <Loader2 className="h-4 w-4 animate-spin" /> Generación en curso
                            </span>
                          )}
                          {descriptionJob?.status == 'failed' && (
                            <span className="flex items-center gap-1 text-red-500">
                              <span className="h-4 w-4">❌</span> Generación fallida
                            </span>
                          )}
                          {descriptionJob?.status == 'cancelled' && (
                            <span className="flex items-center gap-1 text-red-500">
                              <span className="h-4 w-4">🚫</span> Generación cancelada
                            </span>
                          )}
                          {descriptionJob ? (
                            descriptionJob.status === 'processing' || descriptionJob.status === 'pending' ? (
                              <CancelJobDialog job={descriptionJob} />
                            ) : (
                              <GenerateDescriptionDialog record={record} />
                            )
                          ) : null}
                        </div>
                      </>
                    )}
                    <div className="flex flex-col gap-2">
                      {descriptionEditOpen &&
                        <Textarea
                          className="px-2 py-1 mt-1 w-full border border-gray-300 rounded-md "
                          defaultValue={record.description}
                          onChange={(e) => setNewDescription(e.target.value)}>
                        </Textarea>
                      }
                      {record.description && !descriptionEditOpen &&
                        <p className="mt-2"><strong>Descripción:</strong> {record.description}</p>
                      }
                      <div className="flex flex-row flex-wrap gap-2">
                        {descriptionEditOpen && (
                          <Button className='cursor-pointer mt-2'
                            onClick={() => {
                              router.put(
                                route('records.update', record.id),
                                { description: newDescription },
                                {
                                  onSuccess: () => {
                                    setDescriptionEditOpen(false);
                                    router.reload({ only: ['record'] });
                                  },
                                }
                              );
                            }}
                          >
                            Guardar descripcion
                          </Button>
                        )}
                        <Button className='cursor-pointer mt-2' variant="secondary" onClick={() => setDescriptionEditOpen(!descriptionEditOpen)}>
                          {descriptionEditOpen ?
                            <><X className="h-4 w-4" />Cancelar</>
                            :
                            <><SquarePen className="h-4 w-4" />{record.description ? 'Editar' : 'Añadir'} descripción</>
                          }
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>


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
      <ScrollTopButton className="fixed bottom-6 right-6 hidden md:block" />
      <BottomMenu />
    </AppLayout>
  );
}
