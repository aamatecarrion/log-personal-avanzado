import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { Record, type BreadcrumbItem } from '@/types';
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
import { Car, MoreVertical, Search, SearchCheck, Trash } from "lucide-react"

import { router } from "@inertiajs/react"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAutoReload } from '@/hooks/useAutoReload';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Registros',
        href: '/records',
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

export default function Records({records}: { records: Record[] }) {

    useAutoReload(30000)
    
    console.log("Records:", records)
    
    
    const groupedRecords = groupByDay(records)



    function groupByDay(records: Record[]) {

        // los grupos van a ser un objeto con la fecha como clave y un array de registros como valor
        const groups: { [date: string]: Record[] } = {}

        records.forEach((record) => {

            const dateTime = record.image?.file_date ? record.image.file_date : record.created_at
            console.log("DateTime:", dateTime)
            const dayTitle = formatFechaEspanola(dateTime)
            const recordWithLocalTime = { ...record, time: obtenerHoraEspanola(dateTime) }
            if (!groups[dayTitle]) groups[dayTitle] = []
            groups[dayTitle].push(recordWithLocalTime)
        })

        return groups
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Records" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div>
                <div className="w-full">
                  {groupedRecords && Object.keys(groupedRecords).length > 0 ? (
                    Object.entries(groupedRecords).map(([date, records]) => (
                      <Card className="mb-3" key={date}>
                        <CardHeader>
                          <CardTitle>{date}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableBody>
                              {records.map((record) => (
                                <TableRow key={record.id} onClick={() => router.visit(`/records/${record.id}`)} className="cursor-pointer">
                                  <TableCell className="text-left w-[60px]">{record.time}</TableCell>
                                  <TableCell className="font-medium text-left">{record.title}</TableCell>
                                  {/* <TableCell className="text-right">
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
                                  </TableCell> */}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent>No hay registros</CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
        </AppLayout>
    );
}
