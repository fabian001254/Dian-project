import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaSearch, FaTimes, FaPlus, FaCheck } from 'react-icons/fa';
import Input from '../ui/Input';
import Button from '../ui/Button';
import SectionLoader from '../ui/SectionLoader';
import api from '../services/api.config';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  taxRate: number | {
    id?: string;
    name?: string;
    rate?: number;
    type?: string;
    code?: string;
    description?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    companyId?: string;
  };
  customerName?: string; // Nombre del cliente al que pertenece el producto
  customerId?: string;   // ID del cliente al que pertenece el producto
}

interface ProductSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (productId: string) => void;
  products?: Product[];
  isLoading?: boolean;
  customerId?: string; // ID del cliente seleccionado en la factura
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--color-text);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-secondary);
  
  &:hover {
    color: var(--color-text);
  }
`;

const ModalBody = styled.div`
  padding: var(--spacing-md);
  overflow-y: auto;
  flex: 1;
`;

const SearchContainer = styled.div`
  margin-bottom: var(--spacing-md);
  display: flex;
  gap: var(--spacing-sm);
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
`;

const ProductsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: var(--spacing-md);
`;

const TableHeader = styled.th`
  text-align: left;
  padding: var(--spacing-sm);
  background-color: var(--color-gray-light);
  border-bottom: 1px solid var(--color-border);
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: var(--color-gray-lightest);
  }
  
  &:hover {
    background-color: var(--color-primary-lightest);
  }
`;

const TableCell = styled.td`
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
`;

const NoResults = styled.div`
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--color-text-secondary);
`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

const getTaxRateDisplay = (taxRate: number | any): string => {
  if (typeof taxRate === 'number') {
    return `${taxRate}%`;
  } else if (taxRate && typeof taxRate === 'object') {
    if (taxRate.rate !== undefined) {
      return `${taxRate.rate}%${taxRate.name ? ` (${taxRate.name})` : ''}`;
    } else {
      return 'Sin IVA';
    }
  } else {
    return 'Sin IVA';
  }
};

const ActionButton = styled(Button)`
  min-width: 100px;
`;

