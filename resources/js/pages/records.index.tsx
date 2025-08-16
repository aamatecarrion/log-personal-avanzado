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
import { useEffect, useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Car, MoreVertical, Search, SearchCheck, Trash } from "lucide-react"

import { router } from "@inertiajs/react"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ScrollTopButton from '@/components/ScrollTopButton';
import BottomMenu from '@/components/BottomMenu';

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
  const diaSemana = partes.find(p => p.type === 'weekday')!.value;
  const año = partes.find(p => p.type === 'year')!.value;
  const mes = partes.find(p => p.type === 'month')!.value;
  const dia = partes.find(p => p.type === 'day')!.value;
  const diaCapitalizado = diaSemana[0].toUpperCase() + diaSemana.slice(1).toLowerCase();
  return `${diaCapitalizado}, ${año}-${mes}-${dia}`;
};

const obtenerHoraEspanola = (fechaUTC: string): string => {
  const fecha = new Date(fechaUTC);
  return fecha.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Europe/Madrid'
  });
};

function getHighlightedText(text: string, highlight: string) {
  if (!highlight) return truncateText(text);
  const regex = new RegExp(`(.{0,20})(${highlight})(.{0,20})`, 'i');
  const match = text.match(regex);
  if (!match) return truncateText(text);

  const startTruncated = match.index! > 0;
  const endTruncated = match.index! + match[0].length < text.length;

  return (
    <span>
      {startTruncated && '...'}{match[1]}<mark>{match[2]}</mark>{match[3]}{endTruncated && '...'}
    </span>
  );
}

function truncateText(text: string, length: number = 80) {
  return text.length > length ? text.substring(0, length) + '...' : text;
}

export default function Records({ records }: { records: Record[] }) {
  const { user } = usePage<any>().props.auth;
  const [localRecords, setLocalRecords] = useState<Record[]>(records);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Echo) {
      const channel = window.Echo.private(`user.${user.id}`);
      
      channel.listen('.records.update', (e: any) => {
        console.log('Records updated:', e);
        const updatedRecord = e.record
        setLocalRecords((prev) => {
          const found = prev.find(r => r.id === updatedRecord.id);
          if (found) {
            // actualizar el record existente
            return prev.map(r => r.id === updatedRecord.id ? updatedRecord : r);
          } else {
            // si es nuevo, lo añadimos
            return [updatedRecord, ...prev];
          }
        });
      });

      return () => {
        window.Echo.leave(`user.${user.id}`);
      };
    }
  }, [user.id]);
  
  //useAutoReload(10000);

  const [search, setSearch] = useState('');

  const filteredRecords = localRecords.filter(record => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      record.title.toLowerCase().includes(q) ||
      record.description?.toLowerCase().includes(q) ||
      record.image?.generated_description?.toLowerCase().includes(q)
    );
  });
  function orderGroups(obj : any) {

    const entries = Object.entries(obj);

    entries.sort((a, b) => {
      const dateA = a[0].split(', ')[1];
      const dateB = b[0].split(', ')[1];
      
      return dateB.localeCompare(dateA);
    });

    return Object.fromEntries(entries);
  }
  function groupByDay(records: Record[]) {
    const groups: { [date: string]: Record[] } = {};
    records.forEach((record) => {
      const dateTime = record.image?.file_date ?? record.created_at;
      const dayTitle = formatFechaEspanola(dateTime);
      const recordWithLocalTime = { ...record, time: obtenerHoraEspanola(dateTime) };
      if (!groups[dayTitle]) groups[dayTitle] = [];
      groups[dayTitle].push(recordWithLocalTime);
    });

    const orderedGroups = orderGroups(groups);
    
    return orderedGroups;
  }

  const groupedRecords = groupByDay(filteredRecords);

  const renderField = (field: string, highlight: string) => {
    if (!field) return null;
    return getHighlightedText(field, highlight);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Records" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-hidden">
        <Input
          type="search"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="w-full">
          {Object.keys(groupedRecords).length > 0 ? (
            Object.entries(groupedRecords).map(([date, records]) => (
              <Card className="mb-3" key={date}>
                <CardHeader>
                  <CardTitle>{date}</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table className="table-fixed w-full">
                    <TableBody>
                      {(records as Record[]).sort((a, b) => new Date(b.image?.file_date ?? b.created_at).getTime() - new Date(a.image?.file_date ?? a.created_at).getTime()).map((record) => {
                        const title = renderField(record.title, search);
                        const description = renderField(record.description ?? '', search);
                        const generated = renderField(record.image?.generated_description ?? '', search);

                        const parts = [title, description, generated].filter(Boolean);

                        return (
                          <TableRow
                            key={record.id}
                            onClick={() => router.visit(`/records/${record.id}`)}
                            className="cursor-pointer"
                          >
                            <TableCell className="text-left w-[60px] whitespace-nowrap">{record.time}</TableCell>
                            <TableCell className="font-medium text-left whitespace-normal break-words">
                              {parts.map((part, i) => (
                                <span key={i} className="inline">
                                  {i > 0 && ' - '}{part}
                                </span>
                              ))}
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
      <ScrollTopButton className="fixed bottom-6 right-6 hidden md:block" />
      <BottomMenu />
    </AppLayout>
  );
}
