import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import SectionLoader from '../../components/ui/SectionLoader';
import Swal from 'sweetalert2';

interface VendorForm {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  department?: string;
  identificationType?: string;
  identificationNumber?: string;
}

const Container = styled.div`
  padding: var(--spacing-lg);
  max-width: 600px;
  margin: 0 auto;
`;
const Header = styled.h1`
  font-size: var(--font-size-xl);
  color: var(--color-text);
  margin-bottom: var(--spacing-lg);
`;
const Form = styled.form``;
const FormGroup = styled.div`
  margin-bottom: var(--spacing-md);
`;
const Label = styled.label`
  display: block;
  margin-bottom: var(--spacing-xs);
  color: var(--color-text);
`;

const EditVendorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<VendorForm>({ name: '', email: '', phone: '', address: '', city: '', department: '', identificationType: '', identificationNumber: '' });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string,string>>({});

  useEffect(() => {
    axios.get(`/api/vendors/${id}`)
      .then(res => {
        const data = res.data.data;
        setForm({
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          department: data.department || '',
          identificationType: data.user?.identificationType || '',
          identificationNumber: data.user?.identificationNumber || ''
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs: Record<string,string> = {};
    if (!form.name) errs.name = 'Nombre es obligatorio';
    if (!form.email) errs.email = 'Email es obligatorio';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await axios.put(`/api/vendors/${id}`, form);
      Swal.fire('Éxito', 'Vendedor actualizado', 'success');
      navigate(`/vendors/${id}`);
    } catch (err) {
      Swal.fire('Error', 'No se pudo actualizar vendedor', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <SectionLoader />;

  return (
    <Container>
      <Header>Editar Vendedor</Header>
      <Card>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Nombre</Label>
            <Input name="name" value={form.name} onChange={handleChange} />
            {errors.name && <div style={{color:'var(--color-error)'}}>{errors.name}</div>}
          </FormGroup>
          <FormGroup>
            <Label>Email</Label>
            <Input name="email" value={form.email} onChange={handleChange} />
            {errors.email && <div style={{color:'var(--color-error)'}}>{errors.email}</div>}
          </FormGroup>
          <FormGroup>
            <Label>Teléfono</Label>
            <Input name="phone" value={form.phone} onChange={handleChange} />
          </FormGroup>
          <FormGroup>
            <Label>Dirección</Label>
            <Input name="address" value={form.address} onChange={handleChange} />
          </FormGroup>
          <FormGroup>
            <Label>Ciudad</Label>
            <Input name="city" value={form.city} onChange={handleChange} />
          </FormGroup>
          <FormGroup>
            <Label>Departamento</Label>
            <Input name="department" value={form.department} onChange={handleChange} />
          </FormGroup>
          <FormGroup>
            <Label>Tipo de identificación</Label>
            <Input name="identificationType" value={form.identificationType} onChange={handleChange} />
          </FormGroup>
          <FormGroup>
            <Label>Número de identificación</Label>
            <Input name="identificationNumber" value={form.identificationNumber} onChange={handleChange} />
          </FormGroup>
          <Button variant="primary" type="submit">Guardar</Button>
          <Button variant="outline" onClick={() => navigate(`/vendors/${id}`)} style={{marginLeft:'8px'}}>Cancelar</Button>
        </Form>
      </Card>
    </Container>
  );
};

export default EditVendorPage;
