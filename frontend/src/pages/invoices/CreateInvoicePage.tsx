import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlus, FaTrash, FaInfoCircle, FaSearch, FaEdit } from 'react-icons/fa';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import SectionLoader from '../../components/ui/SectionLoader';
import ProductSelectorModal from '../../components/modals/ProductSelectorModal';
import CreateProductModal from '../../components/modals/CreateProductModal';
import CustomerSelectorModal from '../../components/modals/CustomerSelectorModal';
import VendorSelectorModal from '../../components/modals/VendorSelectorModal';
import Swal from 'sweetalert2';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
`;

const PageTitle = styled.h1`
  font-size: var(--font-size-xl);
  color: var(--color-text);
  margin: 0;
`;

const FormSection = styled.div`
  margin-bottom: var(--spacing-xl);
`;

const SectionTitle = styled.h2`
  font-size: var(--font-size-md);
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
  
  svg {
    margin-left: var(--spacing-xs);
    color: var(--color-primary);
    cursor: help;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
`;

const TableContainer = styled.div`
  margin-bottom: var(--spacing-lg);
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: var(--color-white);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);

  th, td {
    border-right: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
  }
  th:last-child, td:last-child {
    border-right: none;
  }
  /* Dark mode overrides */
  html[data-theme='dark'] & {
    background-color: var(--color-background);
    border-color: var(--color-gray-dark);
    th, td {
      border-right-color: var(--color-gray-dark);
      border-bottom-color: var(--color-gray-dark);
    }
  }
`;

const TableHead = styled.thead`
  background-color: var(--color-gray-light);
  /* Dark mode override for table header */
  html[data-theme='dark'] & {
    background-color: var(--color-gray-dark);
  }
`;

const TableRow = styled.tr`
  &:not(:last-child) {
    border-bottom: 1px solid var(--color-border);
  }
`;

const TableHeaderCell = styled.th`
  padding: var(--spacing-md);
  text-align: left;
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  /* Dark mode override for table header cell */
  html[data-theme='dark'] & {
    color: var(--color-white);
  }
  border-right: 1px solid var(--color-border);
  &:last-child {
    border-right: none;
  }
`;

const TableCell = styled.td`
  padding: var(--spacing-md);
  vertical-align: middle;
  border-right: 1px solid var(--color-border);
  &:last-child {
    border-right: none;
  }
  /* Dark mode override */
  html[data-theme='dark'] & {
    color: var(--color-white);
  }
`;

const AddItemButton = styled(Button)`
  margin-bottom: var(--spacing-lg);
`;

const TotalsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-top: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 300px;
  margin-bottom: var(--spacing-xs);
  padding: var(--spacing-xs) 0;
  
  &:last-child {
    border-top: 1px solid var(--color-border);
    font-weight: var(--font-weight-bold);
    padding-top: var(--spacing-sm);
    margin-top: var(--spacing-xs);
  }
`;

const TotalLabel = styled.span`
  color: var(--color-text);
`;

const TotalValue = styled.span`
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
`;

const Tooltip = styled.div`
  position: relative;
  display: inline-block;
  
  &:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
  }
`;

const TooltipText = styled.div`
  visibility: hidden;
  width: 250px;
  background-color: var(--color-text);
  color: var(--color-white);
  text-align: center;
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-sm);
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
  font-size: var(--font-size-xs);
  
  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: var(--color-text) transparent transparent transparent;
  }
`;

// Styled button for consistent select actions
const SelectButton = styled(Button)`
  min-width: auto;
  padding: 2px 6px;
  height: 32px;
  line-height: 1;
`;

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface Vendor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  taxRate?: number | { rate?: number; name?: string };
  taxRateId?: string;
  taxRates?: { rate?: number; name?: string }[];
  customerId?: string;
  customerName?: string;
}

interface InvoiceItem {
  id: string;
  productId: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  customerId?: string;
  customerName?: string;
}

interface InvoiceData {
  vendorId: string;
  customerId: string;
  date: string;
  dueDate: string;
  notes: string;
  items: InvoiceItem[];
}

const CreateInvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerFilter, setCustomerFilter] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [isCustomerSelectorOpen, setIsCustomerSelectorOpen] = useState(false);
  const [isVendorSelectorOpen, setIsVendorSelectorOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({ isOpen: false, type: 'success', title: '', message: '' });

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    vendorId: '',
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    items: [],
  });

  const [vendorName, setVendorName] = useState('');

  // Filtro de cliente para los productos
  const [clientFilter, setClientFilter] = useState<string>('all');

  // Calcular totales
  const subtotal = invoiceData.items.reduce((sum, item) => sum + item.subtotal, 0);
  const taxTotal = invoiceData.items.reduce((sum, item) => sum + item.taxAmount, 0);
  const total = subtotal + taxTotal;

  useEffect(() => {
    let isMounted = true; // Flag para evitar actualizaciones en componentes desmontados

    // Solo cargar clientes si aún no han sido cargados
    if (customers.length === 0) {
      const loadInitialData = async () => {
        try {
          setIsLoading(true);

          // Cargar clientes - solo usar los reales de la base de datos
          try {
            const customersResponse = await axios.get('/api/customers');
            if (customersResponse.data && Array.isArray(customersResponse.data)) {
              setCustomers(customersResponse.data);
              console.log('Clientes cargados correctamente:', customersResponse.data.length);
            } else if (customersResponse.data && customersResponse.data.success) {
              setCustomers(customersResponse.data.data);
              console.log('Clientes cargados correctamente:', customersResponse.data.data.length);
            } else {
              console.error('La API no devolvió datos válidos para los clientes');
              setError('No se pudieron cargar los clientes. Por favor, intente de nuevo.');
            }
          } catch (apiErr) {
            console.error('Error cargando clientes desde la API:', apiErr);
            setError('Error al cargar los clientes. Por favor, intente de nuevo.');
          }

          const customerId = queryParams.get('customerId');
          if (customerId) {
            setInvoiceData((prev) => ({
              ...prev,
              customerId,
            }));
          }
        } catch (err) {
          console.error('Error cargando clientes:', err);
          setError('No se pudieron cargar los clientes. Por favor, intente de nuevo.');
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };
      loadInitialData();
    } else {
      setIsLoading(false);
    }

    // Cleanup function para evitar memory leaks
    return () => {
      isMounted = false;
    };
  }, [queryParams, customers.length]);

  // Función para cargar productos solo cuando sea necesario
  const loadProducts = async () => {
    try {
      setIsLoading(true);

      // Intentar cargar los productos reales desde la API
      try {
        const productsResponse = await axios.get('http://localhost:3001/api/products');
        if (productsResponse.data && productsResponse.data.success && Array.isArray(productsResponse.data.data)) {
          // Usar los productos reales de la API
          setProducts(productsResponse.data.data);
          console.log('Productos cargados desde la API:', productsResponse.data.data);
        } else {
          // Si no hay datos reales, usar datos de ejemplo
          const mockProducts: Product[] = [
            { id: '1', name: 'Servicio de Consultoría', description: 'Servicio profesional de consultoría empresarial', price: 1000000, taxRate: 19 },
            { id: '2', name: 'Desarrollo de Software', description: 'Desarrollo de aplicaciones a medida', price: 2500000, taxRate: 19 },
            { id: '3', name: 'Mantenimiento Preventivo', description: 'Servicio de mantenimiento preventivo de equipos', price: 500000, taxRate: 19 },
            { id: '4', name: 'Licencia de Software', description: 'Licencia anual de software empresarial', price: 1200000, taxRate: 19 },
            { id: '5', name: 'Soporte Técnico', description: 'Servicio de soporte técnico mensual', price: 350000, taxRate: 19 }
          ];

          console.log('Usando productos de ejemplo porque la API no devolvió datos válidos');
          setProducts(mockProducts);
        }
      } catch (apiErr) {
        console.error('Error cargando productos desde la API:', apiErr);

        // Si falla la API, usar datos de ejemplo
        const mockProducts: Product[] = [
          { id: '1', name: 'Servicio de Consultoría', description: 'Servicio profesional de consultoría empresarial', price: 1000000, taxRate: 19 },
          { id: '2', name: 'Desarrollo de Software', description: 'Desarrollo de aplicaciones a medida', price: 2500000, taxRate: 19 },
          { id: '3', name: 'Mantenimiento Preventivo', description: 'Servicio de mantenimiento preventivo de equipos', price: 500000, taxRate: 19 },
          { id: '4', name: 'Licencia de Software', description: 'Licencia anual de software empresarial', price: 1200000, taxRate: 19 },
          { id: '5', name: 'Soporte Técnico', description: 'Servicio de soporte técnico mensual', price: 350000, taxRate: 19 }
        ];

        console.log('Usando productos de ejemplo porque la API falló');
        setProducts(mockProducts);
      }
    } catch (err) {
      console.error('Error cargando productos:', err);
      setError('No se pudieron cargar los productos. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para manejar el cambio en el filtro de cliente
  const handleClientFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setClientFilter(e.target.value);
  };

  // Función para manejar cambios en los ítems de la factura
  const handleItemChange = (itemId: string, field: string, value: any) => {
    // Crear una copia de los ítems actuales
    const updatedItems = invoiceData.items.map(item => {
      if (item.id === itemId) {
        // Crear una copia del ítem
        const updatedItem = { ...item, [field]: value };

        // Si el campo es productId, buscar el producto y actualizar los campos
        if (field === 'productId' && value && value !== 'new') {
          const selectedProduct = products.find(p => p.id === value);
          if (selectedProduct) {
            // Actualizar campos del producto seleccionado
            updatedItem.name = selectedProduct.name;
            updatedItem.description = selectedProduct.description || '';
            updatedItem.unitPrice = selectedProduct.price || 0;
            updatedItem.taxRate = typeof selectedProduct.taxRate === 'number' ?
              (selectedProduct.taxRate) :
              (selectedProduct.taxRate?.rate || 0);
          }
        }

        // Recalcular subtotal, impuesto y total
        updatedItem.subtotal = updatedItem.quantity * updatedItem.unitPrice;
        updatedItem.taxAmount = updatedItem.subtotal * (updatedItem.taxRate / 100);
        updatedItem.total = updatedItem.subtotal + updatedItem.taxAmount;

        return updatedItem;
      }
      return item;
    });

    setInvoiceData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  // Función para agregar un producto a la factura por su ID
  const addItem = async (productId: string) => {
    // Verificar que el ID es válido
    if (!productId) {
      console.error('ID de producto inválido');
      return;
    }

    // Evitar agregar productos duplicados
    if (invoiceData.items.some((item) => item.productId === productId)) {
      console.log('Producto ya existe en la factura, no se agregará de nuevo:', productId);
      return;
    }

    console.log('Intentando agregar producto con ID:', productId);

    // Buscar el producto seleccionado
    const selectedProduct = products.find((p) => p.id === productId);
    if (!selectedProduct) {
      console.error('Producto no encontrado en la lista local, intentando cargarlo desde la API');

      // Intentar cargar el producto directamente desde la API
      try {
        const response = await axios.get(`/api/products/${productId}`);
        if (response.data && response.data.success) {
          console.log('Producto cargado directamente de la API:', response.data.data);
          // Verificar que no se haya agregado mientras se cargaba
          if (!invoiceData.items.some((item) => item.productId === productId)) {
            await addItemWithProduct(response.data.data);
          }
        } else {
          console.error('No se pudo encontrar el producto seleccionado');
          setError('No se pudo encontrar el producto seleccionado. Por favor, intente de nuevo.');
        }
      } catch (error) {
        console.error('Error cargando el producto:', error);
        setError('Error al cargar el producto. Por favor, intente de nuevo.');
      }

      return;
    }

    // Si encontramos el producto, lo agregamos
    if (selectedProduct) {
      console.log('addItem - producto seleccionado:', selectedProduct);
      await addItemWithProduct(selectedProduct);
    }
  };

  // Función auxiliar para agregar un producto a la factura
  const addItemWithProduct = async (selectedProduct: Product) => {
    console.log('Producto seleccionado completo:', selectedProduct);
    console.log('Tipo de taxRate:', typeof selectedProduct.taxRate);
    console.log('Valor de taxRate:', selectedProduct.taxRate);
    
    // Calcular el tipo de impuesto (IVA)
    let taxRate = 0;
    if (selectedProduct.taxRateId) {
      // Fetch robusto de tasa de impuesto vía API
      try {
        const resp = await axios.get(`/api/tax-rates/${selectedProduct.taxRateId}`);
        console.log('API taxRate fetch resp:', resp.data);
        // Determinar objeto con rate
        let rateObj: any;
        if (resp.data && resp.data.success && resp.data.data) {
          rateObj = resp.data.data;
        } else {
          rateObj = resp.data;
        }
        // Si es array, tomar primer elemento
        if (Array.isArray(rateObj)) rateObj = rateObj[0];
        taxRate = (rateObj && rateObj.rate) != null ? rateObj.rate : 0;
      } catch (e) {
        console.error('Error obteniendo taxRate por ID:', e);
      }
    } else if (typeof selectedProduct.taxRate === 'number') {
      taxRate = selectedProduct.taxRate;
    } else if (selectedProduct.taxRates && selectedProduct.taxRates.length > 0) {
      taxRate = selectedProduct.taxRates[0].rate || 0;
    }
    console.log('Tasa de impuesto calculada:', taxRate);
    
    // Crear un nuevo ítem para la factura
    const newItem: InvoiceItem = {
      id: uuidv4(),
      productId: selectedProduct.id,
      name: selectedProduct.name,
      description: selectedProduct.description || '',
      quantity: 1,
      unitPrice: selectedProduct.price,
      taxRate: taxRate,
      subtotal: selectedProduct.price,
      taxAmount: (selectedProduct.price * 1 * taxRate) / 100,
      total: selectedProduct.price * 1 + ((selectedProduct.price * 1 * taxRate) / 100),
      customerId: selectedProduct.customerId || invoiceData.customerId,
      customerName: selectedProduct.customerName || customers.find(c => c.id === (selectedProduct.customerId || invoiceData.customerId))?.name
    };
    
    console.log('Nuevo ítem creado:', newItem);
    console.log('taxRate del ítem:', newItem.taxRate);
    console.log('taxAmount del ítem:', newItem.taxAmount);

    console.log('Agregando ítem a la factura:', {
      productId: selectedProduct.id,
      name: selectedProduct.name,
    });

    // Agregar el nuevo ítem a la factura
    setInvoiceData(prev => {
      const updatedItems = [...prev.items, newItem];
      console.log(`Factura actualizada: ${updatedItems.length} ítems`);
      return {
        ...prev,
        items: updatedItems
      };
    });

    // Actualizar la lista de productos para incluir el recién agregado si no existe
    if (!products.some(p => p.id === selectedProduct.id)) {
      setProducts(prev => [...prev, selectedProduct]);
    }
  };

  const removeItem = (itemId: string) => {
    // Filtrar los ítems para eliminar el seleccionado
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId)
    }));
  };

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Función para guardar la factura
  const saveInvoice = async (asDraft: boolean = false) => {
    try {
      setIsSaving(true);

      // Validar formulario
      if (!invoiceData.customerId) {
        await Swal.fire({ icon: 'warning', title: 'Atención', text: 'Por favor seleccione un cliente', confirmButtonColor: 'var(--color-primary)' });
        return;
      }

      if (!invoiceData.vendorId) {
        await Swal.fire({ icon: 'warning', title: 'Atención', text: 'Por favor seleccione un vendedor', confirmButtonColor: 'var(--color-primary)' });
        return;
      }

      if (invoiceData.items.length === 0) {
        await Swal.fire({ icon: 'warning', title: 'Atención', text: 'Debe agregar al menos un ítem a la factura', confirmButtonColor: 'var(--color-primary)' });
        return;
      }

      // Enviar a backend
      await axios.post('/api/invoices', {
        invoiceData: { ...invoiceData, status: asDraft ? 'draft' : 'final' },
        items: invoiceData.items
      });
      await Swal.fire({ icon: 'success', title: '¡Factura creada!', text: asDraft ? 'Borrador guardado exitosamente' : 'Factura creada exitosamente', confirmButtonColor: 'var(--color-primary)' });
      navigate('/invoices');
    } catch (error) {
      console.error('Error al guardar la factura:', error);
      await Swal.fire({ icon: 'error', title: 'Error', text: 'Error al guardar la factura', confirmButtonColor: 'var(--color-primary)' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Card>
        <FormSection>
          <SectionTitle>Detalles de la Factura</SectionTitle>
          <div style={{ marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-md)' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Cliente</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                <Input placeholder="Seleccione un cliente" value={invoiceData.customerId ? customers.find(c => c.id === invoiceData.customerId)?.name || '' : ''} readOnly fullWidth />
                <SelectButton variant="secondary" size="small" onClick={() => setIsCustomerSelectorOpen(true)}>
                  Seleccionar
                </SelectButton>
                <Button variant="outline" size="small" onClick={() => navigate('/customers/create')}>
                  Crear cliente
                </Button>
              </div>
              {invoiceData.customerId && (
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  ID: {invoiceData.customerId}
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Vendedor</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                <Input placeholder="Seleccione un vendedor" value={vendorName} readOnly fullWidth />
                <SelectButton variant="secondary" size="small" onClick={() => setIsVendorSelectorOpen(true)}>
                  Seleccionar
                </SelectButton>
                <Button variant="outline" size="small" onClick={() => navigate('/vendors/create')}>
                  Crear vendedor
                </Button>
              </div>
              {invoiceData.vendorId && (
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  ID: {invoiceData.vendorId}
                </div>
              )}
            </div>
          </div>
          <label style={{ fontWeight: 500 }}>Fecha de emisión</label>
          <Input
            name="date"
            type="date"
            value={invoiceData.date}
            onChange={handleInputChange}
            fullWidth
          />
          <label style={{ fontWeight: 500 }}>Fecha de vencimiento</label>
          <Input
            name="dueDate"
            type="date"
            value={invoiceData.dueDate}
            onChange={handleInputChange}
            fullWidth
          />
        </FormSection>

        <FormSection>
          <SectionTitle>Ítems de la Factura</SectionTitle>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <SelectButton
                variant="secondary"
                size="small"
                onClick={() => setIsProductSelectorOpen(true)}
              >
                Seleccionar Producto
              </SelectButton>
              <Button
                onClick={() => setIsCreateProductOpen(true)}
                size="small"
                variant="primary"
                style={{ fontSize: '0.85rem', padding: '2px 6px', height: '28px', lineHeight: '1' }}
              >
                Crear Producto
              </Button>
            </div>
            <div style={{ width: '300px' }}>
              <Select
                label="Filtrar por cliente"
                value={clientFilter}
                onChange={handleClientFilterChange}
                fullWidth
              >
                <option value="all">Todos los productos</option>
                <option value="general">Productos generales</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Producto</TableHeaderCell>
                  <TableHeaderCell>Descripción</TableHeaderCell>
                  <TableHeaderCell style={{ textAlign: 'center', width: 90 }}>Cantidad</TableHeaderCell>
                  <TableHeaderCell style={{ textAlign: 'right', width: 120 }}>Precio Unitario</TableHeaderCell>
                  <TableHeaderCell style={{ textAlign: 'right', width: 120 }}>Subtotal</TableHeaderCell>
                  <TableHeaderCell style={{ textAlign: 'center', width: 80 }}>IVA (%)</TableHeaderCell>
                  <TableHeaderCell style={{ textAlign: 'right', width: 120 }}>IVA</TableHeaderCell>
                  <TableHeaderCell style={{ textAlign: 'right', width: 120 }}>Total</TableHeaderCell>
                  <TableHeaderCell style={{ textAlign: 'center', width: 80 }}>Acciones</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {invoiceData.items
                  .filter((item) => {
                    // Si el filtro es 'all', mostrar todos los productos
                    if (clientFilter === 'all') return true;

                    // Buscar el producto asociado al ítem
                    const product = products.find((p) => p.id === item.productId);

                    // Si el filtro es 'general', mostrar solo productos sin cliente específico
                    if (clientFilter === 'general') {
                      return !product?.customerId;
                    }

                    // Si hay un filtro de cliente específico, mostrar solo productos de ese cliente
                    return product?.customerId === clientFilter;
                  })
                  .map((item) => (
                    <tr key={item.id}>
                      {/* Producto */}
                      <TableCell>
                        {item.productId && item.productId !== 'new' ? (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                {products.find(p => p.id === item.productId)?.name || 'Producto'}
                              </div>
                              <div style={{ fontSize: '0.85em', color: 'var(--color-text-secondary)' }}>
                                {products.find(p => p.id === item.productId)?.customerId
                                  ? `Cliente: ${products.find(p => p.id === item.productId)?.customerName || 'Específico'}`
                                  : 'Producto general'}
                              </div>
                            </div>
                            <Button
                              variant="text"
                              size="small"
                              onClick={() => {
                                const updatedItems = [...invoiceData.items];
                                const itemIndex = updatedItems.findIndex(i => i.id === item.id);
                                if (itemIndex !== -1) {
                                  updatedItems[itemIndex] = {
                                    ...updatedItems[itemIndex],
                                    productId: ''
                                  };
                                  setInvoiceData(prev => ({ ...prev, items: updatedItems }));
                                }
                              }}
                            >
                              <FaEdit />
                            </Button>
                          </div>
                        ) : (
                          <Select
                            value={item.productId || ''}
                            onChange={(e) => handleItemChange(item.id, 'productId', e.target.value)}
                            fullWidth
                          >
                            <option value="">Seleccione un producto</option>
                            <option value="new">-- Crear nuevo producto --</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} - {formatCurrency(product.price)}
                                {product.customerId ? ' (Cliente específico)' : ''}
                              </option>
                            ))}
                          </Select>
                        )}
                      </TableCell>
                      {/* Descripción */}
                      <TableCell>
                        {item.productId && item.productId !== 'new' ? (
                          <div style={{ padding: '8px 12px' }}>{item.description}</div>
                        ) : (
                          <Input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            fullWidth
                          />
                        )}
                      </TableCell>
                      {/* Cantidad */}
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          min={1}
                          step={1}
                          style={{ textAlign: 'center', width: 70 }}
                          onChange={e => {
                            const val = Math.max(1, Math.floor(Number(e.target.value) || 1));
                            handleItemChange(item.id, 'quantity', val);
                          }}
                          fullWidth
                        />
                      </TableCell>
                      {/* Precio Unitario */}
                      <TableCell>
                        {item.productId && item.productId !== 'new' ? (
                          <div style={{ padding: '8px 12px', textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</div>
                        ) : (
                          <Input
                            type="number"
                            value={item.unitPrice}
                            min={0}
                            step={0.01}
                            style={{ textAlign: 'right', width: 90 }}
                            onChange={e => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            fullWidth
                          />
                        )}
                      </TableCell>
                      {/* Subtotal */}
                      <TableCell style={{ textAlign: 'right' }}>
                        {formatCurrency(item.subtotal)}
                      </TableCell>
                      {/* IVA (%) */}
                      <TableCell style={{ textAlign: 'center' }}>
                        <span style={{ padding: '4px 8px', display: 'inline-block' }}>
                          {typeof item.taxRate === 'number' ? item.taxRate.toFixed(2) : '0.00'}%
                        </span>
                      </TableCell>
                      {/* IVA */}
                      <TableCell style={{ textAlign: 'right' }}>
                        <span>
                          {formatCurrency(item.taxAmount || 0)}
                        </span>
                      </TableCell>
                      {/* Total */}
                      <TableCell style={{ textAlign: 'right' }}>
                        {formatCurrency(item.total)}
                      </TableCell>
                      {/* Acciones */}
                      <TableCell style={{ textAlign: 'center' }}>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => removeItem(item.id)}
                          title="Eliminar ítem"
                          style={{ padding: '4px', minWidth: 'auto' }}
                        >
                          <FaTrash size={14} />
                        </Button>
                      </TableCell>
                    </tr>
                  ))}
                {invoiceData.items.length > 0 &&
                  invoiceData.items.filter(item => {
                    if (clientFilter === 'all') return true;
                    const product = products.find(p => p.id === item.productId);
                    if (clientFilter === 'general') return !product?.customerId;
                    return product?.customerId === clientFilter;
                  }).length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--spacing-md)' }}>
                        No hay productos que coincidan con el filtro seleccionado
                      </td>
                    </tr>
                  )}
                {invoiceData.items.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--spacing-md)' }}>
                      No hay productos añadidos a la factura
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>

          <TotalsContainer>
            <TotalRow>
              <TotalLabel>Subtotal:</TotalLabel>
              <TotalValue>{formatCurrency(subtotal)}</TotalValue>
            </TotalRow>
            <TotalRow>
              <TotalLabel>IVA:</TotalLabel>
              <TotalValue>{formatCurrency(taxTotal)}</TotalValue>
            </TotalRow>
            <TotalRow>
              <TotalLabel>Total:</TotalLabel>
              <TotalValue>{formatCurrency(total)}</TotalValue>
            </TotalRow>
          </TotalsContainer>
        </FormSection>

        <FormSection>
          <SectionTitle>Notas Adicionales</SectionTitle>
          <Input
            type="textarea"
            name="notes"
            value={invoiceData.notes}
            onChange={handleInputChange}
            placeholder="Ingrese notas o información adicional para esta factura"
            fullWidth
          />
        </FormSection>

        <ActionButtons>
          <Button
            variant="outline"
            onClick={() => saveInvoice(true)}
            isLoading={isSaving}
          >
            Guardar como Borrador
          </Button>
          <Button
            variant="primary"
            onClick={() => saveInvoice(false)}
            isLoading={isSaving}
          >
            Crear Factura
          </Button>
        </ActionButtons>
      </Card>
      <ProductSelectorModal
        isOpen={isProductSelectorOpen}
        onClose={() => setIsProductSelectorOpen(false)}
        onSelectProduct={(productId) => {
          console.log('Producto seleccionado en el modal:', productId);
          // Agregar el producto a la factura solo cuando se selecciona
          if (productId) {
            // El modal ya se cierra en el componente ProductSelectorModal
            // y allí se llama a onSelectProduct con un setTimeout
            addItem(productId);
          }
        }}
        customerId={invoiceData.customerId}
      />
      <CreateProductModal
        isOpen={isCreateProductOpen}
        onClose={() => setIsCreateProductOpen(false)}
        onSave={(productData) => {
          const newProduct: Product = {
            id: uuidv4(),
            name: productData.name,
            description: productData.description,
            price: productData.price,
            taxRate: productData.taxRate
          };
          setProducts(prev => [...prev, newProduct]);
          addItem(newProduct.id);
          setIsCreateProductOpen(false);
        }}
        vendorId={invoiceData.vendorId}
      />

      {/* Modal para seleccionar cliente */}
      <CustomerSelectorModal
        isOpen={isCustomerSelectorOpen}
        onClose={() => setIsCustomerSelectorOpen(false)}
        onSelectCustomer={(customerId) => {
          setInvoiceData(prev => ({
            ...prev,
            customerId
          }));
        }}
        initialCustomerId={invoiceData.customerId}
      />
      <VendorSelectorModal
        isOpen={isVendorSelectorOpen}
        onClose={() => setIsVendorSelectorOpen(false)}
        onSelectVendor={async (id) => {
          setInvoiceData(prev => ({ ...prev, vendorId: id }));
          try {
            const resp = await axios.get(`/api/users/${id}`);
            const u = resp.data.data || resp.data;
            setVendorName(`${u.firstName} ${u.lastName}`);
          } catch {
            setVendorName('');
          }
        }}
        initialVendorId={invoiceData.vendorId}
      />
    </>
  );
};

export default CreateInvoicePage;
