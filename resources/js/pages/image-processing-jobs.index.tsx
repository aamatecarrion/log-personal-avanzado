import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { Image, ProcessingJob, Record, type BreadcrumbItem } from '@/types';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    hour12: false,      // Formato 24 horas
    timeZone: 'Europe/Madrid'
  };

  // Formatear usando toLocaleTimeString (es-ES para separadores correctos)
  return fecha.toLocaleTimeString('es-ES', opciones);
};

export default function ImageProcessingJobs({jobs}: { jobs: ProcessingJob[] }) {

    useAutoReload(10000)
    
    console.log("Jobs:", jobs)
    

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Records" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div>
      <div className="w-full">          
            <Card className="mb-3">
              <CardHeader>
                <CardTitle>Processing Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left">ID</TableHead>
                      <TableHead className="text-left">File name</TableHead>
                      <TableHead className="text-left">Position</TableHead>
                      <TableHead className='text-left'>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    
                    {jobs.map((job) => (
                      <TableRow key={job.id} onClick={() => router.visit(`/records/${job.image?.record?.id}`)} className="cursor-pointer">
                        <TableCell className="text-left w-[60px]">{job.id}</TableCell>
                        <TableCell className="font-medium text-left">{job.image?.original_filename}</TableCell>
                        <TableCell className="text-right">
                          {job.position_in_queue}
                        </TableCell>
                        <TableCell className="text-left">
                          {job.status === 'pending' && (
                            <span className="flex items-center  gap-1 text-yellow-500">
                              <Clock className="h-4 w-4" /> Pending
                            </span>
                          )}
                          {job.status === 'processing' && (
                            <span className="flex items-center  gap-1 text-blue-500">
                              <Loader2 className="h-4 w-4 animate-spin" /> Processing
                            </span>
                          )}
                          {job.status === 'completed' && (
                            <span className="flex items-center  gap-1 text-green-500">
                              <CheckCircle className="h-4 w-4" /> Completed
                            </span>
                          )}
                          {job.status === 'failed' && (
                            <span className="flex items-center  gap-1 text-red-500">
                              <XCircle className="h-4 w-4" /> Failed
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer" onClick={() => console.log("Delete")}>
                                <Trash className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                              <DropdownMenuItem>Action 2</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
      </div>
    </div>
            </div>
        </AppLayout>
    );
}
