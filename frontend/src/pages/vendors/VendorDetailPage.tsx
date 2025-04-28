import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../../services/api.config';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SectionLoader from '../../components/ui/SectionLoader';

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  department?: string;
  user?: {
    identificationType: string;
    identificationNumber: string;
  };
}

const Container = styled.div`
  padding: var(--spacing-lg);
  max-width: 600px;
  margin: 0 auto;
`;
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
`;
const Title = styled.h1`
  font-size: var(--font-size-xl);
  color: var(--color-text);
  margin: 0;
`;
const Field = styled.div`
  margin-bottom: var(--spacing-md);
`;
const Label = styled.div`
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
`;
const Value = styled.div`
  color: var(--color-text);
`;

const VendorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/vendors/${id}`)
      .then(res => setVendor(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <SectionLoader />;
  if (!vendor) return <div>Vendedor no encontrado</div>;

  return (
    <Container>
      <Header>
        <Title>Vendedor: {vendor.name}</Title>
        <Button variant="outline" onClick={() => navigate(`/vendors/${id}/edit`)}>Editar</Button>
      </Header>
      <Card>
        <Field>
          <Label>Tipo Documento</Label>
          <Value>{vendor.user?.identificationType || '-'}</Value>
        </Field>
        <Field>
          <Label>Número Documento</Label>
          <Value>{vendor.user?.identificationNumber || '-'}</Value>
        </Field>
        <Field>
          <Label>Dirección</Label>
          <Value>{vendor.address || '-'}</Value>
        </Field>
        <Field>
          <Label>Ciudad</Label>
          <Value>{vendor.city || '-'}</Value>
        </Field>
        <Field>
          <Label>Departamento</Label>
          <Value>{vendor.department || '-'}</Value>
        </Field>
        <Field>
          <Label>Email</Label>
          <Value>{vendor.email}</Value>
        </Field>
        <Field>
          <Label>Teléfono</Label>
          <Value>{vendor.phone || '-'}</Value>
        </Field>
        <Button variant="outline" onClick={() => navigate('/vendors')} style={{marginTop: 'var(--spacing-lg)'}}>Volver</Button>
      </Card>
    </Container>
  );
};

export default VendorDetailPage;
