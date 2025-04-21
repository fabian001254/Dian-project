import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { FaPlus, FaTrash, FaEdit, FaSearch, FaChevronDown, FaChevronUp, FaChevronRight, FaFilter } from 'react-icons/fa';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import SectionLoader from '../../components/ui/SectionLoader';

// Interfaces
interface TaxRate {
  id: string;
  name: string;
  rate: number;
  description: string;
}

interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  taxRate?: {
    id: string;
    name: string;
    rate: number;
  };
  customerId?: string;
  customerName?: string;
  createdAt?: string;
}

// Styled components
const Container = styled.div`
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);

  h1 {
    font-size: var(--font-size-xl);
    color: var(--color-text);
    margin: 0;
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  padding: 0 var(--spacing-sm);
  flex: 1;
  max-width: 600px;

  svg {
    color: var(--color-text-secondary);
    margin-right: var(--spacing-sm);
  }

  input {
    border: none;
    padding: var(--spacing-sm);
    width: 100%;
    font-size: var(--font-size-sm);

    &:focus {
      outline: none;
    }
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background-color: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  cursor: pointer;
  transition: all var(--transition-normal);

  &:hover {
    background-color: var(--color-background);
  }

  svg {
    color: var(--color-primary);
  }
`;

const FilterPanel = styled.div`
  background-color: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  position: relative;
  z-index: 10;
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(to right, var(--color-primary-light), var(--color-bg-secondary));
  border-bottom: 1px solid var(--color-border);
  
  h3 {
    margin: 0;
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-bold);
    color: var(--color-primary-dark);
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-light);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--color-text);
  }
`;

const FilterBody = styled.div`
  padding: var(--spacing-md);
  max-height: 400px;
  overflow-y: auto;
`;

const FilterSection = styled.div`
  margin-bottom: var(--spacing-md);
`;

const FilterSectionTitle = styled.h4`
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  font-weight: var(--font-weight-medium);
`;

const FilterOption = styled.div<{ active: boolean }>`
  padding: var(--spacing-md);
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  background-color: ${props => props.active ? 'var(--color-primary-light)' : 'transparent'};
  color: ${props => props.active ? 'var(--color-primary)' : 'var(--color-text)'};
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  margin-bottom: 4px;
  border: 1px solid ${props => props.active ? 'var(--color-primary-light)' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.active ? 'var(--color-primary-light)' : 'var(--color-bg-hover)'};
    border-color: ${props => props.active ? 'var(--color-primary)' : 'var(--color-border)'};
    transform: translateX(2px);
  }
`;

const FilterOptionIcon = styled.span`
  display: flex;
  align-items: center;
  margin-right: var(--spacing-sm);
  font-size: 0.75rem;
`;

const FilterOptionText = styled.div`
  display: flex;
  flex-direction: column;
`;

const FilterOptionDetail = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
  margin-top: 2px;
`;

const EmptyFilterState = styled.div`
  padding: var(--spacing-md);
  text-align: center;
  color: var(--color-text-light);
  font-style: italic;
`;

const FilterActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
`;

const FilterDivider = styled.div`
  height: 1px;
  background-color: var(--color-border);
  margin: var(--spacing-md) 0;
`;

const CustomerBadge = styled.span`
  display: inline-block;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  padding: 6px 10px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  cursor: default;
  text-transform: uppercase;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-primary);
`;

