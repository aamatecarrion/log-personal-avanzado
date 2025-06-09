import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) =>{
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

export const formatFechaEspanola = (fechaUTC: string): string => {
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
export const obtenerHoraEspanola = (fechaUTC: string): string => {
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