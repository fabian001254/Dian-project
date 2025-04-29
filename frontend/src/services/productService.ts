import api from './api.config';

export interface Customer {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  taxRate?: number;
  taxRates?: { rate?: number; name?: string; id?: string }[];
  customerId?: string;
  customerName?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  companyId?: string;
  taxRateId?: string;
}

/**
 * Obtener todos los productos, opcionalmente filtrados por cliente.
 * customerId = 'todos' para todos, 'general' para sin cliente, o ID específico.
 */
export const getAllProducts = async (
  customerId?: string
): Promise<Product[]> => {
  try {
    const params: any = {};
    if (customerId && customerId !== 'todos' && customerId !== 'general') {
      params.customerId = customerId;
    }
    const response = await api.get('/products', { params });
    const products = response.data.data as Product[];
    return products.map((product) => {
      if (product.taxRates && product.taxRates.length > 0) {
        const firstRate = product.taxRates[0];
        product.taxRate = firstRate.rate;
        product.taxRateId = firstRate.id;
      }
      return product;
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

/**
 * Obtener todos los clientes.
 */
export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const response = await api.get('/customers');
    return response.data.data as Customer[];
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};
