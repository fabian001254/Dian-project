import React, { useState, useEffect, ChangeEvent } from 'react';
import styled from 'styled-components';
import { FaSearch, FaTimes, FaUser } from 'react-icons/fa';
import Input from '../ui/Input';
import Button from '../ui/Button';
import SectionLoader from '../ui/SectionLoader';
import api from '../services/api.config';
import { useNavigate } from 'react-router-dom';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface CustomerSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customerId: string) => void;
  initialCustomerId?: string;
  vendorId?: string; // ID del vendedor para filtrar clientes
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
    /* Inputs, selects y textareas en modal dark mode */
    input, select, textarea {
      background-color: var(--color-gray-light);
      border-color: var(--color-border);
      color: var(--color-text);
    }
    input::placeholder, textarea::placeholder, select option {
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

const CustomersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: var(--spacing-md);
  max-height: 400px;
  overflow-y: auto;
`;

const CustomerItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  background: #fff;
  /* Dark mode override */
  html[data-theme='dark'] & {
    background: var(--color-background);
    border-color: var(--color-border);
    color: var(--color-text);
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

const CustomerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const CustomerName = styled.div`
  font-weight: 700;
  font-size: 1.08rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CustomerDetails = styled.div`
  font-size: 0.96rem;
  color: var(--color-text-secondary);
  margin-top: 2px;
`;

const NoResults = styled.div`
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--color-text-secondary);
`;

const CustomerSelectorModal: React.FC<CustomerSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectCustomer,
  initialCustomerId,
  vendorId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Cargar clientes al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen]);

  // Filtrar clientes cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = customers.filter(
        customer => 
          customer.id.toLowerCase().includes(term) || 
          customer.name.toLowerCase().includes(term) ||
          (customer.email && customer.email.toLowerCase().includes(term)) ||
          (customer.phone && customer.phone.toLowerCase().includes(term))
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      // Si hay un vendorId, usamos un endpoint específico para obtener solo los clientes de ese vendedor
      const url = vendorId 
        ? `/api/customers?vendorId=${vendorId}` 
        : '/api/customers';
      
      console.log(`Cargando clientes desde: ${url}`);
      
      const response = await api.get(url);
      let loadedCustomers = [];
      
      if (response.data && Array.isArray(response.data)) {
        loadedCustomers = response.data;
        console.log('Clientes cargados correctamente:', response.data.length);
      } else if (response.data && response.data.success) {
        loadedCustomers = response.data.data;
        console.log('Clientes cargados correctamente:', response.data.data.length);
      } else {
        console.error('Formato de respuesta inesperado:', response.data);
      }
      
      // Si hay un vendorId, filtramos los clientes por ese vendedor (doble verificación)
      if (vendorId && loadedCustomers.length > 0) {
        console.log(`Filtrando clientes para el vendedor: ${vendorId}`);
        const filteredByVendor = loadedCustomers.filter((customer: Customer & { vendorId?: string; vendorIds?: string[] }) => 
          customer.vendorId === vendorId || customer.vendorIds?.includes(vendorId)
        );
        setCustomers(filteredByVendor);
        setFilteredCustomers(filteredByVendor);
        console.log(`Clientes filtrados por vendedor: ${filteredByVendor.length}`);
      } else {
        setCustomers(loadedCustomers);
        setFilteredCustomers(loadedCustomers);
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCustomer = (customerId: string) => {
    onSelectCustomer(customerId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            {vendorId ? 'Seleccionar Cliente Asociado' : 'Seleccionar Cliente'}
            {vendorId && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Solo se muestran clientes asociados a tu cuenta
              </div>
            )}
          </ModalTitle>
          <Button variant="outline" size="small" onClick={() => { onClose(); navigate('/customers/create'); }}>
            Nuevo Cliente
          </Button>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          <SearchContainer>
            <Input
              placeholder="Buscar por ID, nombre, email o teléfono"
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              fullWidth
              style={{ flex: 1 }}
            />
            <Button variant="secondary">
              <FaSearch />
            </Button>
          </SearchContainer>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
              <SectionLoader />
              <div style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>Cargando clientes...</div>
            </div>
          ) : filteredCustomers.length > 0 ? (
            <CustomersList>
              {filteredCustomers.map(customer => (
                <CustomerItem 
                  key={customer.id} 
                  onClick={() => handleSelectCustomer(customer.id)}
                  style={customer.id === initialCustomerId ? { borderColor: 'var(--color-primary)', backgroundColor: '#f0f7ff' } : {}}
                >
                  <CustomerInfo>
                    <CustomerName>
                      <FaUser style={{ color: 'var(--color-primary)', fontSize: '1em' }} />
                      {customer.name}
                    </CustomerName>
                    <CustomerDetails>
                      ID: {customer.id}
                      {customer.email && <span> • {customer.email}</span>}
                      {customer.phone && <span> • {customer.phone}</span>}
                    </CustomerDetails>
                  </CustomerInfo>
                  <Button 
                    size="small" 
                    variant="primary" 
                    onClick={(e) => {
                      e.stopPropagation(); // Evitar doble clic
                      handleSelectCustomer(customer.id);
                    }}
                  >
                    Seleccionar
                  </Button>
                </CustomerItem>
              ))}
            </CustomersList>
          ) : (
            <NoResults>
              {vendorId 
                ? 'No se encontraron clientes asociados a tu cuenta. Puedes crear un nuevo cliente desde el botón superior.'
                : 'No se encontraron clientes que coincidan con la búsqueda'}
            </NoResults>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CustomerSelectorModal;