const GeneralProductBadge = styled.span`
  display: inline-block;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-light);
  padding: 6px 10px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  cursor: default;
  border: 1px solid var(--color-primary-light);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const GeneralBadge = styled.span`
  display: inline-block;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-light);
  padding: 6px 10px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  border: 1px solid var(--color-primary-light);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const ProductsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: var(--color-white);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  th, td {
    padding: var(--spacing-md);
    text-align: left;
    border-bottom: 1px solid var(--color-border);
  }
  
  th {
    background-color: var(--color-bg-secondary);
    font-weight: var(--font-weight-medium);
    color: var(--color-text);
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  a {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: var(--font-weight-medium);
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-sm);
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  transition: all var(--transition-normal);
  
  &:hover {
    background-color: var(--color-bg-hover);
  }
  
  &.delete {
    color: var(--color-error);
    
    &:hover {
      background-color: var(--color-error-light);
    }
  }
  
  svg {
    font-size: 1rem;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  background-color: var(--color-white);
  border-radius: var(--border-radius-md);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
  
  p {
    margin-bottom: var(--spacing-md);
    color: var(--color-text-light);
  }
`;

const ErrorMessage = styled.div`
  background-color: var(--color-error-light);
  color: var(--color-error);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-md);
`;

const ProductCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-md);
`;

const ProductCard = styled.div`
  background-color: var(--color-white);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all var(--transition-normal);
  
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const ProductCardHeader = styled.div`
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProductCardTitle = styled.h3`
  margin: 0;
  font-size: var(--font-size-md);
  color: var(--color-text);
`;

const ProductCardPrice = styled.div`
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
`;

const ProductCardBody = styled.div`
  padding: var(--spacing-md);
`;

const ProductCardCode = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
  margin-bottom: var(--spacing-xs);
`;

const ProductCardDescription = styled.div`
  margin-bottom: var(--spacing-sm);
  color: var(--color-text);
  font-size: var(--font-size-sm);
`;

const ProductCardTax = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-text-light);
  margin-bottom: var(--spacing-sm);
`;

const ProductCardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-top: 1px solid var(--color-border);
`;

const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<{id: string, name: string, documentType: string, documentNumber: string}[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [showFullList, setShowFullList] = useState(true);
  const [showCustomerFilter, setShowCustomerFilter] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        if (!user?.company?.id) return;
        
        const response = await axios.get('/api/customers', {
          params: { companyId: user.company.id }
        });
        
        if (response.data.success) {
          setCustomers(response.data.data);
        }
      } catch (err) {
        console.error('Error al cargar los clientes:', err);
      }
    };
    
    fetchCustomers();
  }, [user]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        if (!user?.company?.id) {
          setError('No se encontró información de la empresa');
          setLoading(false);
          return;
        }
        
        // Obtener los productos de la empresa del usuario autenticado
        const response = await axios.get('/api/products', {
          params: {
            companyId: user.company.id,
            customerId: selectedCustomerId === 'general' ? 'none' : (selectedCustomerId || undefined)
          }
        });
        
        if (response.data.success) {
          setProducts(response.data.data);
        } else {
          setError('Error al cargar los productos: ' + response.data.message);
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user, selectedCustomerId]);

  const handleDelete = async (id: string) => {
    // Usar SweetAlert2 para la confirmación
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas eliminar este producto? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-primary)',
      cancelButtonColor: 'var(--color-error)',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    
    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`/api/products/${id}`);
        
        if (response.data.success) {
          setProducts(products.filter(product => product.id !== id));
          
          Swal.fire({
            title: '¡Eliminado!',
            text: 'El producto ha sido eliminado correctamente.',
            icon: 'success',
            confirmButtonColor: 'var(--color-primary)'
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Error al eliminar el producto: ' + response.data.message,
            icon: 'error',
            confirmButtonColor: 'var(--color-primary)'
          });
        }
      } catch (err: any) {
        Swal.fire({
          title: 'Error',
          text: err.response?.data?.message || err.message || 'Error al eliminar el producto',
          icon: 'error',
          confirmButtonColor: 'var(--color-primary)'
        });
      }
    }
  };

  const handleCreateProduct = () => {
    // Si hay un cliente seleccionado, pasar su ID como parámetro de consulta
    if (selectedCustomerId && selectedCustomerId !== 'general') {
      navigate(`/products/create?customerId=${selectedCustomerId}`);
    } else {
      navigate('/products/create');
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Container>
      <Header>
        <h1>Productos</h1>
        <div>
          <Button 
            variant="secondary"
            onClick={() => setShowFullList(!showFullList)}
            style={{ marginRight: 'var(--spacing-sm)' }}
          >
            {showFullList ? 'Vista Resumida' : 'Vista Completa'}
          </Button>
          <Button 
            variant="primary"
            onClick={handleCreateProduct}
          >
            <FaPlus /> Nuevo Producto
          </Button>
        </div>
      </Header>
      
      <SearchBar>
        <SearchInput>
          <FaSearch />
          <input 
            type="text" 
            placeholder="Buscar por nombre, código o descripción..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchInput>
        <FilterButton onClick={() => setShowCustomerFilter(!showCustomerFilter)}>
          <FaFilter /> Filtrar por cliente {showCustomerFilter ? <FaChevronUp /> : <FaChevronDown />}
        </FilterButton>
      </SearchBar>
      
      {showCustomerFilter && (
        <FilterPanel>
          <FilterHeader>
            <h3>Filtrar productos por cliente</h3>
            <CloseButton onClick={() => setShowCustomerFilter(false)}>&times;</CloseButton>
          </FilterHeader>
          
          <FilterBody>
            <FilterSection>
              <FilterSectionTitle>Opciones generales</FilterSectionTitle>
              <FilterOption 
                active={selectedCustomerId === ''}
                onClick={() => setSelectedCustomerId('')}
              >
                <FilterOptionIcon><FaChevronRight /></FilterOptionIcon>
                <FilterOptionText>Todos los productos</FilterOptionText>
              </FilterOption>
              <FilterOption 
                active={selectedCustomerId === 'general'}
                onClick={() => setSelectedCustomerId('general')}
              >
                <FilterOptionIcon><FaChevronRight /></FilterOptionIcon>
                <FilterOptionText>Productos generales (sin cliente específico)</FilterOptionText>
              </FilterOption>
            </FilterSection>
            
            <FilterDivider />
            
            <FilterSection>
              <FilterSectionTitle>Clientes específicos</FilterSectionTitle>
              {customers.length === 0 ? (
                <EmptyFilterState>No hay clientes disponibles</EmptyFilterState>
              ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '4px' }}>
                  {customers.map(customer => (
                    <FilterOption 
                      key={customer.id} 
                      active={selectedCustomerId === customer.id}
                      onClick={() => setSelectedCustomerId(customer.id)}
                    >
                      <FilterOptionIcon><FaChevronRight /></FilterOptionIcon>
                      <FilterOptionText>
                        <strong>{customer.name}</strong>
                        <FilterOptionDetail>{customer.documentType}: {customer.documentNumber}</FilterOptionDetail>
                      </FilterOptionText>
                    </FilterOption>
                  ))}
                </div>
              )}
            </FilterSection>
            
            <FilterActions>
              <Button 
                variant="secondary" 
                size="small" 
                onClick={() => setSelectedCustomerId('')}
              >
                Limpiar filtro
              </Button>
              <Button 
                variant="primary" 
                size="small" 
                onClick={() => setShowCustomerFilter(false)}
              >
                Aplicar
              </Button>
            </FilterActions>
          </FilterBody>
        </FilterPanel>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <SectionLoader message="Cargando productos" size="large" />
        </div>
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : filteredProducts.length === 0 ? (
        <EmptyState>
          {selectedCustomerId && selectedCustomerId !== 'general' ? (
            <>
              <p>No se encontraron productos para el cliente seleccionado.</p>
              <p>Puedes crear un producto específico para este cliente o usar productos generales.</p>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                <Button 
                  variant="primary"
                  onClick={handleCreateProduct}
                >
                  Crear Producto para este Cliente
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => setSelectedCustomerId('')}
                >
                  Ver Todos los Productos
                </Button>
              </div>
            </>
          ) : selectedCustomerId === 'general' ? (
            <>
              <p>No se encontraron productos generales.</p>
              <p>Los productos generales están disponibles para todos los clientes.</p>
              <Button 
                variant="primary"
                onClick={() => navigate('/products/create')}
              >
                Crear Producto General
              </Button>
            </>
          ) : (
            <>
              <p>No se encontraron productos que coincidan con tu búsqueda.</p>
              <Button 
                variant="primary"
                onClick={handleCreateProduct}
              >
                Crear Nuevo Producto
              </Button>
            </>
          )}
        </EmptyState>
      ) : showFullList ? (
        <ProductsTable>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Cliente</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Impuesto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id}>
                <td>{product.code || '-'}</td>
                <td>{product.name}</td>
                <td style={{ 
                  backgroundColor: product.customerName ? 'rgba(var(--color-primary-rgb), 0.05)' : 'rgba(var(--color-primary-rgb), 0.02)',
                  border: product.customerName ? '1px solid rgba(var(--color-primary-rgb), 0.1)' : '1px solid rgba(var(--color-primary-rgb), 0.05)',
                  borderRadius: 'var(--border-radius-sm)'
                }}>
                  {product.customerName ? (
                    <CustomerBadge title={`ID: ${product.customerId}`}>
                      {product.customerName}
                    </CustomerBadge>
                  ) : (
                    <GeneralProductBadge title="Este es un producto general, disponible para todos los clientes">
                      General
                    </GeneralProductBadge>
                  )}
                </td>
                <td>{product.description || '-'}</td>
                <td>{formatCurrency(product.price)}</td>
                <td>{product.taxRate?.name || 'Sin impuesto'}</td>
                <td>
                  <ActionButtons>
                    <ActionButton title="Editar" onClick={() => navigate(`/products/${product.id}/edit`)}>
                      <FaEdit />
                    </ActionButton>
                    <ActionButton title="Eliminar" className="delete" onClick={() => handleDelete(product.id)}>
                      <FaTrash />
                    </ActionButton>
                  </ActionButtons>
                </td>
              </tr>
            ))}
          </tbody>
        </ProductsTable>
      ) : (
        <ProductCardGrid>
          {filteredProducts.map(product => (
            <ProductCard key={product.id}>
              <ProductCardHeader>
                <ProductCardTitle>{product.name}</ProductCardTitle>
                <ProductCardPrice>{formatCurrency(product.price)}</ProductCardPrice>
              </ProductCardHeader>
              <ProductCardBody>
                <ProductCardCode>{product.code || 'Sin código'}</ProductCardCode>
                <ProductCardDescription>{product.description || 'Sin descripción'}</ProductCardDescription>
                <ProductCardTax>Impuesto: {product.taxRate?.name || 'Sin impuesto'}</ProductCardTax>
                {product.customerName ? (
                  <CustomerBadge>{product.customerName}</CustomerBadge>
                ) : (
                  <GeneralBadge>General</GeneralBadge>
                )}
              </ProductCardBody>
              <ProductCardFooter>
                <ActionButton title="Editar" onClick={() => navigate(`/products/${product.id}/edit`)}>
                  <FaEdit /> Editar
                </ActionButton>
                <ActionButton title="Eliminar" className="delete" onClick={() => handleDelete(product.id)}>
                  <FaTrash /> Eliminar
                </ActionButton>
              </ProductCardFooter>
            </ProductCard>
          ))}
        </ProductCardGrid>
      )}
    </Container>
  );
};

export default ProductListPage;
