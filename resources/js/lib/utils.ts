import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const spanishTimestampConvert = (fechaUTC: string): string => {
  const fecha = new Date(fechaUTC);
  
  // Opciones para formatear cada parte de la fecha/hora
  const opciones: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,      // Formato 24h
    timeZone: 'Europe/Madrid'
  };

  // Formateamos las partes de la fecha
  const formateador = new Intl.DateTimeFormat('es-ES', opciones);
  const partes = formateador.formatToParts(fecha);

  // Extraemos cada componente (TypeScript sabe que existen por las opciones)
  const año = partes.find(p => p.type === 'year')!.value;
  const mes = partes.find(p => p.type === 'month')!.value;
  const dia = partes.find(p => p.type === 'day')!.value;
  const hora = partes.find(p => p.type === 'hour')!.value.padStart(2, '0'); // Aseguramos 2 dígitos
  const minuto = partes.find(p => p.type === 'minute')!.value.padStart(2, '0');
  const segundo = partes.find(p => p.type === 'second')!.value.padStart(2, '0');

  // Formato final: "YYYY-MM-DD HH:mm:ss"
  return `${año}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
};
