import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../../services/api.config';
import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { FaUser, FaEdit, FaFileInvoice } from 'react-icons/fa';

interface Customer {
  id: string;
  name: string;
  createdAt: string;
}

interface RecentCustomersProps {
  limit?: number;
}

const RecentCustomersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const CustomerItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-xs);
`;

const RecentCustomers: React.FC<RecentCustomersProps> = ({ limit = 5 }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentCustomers = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/customers?companyId=${user?.companyId}`);
        if (response.data.success) {
          const sorted = response.data.data
            .sort((a: Customer, b: Customer) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, limit);
          setCustomers(sorted);
        } else {
          throw new Error(response.data.message || 'Error fetching customers');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentCustomers();
  }, [user, limit]);

  if (loading) return <div>Cargando clientes recientes...</div>;
  if (error) return <div>Error: {error}</div>;
  if (customers.length === 0) return <div>No hay clientes recientes.</div>;

  return (
    <Card>
      <h3>Clientes Recientes</h3>
      <RecentCustomersContainer>
        {customers.map((customer) => (
          <CustomerItem key={customer.id}>
            <span>
              <FaUser /> {customer.name}
            </span>
            <ActionButtons>
              <Button size="small" variant="outline" onClick={() => navigate(`/customers/${customer.id}`)}>
                <FaEdit />
              </Button>
              <Button size="small" variant="outline" onClick={() => navigate(`/invoices/create?customerId=${customer.id}`)}>
                <FaFileInvoice />
              </Button>
            </ActionButtons>
          </CustomerItem>
        ))}
      </RecentCustomersContainer>
      <Button variant="text" onClick={() => navigate('/customers')}>
        Ver todos los clientes
      </Button>
    </Card>
  );
};

export default RecentCustomers;
