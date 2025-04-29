import React, { useState, useEffect, ChangeEvent } from 'react';
import styled from 'styled-components';
import { FaSearch, FaTimes, FaUserTie } from 'react-icons/fa';
import Input from '../ui/Input';
import Button from '../ui/Button';
import SectionLoader from '../ui/SectionLoader';
import api from '../../services/api.config';
import { useNavigate } from 'react-router-dom';

interface Vendor {
  id: string;
  name: string;
  user?: {
    identificationType: string;
    identificationNumber: string;
  };
}

interface VendorSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVendor: (vendorId: string) => void;
  initialVendorId?: string;
}

const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
`;
const ModalContent = styled.div`
  background: white; border-radius: var(--border-radius-md);
  /* Dark mode override */
  html[data-theme='dark'] & {
    background-color: var(--color-background);
    color: var(--color-text);
    /* Inputs y selects en modal */
    input, select, textarea {
      background-color: var(--color-gray-light);
      border-color: var(--color-border);
      color: var(--color-text);
    }
    input::placeholder, textarea::placeholder, select option {
      color: var(--color-text-light);
    }
  }
  box-shadow: var(--shadow-md); width: 90%; max-width: 600px;
  max-height: 90vh; display: flex; flex-direction: column;
  overflow: hidden;
`;
const ModalHeader = styled.div`
  display: flex; justify-content: space-between;
  align-items: center; padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
`;
const ModalTitle = styled.h2`
  margin: 0; font-size: var(--font-size-lg);
`;
const CloseButton = styled.button`
  background: none; border: none; font-size: 1.5rem;
  cursor: pointer; color: var(--color-text-secondary);
  &:hover { color: var(--color-text); }
`;
const ModalBody = styled.div`
  padding: var(--spacing-md); overflow-y: auto; flex: 1;
`;
const SearchContainer = styled.div`
  margin-bottom: var(--spacing-md);
  display: flex;
  gap: var(--spacing-sm);
`;
const VendorsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: var(--spacing-md);
  max-height: 400px;
  overflow-y: auto;
`;
const VendorItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  background: #fff;
  /* Dark mode override */
  html[data-theme='dark'] & {
    background-color: var(--color-background);
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
const VendorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;
const VendorName = styled.div`
  font-weight: 700;
  font-size: 1.08rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;
const VendorDetails = styled.div`
  font-size: 0.96rem;
  color: var(--color-text-secondary);
  margin-top: 2px;
`;
const NoResults = styled.div`
  text-align: center; padding: var(--spacing-lg);
  color: var(--color-text-secondary);
`;

const VendorSelectorModal: React.FC<VendorSelectorModalProps> = ({
  isOpen, onClose, onSelectVendor, initialVendorId
}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filtered, setFiltered] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if(isOpen) loadVendors(); }, [isOpen]);
  useEffect(() => {
    setFiltered(search.trim()?
      vendors.filter(v => 
        v.name.toLowerCase().includes(search.toLowerCase())
      ) : vendors
    );
  }, [search, vendors]);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/vendors');
      const list = (resp.data.data || []) as Vendor[];
      setVendors(list);
      setFiltered(list);
    } catch(e) { console.error(e); setVendors([]); setFiltered([]); }
    finally { setLoading(false); }
  };
  const select = (id: string) => { onSelectVendor(id); onClose(); };
  if(!isOpen) return null;
  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Seleccionar Vendedor</ModalTitle>
          <Button variant="outline" size="small" onClick={() => { onClose(); navigate('/vendors/create'); }}>
            Nuevo Vendedor
          </Button>
          <CloseButton onClick={onClose}><FaTimes/></CloseButton>
        </ModalHeader>
        <ModalBody>
          <SearchContainer>
            <Input placeholder="Buscar vendedor" value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>)=>setSearch(e.target.value)} fullWidth />
            <Button variant="secondary"><FaSearch/></Button>
          </SearchContainer>
          {loading? <SectionLoader/> :
            filtered.length? (
              <VendorsList>
                {filtered.map(v=> (
                  <VendorItem key={v.id} onClick={()=>select(v.id)} style={v.id===initialVendorId?{borderColor:'var(--color-primary)', backgroundColor:'#f0f7ff'}:{}}>
                    <VendorInfo>
                      <VendorName><FaUserTie style={{color:'var(--color-primary)', fontSize:'1em'}}/> {v.name}</VendorName>
                      <VendorDetails>
                        ID: {v.id}
                        {v.user ? ` • ${v.user.identificationType} ${v.user.identificationNumber}` : ''}
                      </VendorDetails>
                    </VendorInfo>
                    <Button size="small" variant="primary" onClick={e=>{e.stopPropagation();select(v.id);}}>Seleccionar</Button>
                  </VendorItem>
                ))}
              </VendorsList>
            ):<NoResults>No hay vendedores</NoResults>
          }
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};
export default VendorSelectorModal;
