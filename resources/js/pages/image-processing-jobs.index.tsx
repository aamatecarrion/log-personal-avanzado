import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { Image, ImageProcessingJob, Record, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { use, useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Car, CheckCircle, Clock, Hourglass, Loader2, MoreVertical, Search, SearchCheck, Trash, XCircle } from "lucide-react"

import { router } from "@inertiajs/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAutoReload } from '@/hooks/useAutoReload';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Image Processing',
        href: '/image-processing',
    },
];
const formatFechaEspanola = (fechaUTC: string): string => {
  const fecha = new Date(fechaUTC);

  const formateador = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Europe/Madrid',
  });

  const partes = formateador.formatToParts(fecha);
  
  // Usamos "!" porque sabemos que existen
  const diaSemana = partes.find(p => p.type === 'weekday')!.value;
  const año = partes.find(p => p.type === 'year')!.value;
  const mes = partes.find(p => p.type === 'month')!.value;
  const dia = partes.find(p => p.type === 'day')!.value;

  // Capitalizar primera letra
  const diaCapitalizado = diaSemana[0].toUpperCase() + diaSemana.slice(1).toLowerCase();
  return `${diaCapitalizado}, ${año}-${mes}-${dia}`;
};
const obtenerHoraEspanola = (fechaUTC: string): string => {
  const fecha = new Date(fechaUTC);
  
  const opciones: Intl.DateTimeFormatOptions = {
    hour: '2-digit',    // Hora en 2 dígitos (ej: "08" o "14")
    minute: '2-digit',  // Minutos en 2 dígitos
    second: '2-digit',  // Segundos en 2 dígitos
    hour12: false,      // Formato 24 horas
    timeZone: 'Europe/Madrid'
  };

  // Formatear usando toLocaleTimeString (es-ES para separadores correctos)
  return fecha.toLocaleTimeString('es-ES', opciones);
};

export default function ImageProcessingJobs({jobs, total_in_queue}: { jobs: ImageProcessingJob[], total_in_queue: number }) {

    useAutoReload(10000)
    
    console.log("Jobs:", jobs)

    const userJobsInQueue = jobs.filter((job) => job.status === 'pending').length;
    const userJobsCompleted = jobs.filter((job) => job.status === 'completed').length;
    const userJobsFailed = jobs.filter((job) => job.status === 'failed').length;
    const userJobsProcessing = jobs.filter((job) => job.status === 'processing').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Records" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
              <div className="w-full"> 
                    <Card className="mb-3">
                      <CardHeader>
                        <CardTitle>Processing jobs stats</CardTitle>
                        <CardDescription>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-row justify-between flex-wrap gap-2">
                        <span>
                          Global in queue (all users): {total_in_queue}

                        </span>
                        <span>
                          User jobs in queue: {userJobsInQueue}
                        </span>
                        <span>
                          User jobs completed: {userJobsCompleted}
                        </span>
                        <span>
                          User jobs failed: {userJobsFailed}
                        </span>
                      </CardContent>
                    </Card>
                    <Card className="mb-3">
                      <CardHeader>
                        <CardTitle>User processing jobs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-left">ID</TableHead>
                              <TableHead className="text-left">File name</TableHead>
                              {userJobsInQueue > 0 && <TableHead className="text-left">Position</TableHead>}
                              <TableHead className="text-left">Status</TableHead>
                              <TableHead className="text-left" >Queued at</TableHead>
                              <TableHead className="text-left">Finished at</TableHead>
                              <TableHead className="text-left">Type</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            
                            {jobs.map((job) => (
                              <TableRow key={job.id} onClick={() => router.visit(`/records/${job.image?.record?.id}`)} className="cursor-pointer">
                                <TableCell className="text-left w-[60px]">{job.id}</TableCell>
                                <TableCell className="font-medium text-left">{job.image?.original_filename}</TableCell>
                                { userJobsInQueue > 0 && 
                                  <TableCell className="text-right">
                                  {job.position_in_queue}
                                </TableCell>
                                }
                                <TableCell className="text-left">
                                  {job.status === 'pending' && (
                                    <span className="flex items-center  gap-1 text-yellow-500">
                                      <Clock className="h-4 w-4" /> En cola
                                    </span>
                                  )}
                                  {job.status === 'processing' && (
                                    <span className="flex items-center  gap-1 text-blue-500">
                                      <Loader2 className="h-4 w-4 animate-spin" /> Procesando
                                    </span>
                                  )}
                                  {job.status === 'completed' && (
                                    <span className="flex items-center  gap-1 text-green-500">
                                      <CheckCircle className="h-4 w-4" /> Completado
                                    </span>
                                  )}
                                  {job.status === 'failed' && (
                                    <span className="flex items-center  gap-1 text-red-500">
                                      <XCircle className="h-4 w-4" /> Error
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell >
                                  <span className="text-xs text-muted-foreground">
                                    {formatFechaEspanola(job.queued_at)}, {obtenerHoraEspanola(job.queued_at)}
                                  </span>
                                </TableCell>
                                <TableCell >
                                {job.finished_at && (
                                    <span className="text-xs text-muted-foreground">
                                      {formatFechaEspanola(job.finished_at)}, {obtenerHoraEspanola(job.finished_at)}
                                    </span>    
                                )}
                                </TableCell>
                                <TableCell className="text-left">
                                  {job.type === 'title' ? (
                                    <span className="text-xs text-muted-foreground">Title</span>
                                  ) : job.type === 'description' ? (
                                    <span className="text-xs text-muted-foreground">Description</span>
                                  ) : job.type === 'image' ? (
                                    <span className="text-xs text-muted-foreground">Image</span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">Unknown</span>
                                  )}
                                </TableCell>
                                
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
              </div>
            </div>
        </AppLayout>
    );
}
