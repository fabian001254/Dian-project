import React, { useState, ChangeEvent, FormEvent } from 'react';
import styled from 'styled-components';
import { FaTimes, FaUserPlus } from 'react-icons/fa';
import Input from '../ui/Input';
import Button from '../ui/Button';
import api from '../services/api.config';

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (customer: { id: string; name: string }) => void;
}

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: #fff;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  width: 400px;
  max-width: 90%;
  padding: var(--spacing-lg);
  position: relative;
`;

const Close = styled.button`
  position: absolute;
  top: 12px; right: 12px;
  background: none; border: none;
  font-size: 1.2rem; cursor: pointer;
`;

const Title = styled.h2`
  margin: 0 0 var(--spacing-md);
  font-size: var(--font-size-lg);
`;

const Field = styled.div`
  margin-bottom: var(--spacing-md);
`;

const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await api.post('/api/customers', { name, email, phone, address });
      const customer = resp.data.data || resp.data;
      onCreate({ id: customer.id, name: customer.name });
      // reset fields
      setName(''); setEmail(''); setPhone(''); setAddress('');
      onClose();
    } catch (err) {
      console.error('Error creando cliente:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay>
      <Modal>
        <Close onClick={onClose}><FaTimes /></Close>
        <Title><FaUserPlus /> Nuevo Cliente</Title>
        <form onSubmit={handleSubmit}>
          <Field>
            <Input placeholder="Nombre" value={name} onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)} fullWidth />
          </Field>
          <Field>
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
          </Field>
          <Field>
            <Input placeholder="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
          </Field>
          <Field>
            <Input placeholder="Dirección" value={address} onChange={(e) => setAddress(e.target.value)} fullWidth />
          </Field>
          <Button type="submit" disabled={loading} fullWidth>
            {loading ? 'Creando...' : 'Crear Cliente'}
          </Button>
        </form>
      </Modal>
    </Overlay>
  );
};

export default CreateCustomerModal;
