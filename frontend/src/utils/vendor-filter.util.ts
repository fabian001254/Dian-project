/**
 * Utilidad para filtrar datos según el vendedor
 * Este archivo contiene funciones para filtrar diferentes tipos de datos
 * basados en el ID del vendedor que ha iniciado sesión
 */

/**
 * Filtra un array de objetos para mostrar solo los que pertenecen al vendedor especificado
 * @param data Array de objetos a filtrar
 * @param vendorId ID del vendedor
 * @param vendorIdField Nombre del campo que contiene el ID del vendedor (por defecto 'vendorId')
 * @returns Array filtrado
 */
export const filterByVendor = <T extends Record<string, any>>(
  data: T[],
  vendorId: string | undefined,
  vendorIdField: string = 'vendorId'
): T[] => {
  if (!vendorId || !data || !Array.isArray(data)) {
    return data || [];
  }
  
  return data.filter(item => item[vendorIdField] === vendorId);
};

/**
 * Determina si el usuario actual es un vendedor
 * @returns true si el usuario es un vendedor, false en caso contrario
 */
export const isVendorUser = (): boolean => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    
    const user = JSON.parse(userStr);
    return user && user.role === 'vendor';
  } catch (error) {
    console.error('Error al verificar el rol del usuario:', error);
    return false;
  }
};

/**
 * Obtiene el ID del vendedor actual si el usuario es un vendedor
 * @returns ID del vendedor o undefined si el usuario no es un vendedor
 */
export const getCurrentVendorId = (): string | undefined => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return undefined;
    
    const user = JSON.parse(userStr);
    return user && user.role === 'vendor' ? user.id : undefined;
  } catch (error) {
    console.error('Error al obtener el ID del vendedor:', error);
    return undefined;
  }
};

/**
 * Añade el ID del vendedor a los filtros si el usuario es un vendedor
 * @param filters Filtros actuales
 * @returns Filtros con el ID del vendedor añadido si corresponde
 */
export const addVendorToFilters = <T extends Record<string, any>>(filters: T): T & { vendorId?: string } => {
  const vendorId = getCurrentVendorId();
  
  if (vendorId) {
    console.log('Añadiendo filtro de vendedor:', vendorId);
    return { ...filters, vendorId };
  }
  
  return filters;
};

export default {
  filterByVendor,
  isVendorUser,
  getCurrentVendorId,
  addVendorToFilters
};
