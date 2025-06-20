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
import { formatFechaEspanola, obtenerHoraEspanola } from '@/lib/utils';
import Marquee from "react-fast-marquee";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Procesamientos',
        href: '/image-processing',
    },
];


export default function ImageProcessingJobs({jobs, total_in_queue}: { jobs: ImageProcessingJob[], total_in_queue: number }) {

    useAutoReload(30000)
    
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
                        <CardTitle>Estadisticas de procesamiento</CardTitle>
                        <CardDescription>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-row justify-between flex-wrap gap-2">
                        <span>
                          Procesamientos en cola (todos los usuarios): {total_in_queue}

                        </span>
                        <span>
                          Procesamientos en cola del usuario: {userJobsInQueue}
                        </span>
                        <span>
                          Procesamientos completados del usuario: {userJobsCompleted}
                        </span>
                        <span>
                          Procesamientos fallidos del usuario: {userJobsFailed}
                        </span>
                      </CardContent>
                    </Card>
                    <Card className="mb-3">
                      <CardHeader>
                        <CardTitle>Procesamientos del usuario</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Marquee pauseOnClick speed={100}>
                        <Table className='w-full'>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-left">ID</TableHead>
                              <TableHead className="text-left">Nombre del archivo</TableHead>
                              {userJobsInQueue > 0 && <TableHead className="text-left">Posición</TableHead>}
                              <TableHead className="text-left">Estado</TableHead>
                              <TableHead className="text-left" >Añadido a la cola</TableHead>
                              <TableHead className="text-left">Iniciado</TableHead>
                              <TableHead className="text-left">Finalizado</TableHead>
                              <TableHead className="text-left">Error</TableHead>
                              <TableHead className="text-left">Tipo</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {jobs.map((job) => (
                              <TableRow key={job.id} onClick={() => router.visit(`/records/${job.image?.record?.id}`)} className="cursor-pointer">
                                <TableCell className="text-left w-[60px]">{job.id}</TableCell>
                                <TableCell className="font-medium text-left">
                                    {job.image?.original_filename}                                  
                                </TableCell>
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
                                    {job.started_at && 
                                      <span className="text-xs text-muted-foreground">
                                          {formatFechaEspanola(job.started_at)}, {obtenerHoraEspanola(job.started_at)}
                                      </span>
                                    }
                                </TableCell>
                                <TableCell >
                                {job.finished_at && (
                                      <span className="text-xs text-muted-foreground">
                                        {formatFechaEspanola(job.finished_at)}, {obtenerHoraEspanola(job.finished_at)}
                                      </span>                                    )}
                                </TableCell>
                                {job.error && (
                                  <TableCell className="text-left">
                                    <span className="text-xs text-muted-foreground">{job.error}</span>
                                  </TableCell>
                                )}
                                <TableCell className="text-left">
                                  {job.type === 'title' ? (
                                    <span className="text-xs text-muted-foreground">Título</span>
                                  ) : job.type === 'description' ? (
                                    <span className="text-xs text-muted-foreground">Descripción</span>
                                  ) : job.type === 'image' ? (
                                    <span className="text-xs text-muted-foreground">Imagen</span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">Desconocido</span>
                                  )}
                                </TableCell>
                                
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        </Marquee>
                      </CardContent>
                    </Card>
              </div>
            </div>
        </AppLayout>
    );
}

