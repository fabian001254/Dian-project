import React, { useState, useEffect, ChangeEvent, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { FaSearch, FaTimes, FaPlus, FaCheck, FaUser, FaFilter } from 'react-icons/fa';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';
import SectionLoader from '../ui/SectionLoader';
import { getAllProducts, getCustomers, Product } from '../../services/productService';

interface Customer {
  id: string;
  name: string;
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
  /* Dark mode override */
  html[data-theme='dark'] & {
    background-color: var(--color-background);
    color: var(--color-text);
    /* Inputs y selects más claros */
    input, select {
      background-color: var(--color-gray-light);
      border-color: var(--color-border);
      color: var(--color-text);
    }
    input::placeholder, select option {
      color: var(--color-text-light);
    }
  }
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

const ProductItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border: 1.5px solid var(--color-border);
  border-radius: 16px;
  cursor: pointer;
  background: #fff;
  /* Dark mode override */
  html[data-theme='dark'] & {
    background: var(--color-background);
    border-color: var(--color-gray-dark);
  }
  box-shadow: 0 2px 8px rgba(80, 120, 255, 0.07);
  transition: box-shadow 0.2s, border 0.2s, background 0.2s;
  margin-bottom: 2px;
  &:hover {
    background-color: #f7faff;
    border-color: var(--color-primary);
    box-shadow: 0 6px 18px rgba(80, 120, 255, 0.13);
    z-index: 2;
  }
`;

const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: var(--spacing-md);
  max-height: 400px;
  overflow-y: auto;
`;

const NoResults = styled.div`
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--color-text-secondary);
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const ProductName = styled.div`
  font-weight: 700;
  font-size: 1.08rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProductDescription = styled.div`
  font-size: 0.96rem;
  color: var(--color-text-secondary);
  margin-top: 2px;
  margin-bottom: 3px;
  white-space: pre-line;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductPrice = styled.div`
  font-weight: 700;
  font-size: 1.14rem;
  color: var(--color-primary);
  margin-bottom: 2px;
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

const Badge = styled.span<{
  color?: string,
  background?: string
}>`
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.86em;
  font-weight: 600;
  margin-left: 8px;
  color: ${props => props.color || 'var(--color-primary)'};
  background: ${props => props.background || 'var(--color-primary-light)'};
  border: 1px solid ${props => props.color || 'var(--color-primary)'};
`;

const ActionButton = styled(Button)`
  min-width: 120px;
  font-size: 1em;
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 8px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(80, 120, 255, 0.07);
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
  const [customers, setCustomers] = useState<Customer[]>([]);
  // Default to 'todos' for all clients if no customerId prop
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customerId ?? 'todos');
  const [hasFilteredByCustomer, setHasFilteredByCustomer] = useState(false);
  const [fullProducts, setFullProducts] = useState<Product[]>([]);
  const PAGE_SIZE = 5; // Cantidad de productos por página

  const handleSelectCustomer = (e: ChangeEvent<HTMLSelectElement>) => {
    const newCustomerId = e.target.value;
    setSelectedCustomerId(newCustomerId);
    setHasFilteredByCustomer(true);
    applyFilters(searchTerm, minPrice, maxPrice, newCustomerId);
  };

  const applyFilters = async (term: string, min: string, max: string, custId: string) => {
    setIsLoading(true);
    try {
      let prods = [...fullProducts];
      // Filtrar por cliente
      if (custId && custId !== 'todos') {
        if (custId === 'general') {
          prods = prods.filter(p => !p.customerId);
        } else {
          prods = prods.filter(p => p.customerId === custId);
        }
      }
      // Filtrar por término de búsqueda
      if (term) {
        const lower = term.toLowerCase();
        prods = prods.filter(p => p.name.toLowerCase().includes(lower) || (p.description || '').toLowerCase().includes(lower));
      }
      // Filtrar por rango de precio
      const minVal = parseFloat(min);
      const maxVal = parseFloat(max);
      if (!isNaN(minVal)) prods = prods.filter(p => p.price >= minVal);
      if (!isNaN(maxVal)) prods = prods.filter(p => p.price <= maxVal);
      setFilteredProducts(prods);
      setDisplayedProducts(prods.slice(0, PAGE_SIZE));
    } catch (e) {
      console.error('Error aplicando filtros:', e);
      setFilteredProducts([]);
      setDisplayedProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [clients, prods] = await Promise.all([
          getCustomers(),
          getAllProducts()
        ]);
        setCustomers(clients);
        setFullProducts(prods);
        // Al abrir el modal por primera vez, mostrar todos los productos (sin filtrar por cliente)
        setFilteredProducts(prods);
        setDisplayedProducts(prods.slice(0, PAGE_SIZE));
        setHasFilteredByCustomer(false);
      } catch (e) {
        console.error('Error cargando datos iniciales:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isOpen]);

  const handleSelectProduct = (productId: string) => {
    console.log('Producto seleccionado en el modal:', productId);
    onClose();
    setTimeout(() => {
      if (typeof onSelectProduct === 'function') {
        onSelectProduct(productId);
      } else {
        console.error('onSelectProduct no es una función válida');
      }
    }, 100);
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
                applyFilters(e.target.value, minPrice, maxPrice, selectedCustomerId);
              }}
              leftIcon={<FaSearch />}
              fullWidth
            />
          </SearchContainer>
          <FiltersContainer>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <FaUser style={{ color: 'var(--color-primary)' }} />
              <Select
                label="Vendedor"
                value={selectedCustomerId}
                onChange={handleSelectCustomer}
              >
                <option value="todos">Todos los vendedores</option>
                <option value="general">Solo productos generales</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </Select>
            </div>
            <Input
              label="Precio mínimo"
              type="number"
              value={minPrice}
              onChange={e => {
                setMinPrice(e.target.value);
                applyFilters(searchTerm, e.target.value, maxPrice, selectedCustomerId);
              }}
              placeholder="0"
            />
            <Input
              label="Precio máximo"
              type="number"
              value={maxPrice}
              onChange={e => {
                setMaxPrice(e.target.value);
                applyFilters(searchTerm, minPrice, e.target.value, selectedCustomerId);
              }}
              placeholder="1000000"
            />
          </FiltersContainer>
          {isLoading ? (
            <div style={{ padding: 'var(--spacing-lg)' }}>
              <SectionLoader message="Cargando productos" size="medium" />
            </div>
          ) : (hasFilteredByCustomer ? (
            displayedProducts.length > 0 ? (
              <>
                <ProductsList>
                  {displayedProducts.map(product => (
                    <ProductItem key={product.id} onClick={() => handleSelectProduct(product.id)}>
                      <ProductInfo>
                        <ProductName>
                          <FaPlus style={{ color: 'var(--color-primary)', fontSize: '1.1em' }} />
                          {product.name}
                          {product.customerId
                            ? <Badge color="#1976d2" background="#e3f0fd">Vendedor: {product.customerName}</Badge>
                            : <Badge color="#0086b3" background="#e0f7fa">General</Badge>
                          }
                        </ProductName>
                        <ProductDescription>
                          {product.description}
                          {product.customerName && (
                            <span style={{
                              display: 'inline-block',
                              marginLeft: '8px',
                              padding: '2px 6px',
                              backgroundColor: 'var(--color-primary-light)',
                              color: 'var(--color-primary)',
                              borderRadius: '4px',
                              fontSize: '0.85em',
                              fontWeight: 'bold'
                            }}>
                              Vendedor: {product.customerName}
                            </span>
                          )}
                        </ProductDescription>
                        <div style={{ fontSize: '0.85em', color: 'var(--color-text-secondary)' }}>
                          {product.taxRate ? (typeof product.taxRate === 'number' ? `${product.taxRate}%` : (product.taxRate as any).name || `${(product.taxRate as any).rate || 0}%`) : 'Sin impuesto'}
                        </div>
                      </ProductInfo>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <ProductPrice>{formatCurrency(product.price)}</ProductPrice>
                        <Button 
                          size="small" 
                          variant="primary" 
                          onClick={(e) => {
                            e.stopPropagation(); // Evitar doble clic
                            handleSelectProduct(product.id);
                          }}
                        >
                          Agregar a factura
                        </Button>
                      </div>
                    </ProductItem>
                  ))}
                </ProductsList>
                {filteredProducts.length > displayedProducts.length && (
                  <div style={{ textAlign: 'center', margin: 'var(--spacing-md) 0' }}>
                    <Button 
                      variant="outline" 
                      onClick={() => setDisplayedProducts(filteredProducts.slice(0, displayedProducts.length + PAGE_SIZE))}
                    >
                      Cargar más productos ({displayedProducts.length} de {filteredProducts.length})
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <NoResults>No se encontraron productos con los filtros seleccionados</NoResults>
            )
          ) : (
            // Si no ha filtrado por cliente, mostrar todos los productos
            fullProducts.length > 0 ? (
              <>
                <ProductsList>
                  {fullProducts.slice(0, displayedProducts.length).map(product => (
                    <ProductItem key={product.id} onClick={() => handleSelectProduct(product.id)}>
                      <ProductInfo>
                        <ProductName>
                          <FaPlus style={{ color: 'var(--color-primary)', fontSize: '1.1em' }} />
                          {product.name}
                          {product.customerId
                            ? <Badge color="#1976d2" background="#e3f0fd">Vendedor: {product.customerName}</Badge>
                            : <Badge color="#0086b3" background="#e0f7fa">General</Badge>
                          }
                        </ProductName>
                        <ProductDescription>
                          {product.description}
                          {product.customerName && (
                            <span style={{
                              display: 'inline-block',
                              marginLeft: '8px',
                              padding: '2px 6px',
                              backgroundColor: 'var(--color-primary-light)',
                              color: 'var(--color-primary)',
                              borderRadius: '4px',
                              fontSize: '0.85em',
                              fontWeight: 'bold'
                            }}>
                              Vendedor: {product.customerName}
                            </span>
                          )}
                        </ProductDescription>
                        <div style={{ fontSize: '0.85em', color: 'var(--color-text-secondary)' }}>
                          {product.taxRate ? (typeof product.taxRate === 'number' ? `${product.taxRate}%` : (product.taxRate as any).name || `${(product.taxRate as any).rate || 0}%`) : 'Sin impuesto'}
                        </div>
                      </ProductInfo>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <ProductPrice>{formatCurrency(product.price)}</ProductPrice>
                        <Button 
                          size="small" 
                          variant="primary" 
                          onClick={(e) => {
                            e.stopPropagation(); // Evitar doble clic
                            handleSelectProduct(product.id);
                          }}
                        >
                          Agregar a factura
                        </Button>
                      </div>
                    </ProductItem>
                  ))}
                </ProductsList>
                {fullProducts.length > displayedProducts.length && (
                  <div style={{ textAlign: 'center', margin: 'var(--spacing-md) 0' }}>
                    <Button 
                      variant="outline" 
                      onClick={() => setDisplayedProducts(fullProducts.slice(0, displayedProducts.length + PAGE_SIZE))}
                    >
                      Cargar más productos ({displayedProducts.length} de {fullProducts.length})
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <NoResults>No se encontraron productos disponibles</NoResults>
            )
          ))}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ProductSelectorModal;