const ProductSelectorModal: React.FC<ProductSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  products,
  isLoading: initialLoading = false,
  customerId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Cargar productos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadProductsFromAPI();
    }
  }, [isOpen, customerId]);

  // Cargar productos desde la API
  const loadProductsFromAPI = async () => {
    try {
      setIsLoading(true);
      console.log('Cargando productos desde la API...');
      
      // Si hay un cliente seleccionado, filtramos los productos por ese cliente
      const url = customerId 
        ? `http://localhost:3001/api/products?customerId=${customerId}` 
        : 'http://localhost:3001/api/products';
      
      console.log(`Consultando productos ${customerId ? 'para el cliente ' + customerId : 'generales'}`);
      const productsResponse = await api.get(url);
      
      if (productsResponse.data && productsResponse.data.success) {
        console.log('Productos cargados:', productsResponse.data.data.length);
        setFilteredProducts(productsResponse.data.data);
        setDisplayedProducts(productsResponse.data.data.slice(0, 5));
      } else {
        console.error('Error en la respuesta de la API:', productsResponse.data);
        setFilteredProducts([]);
        setDisplayedProducts([]);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
      setFilteredProducts([]);
      setDisplayedProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para buscar productos
  const searchProducts = (term: string, minPriceStr: string, maxPriceStr: string) => {
    // Limpiar el timeout anterior si existe
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    setIsLoading(true);
    
    const timeout = setTimeout(async () => {
      try {
        // Convertir los precios a números
        const minPriceVal = minPriceStr ? parseFloat(minPriceStr) : null;
        const maxPriceVal = maxPriceStr ? parseFloat(maxPriceStr) : null;
        
        // Construir la URL base con el cliente si está disponible
        let baseUrl = 'http://localhost:3001/api/products';
        const queryParams = [];
        
        if (customerId) {
          queryParams.push(`customerId=${customerId}`);
        }
        
        // Si hay un término de búsqueda, buscar en la API
        if (term && term.length >= 2) {
          queryParams.push(`term=${encodeURIComponent(term)}`);
          
          const searchUrl = `${baseUrl}/search?${queryParams.join('&')}`;
          console.log(`Buscando productos con: ${searchUrl}`);
          
          const searchResponse = await api.get(searchUrl);
          
          if (searchResponse.data && searchResponse.data.success) {
            let results = searchResponse.data.data;
            
            // Filtrar por precio si es necesario
            if (minPriceVal !== null) {
              results = results.filter((product: Product) => product.price >= minPriceVal);
            }
            
            if (maxPriceVal !== null) {
              results = results.filter((product: Product) => product.price <= maxPriceVal);
            }
            
            setFilteredProducts(results);
            setDisplayedProducts(results.slice(0, 5));
          } else {
            setFilteredProducts([]);
            setDisplayedProducts([]);
          }
        } else {
          // Si no hay término de búsqueda o es muy corto, cargar todos los productos y filtrar localmente
          const productsUrl = queryParams.length > 0 ? `${baseUrl}?${queryParams.join('&')}` : baseUrl;
          console.log(`Cargando productos con: ${productsUrl}`);
          
          const productsResponse = await api.get(productsUrl);
          
          if (productsResponse.data && productsResponse.data.success) {
            let results = productsResponse.data.data;
            
            // Filtrar por precio si es necesario
            if (minPriceVal !== null) {
              results = results.filter((product: Product) => product.price >= minPriceVal);
            }
            
            if (maxPriceVal !== null) {
              results = results.filter((product: Product) => product.price <= maxPriceVal);
            }
            
            setFilteredProducts(results);
            setDisplayedProducts(results.slice(0, 5));
          }
        }
      } catch (error) {
        console.error('Error buscando productos:', error);
        setFilteredProducts([]);
        setDisplayedProducts([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);
    
    setSearchTimeout(timeout);
  };

  if (!isOpen) return null;
  
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {customerId ? 'Seleccionar Producto del Cliente' : 'Seleccionar Producto'}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          <SearchContainer>
            <Input
              placeholder="Buscar por nombre o descripción"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                searchProducts(e.target.value, minPrice, maxPrice);
              }}
              leftIcon={<FaSearch />}
              fullWidth
            />
          </SearchContainer>
          
          <FiltersContainer>
            <Input
              label="Precio mínimo"
              type="number"
              value={minPrice}
              onChange={e => {
                setMinPrice(e.target.value);
                searchProducts(searchTerm, e.target.value, maxPrice);
              }}
              placeholder="0"
            />
            <Input
              label="Precio máximo"
              type="number"
              value={maxPrice}
              onChange={e => {
                setMaxPrice(e.target.value);
                searchProducts(searchTerm, minPrice, e.target.value);
              }}
              placeholder="1000000"
            />
          </FiltersContainer>
          
          {isLoading ? (
            <div style={{ padding: 'var(--spacing-lg)' }}>
              <SectionLoader message="Cargando productos" size="medium" />
            </div>
          ) : displayedProducts.length > 0 ? (
            <>
              <ProductsTable>
                <thead>
                  <tr>
                    <TableHeader>Nombre</TableHeader>
                    <TableHeader>Descripción</TableHeader>
                    <TableHeader>Precio</TableHeader>
                    <TableHeader>IVA %</TableHeader>
                    <TableHeader>Cliente</TableHeader>
                    <TableHeader>Acción</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {displayedProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.description}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>{getTaxRateDisplay(product.taxRate)}</TableCell>
                    <TableCell>{product.customerName || 'General'}</TableCell>
                    <TableCell>
                      <ActionButton
                        variant="primary"
                        size="small"
                        onClick={() => onSelectProduct(product.id)}
                      >
                        <FaCheck style={{ marginRight: '5px' }} /> Seleccionar
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                  ))}
                </tbody>
              </ProductsTable>
              
              {filteredProducts.length > displayedProducts.length && (
                <div style={{ textAlign: 'center', margin: 'var(--spacing-md) 0' }}>
                  <Button 
                    variant="outline" 
                    onClick={() => setDisplayedProducts(filteredProducts.slice(0, displayedProducts.length + 5))}
                  >
                    Cargar más productos ({displayedProducts.length} de {filteredProducts.length})
                  </Button>
                </div>
              )}
            </>
          ) : (
            <NoResults>No se encontraron productos con los filtros seleccionados</NoResults>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ProductSelectorModal;
