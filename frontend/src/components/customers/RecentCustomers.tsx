import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaEdit, FaFileInvoice } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Customer {
  id: string;
  name: string;
  identificationType: string;
  identificationNumber: string;
  email: string;
  phone: string;
  city?: string;
  createdAt: string;
}

const CustomerCard = styled(Card)`
  margin-bottom: var(--spacing-md);
`;

const SectionTitle = styled.h2`
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-md);
  color: var(--color-text);
`;

const CustomerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const CustomerItem = styled.div`
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  
  &:last-child {
    border-bottom: none;
  }
`;

const CustomerAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-circle);
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-md);
  
  svg {
    font-size: 18px;
  }
`;

const CustomerInfo = styled.div`
  flex: 1;
`;

const CustomerName = styled.div`
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
`;

const CustomerDetail = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-xs);
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-primary);
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  
  &:hover {
    background-color: var(--color-background);
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: var(--spacing-md);
  color: var(--color-text-secondary);
`;

const ErrorMessage = styled.div`
  color: var(--color-error);
  padding: var(--spacing-md);
  text-align: center;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-md);
  color: var(--color-text-secondary);
`;

const ViewAllButton = styled(Button)`
  width: 100%;
  margin-top: var(--spacing-md);
`;

interface RecentCustomersProps {
  limit?: number;
}

const RecentCustomers: React.FC<RecentCustomersProps> = ({ limit = 5 }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentCustomers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/customers?companyId=${user?.companyId}`);
        
        if (response.data.success) {
          // Ordenar por fecha de creación (más recientes primero) y limitar la cantidad
          const sortedCustomers = response.data.data
            .sort((a: Customer, b: Customer) => {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })
            .slice(0, limit);
          
          setCustomers(sortedCustomers);
        } else {
          throw new Error(response.data.message || 'Error al cargar los clientes');
        }
      } catch (err: any) {
        console.error('Error al cargar los clientes recientes:', err);
        setError(err.response?.data?.message || err.message || 'Error al cargar los clientes');
      } finally {
        setLoading(false);
      }
    };

    if (user?.companyId) {
      fetchRecentCustomers();
    }
  }, [user?.companyId, limit]);

  const handleEditCustomer = (id: string) => {
    navigate(`/customers/${id}/edit`);
  };

  const handleCreateInvoice = (id: string) => {
    navigate(`/invoices/new?customerId=${id}`);
  };

  if (loading) {
    return (
      <CustomerCard>
        <SectionTitle>Clientes Recientes</SectionTitle>
        <LoadingMessage>Cargando clientes...</LoadingMessage>
      </CustomerCard>
    );
  }

  if (error) {
    return (
      <CustomerCard>
        <SectionTitle>Clientes Recientes</SectionTitle>
        <ErrorMessage>{error}</ErrorMessage>
      </CustomerCard>
    );
  }

  return (
    <CustomerCard>
      <SectionTitle>Clientes Recientes</SectionTitle>
      
      {customers.length > 0 ? (
        <CustomerList>
          {customers.map((customer) => (
            <CustomerItem key={customer.id}>
              <CustomerAvatar>
                <FaUser />
              </CustomerAvatar>
              <CustomerInfo>
                <CustomerName>{customer.name}</CustomerName>
                <CustomerDetail>
                  {customer.identificationType} {customer.identificationNumber}
                </CustomerDetail>
              </CustomerInfo>
              <ActionButtons>
                <ActionButton 
                  title="Editar Cliente" 
                  onClick={() => handleEditCustomer(customer.id)}
                >
                  <FaEdit />
                </ActionButton>
                <ActionButton 
                  title="Crear Factura" 
                  onClick={() => handleCreateInvoice(customer.id)}
                >
                  <FaFileInvoice />
                </ActionButton>
              </ActionButtons>
            </CustomerItem>
          ))}
        </CustomerList>
      ) : (
        <EmptyState>No hay clientes para mostrar</EmptyState>
      )}
      
      <ViewAllButton 
        variant="text" 
        size="small"
        onClick={() => navigate('/customers')}
      >
        Ver Todos los Clientes
      </ViewAllButton>
    </CustomerCard>
  );
};

export default RecentCustomers;
