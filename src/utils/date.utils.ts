/**
 * Formatea una fecha en formato YYYY-MM-DD
 * @param date Fecha a formatear
 */
export function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Formatea una fecha en formato DD/MM/YYYY
 * @param date Fecha a formatear
 */
export function formatDateDDMMYYYY(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formatea una hora en formato HH:MM:SS
 * @param date Fecha con hora
 */
export function formatTime(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split('T')[1].substring(0, 8);
}

/**
 * Formatea una fecha y hora en formato DD/MM/YYYY HH:MM:SS
 * @param date Fecha con hora
 */
export function formatDateTime(date: Date | string): string {
  return `${formatDateDDMMYYYY(date)} ${formatTime(date)}`;
}

/**
 * Calcula la fecha de vencimiento a partir de una fecha y un número de días
 * @param date Fecha base
 * @param days Número de días
 */
export function calculateDueDate(date: Date, days: number): Date {
  const dueDate = new Date(date);
  dueDate.setDate(dueDate.getDate() + days);
  return dueDate;
}

/**
 * Obtiene la diferencia en días entre dos fechas
 * @param date1 Primera fecha
 * @param date2 Segunda fecha
 */
export function getDaysDifference(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Verifica si una fecha está vencida
 * @param date Fecha a verificar
 */
export function isExpired(date: Date): boolean {
  return date < new Date();
}

/**
 * Obtiene el nombre del mes en español
 * @param month Número del mes (0-11)
 */
export function getMonthName(month: number): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[month];
}

/**
 * Formatea una fecha en formato largo (ej: 19 de Abril de 2025)
 * @param date Fecha a formatear
 */
export function formatLongDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  const day = d.getDate();
  const month = getMonthName(d.getMonth());
  const year = d.getFullYear();
  return `${day} de ${month} de ${year}`;
}
