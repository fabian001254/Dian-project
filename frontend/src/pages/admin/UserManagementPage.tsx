import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import SectionLoader from '../../components/ui/SectionLoader';

// Interfaces
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: string;
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
    margin: 0;
    color: var(--color-text);
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  background-color: transparent;
  box-shadow: none;
  margin-bottom: var(--spacing-lg);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: transparent;
  
  /* Dark-mode overrides */
  html[data-theme='dark'] & {
    background-color: transparent;
    th, td {
      border-bottom-color: var(--color-border);
    }
    th {
      background-color: var(--color-bg-secondary);
      color: var(--color-text);
    }
  }
  
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
`;

const Th = styled.th``;

const Td = styled.td``;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-xs);
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-primary);
  font-size: var(--font-size-md);
  padding: var(--spacing-xs);
  &:hover { color: var(--color-primary-dark); }
`;

const SearchBar = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  background-color: transparent;
  border-radius: var(--border-radius-md);
  padding: 0 var(--spacing-sm);
  border: 1px solid var(--color-text);
  
  svg { 
    color: var(--color-text); 
    margin-right: var(--spacing-sm); 
  }
  
  input {
    flex: 1;
    border: none;
    padding: 12px var(--spacing-sm);
    font-size: var(--font-size-sm);
    background-color: transparent;
    color: var(--color-text);
    &::placeholder { 
      color: var(--color-text-light); 
    }
    &:focus { 
      outline: none; 
    }
  }
  
  /* Modo oscuro */
  html[data-theme='dark'] & {
    border: 1px solid var(--color-white);
    
    svg { 
      color: var(--color-white); 
    }
    
    input {
      color: var(--color-white);
      &::placeholder { 
        color: rgba(255,255,255,0.6); 
      }
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  text-align: center;
  
  /* Ajustes específicos para modo oscuro */
  html[data-theme='dark'] & {
    background-color: var(--color-bg-secondary);
    border-color: var(--color-border);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }
  
  p {
    margin-bottom: var(--spacing-md);
    color: var(--color-text);
  }
`;

const ErrorMessage = styled.div`
  background-color: var(--color-error-light);
  color: var(--color-error);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-md);
`;

const RoleBadge = styled.span<{ role: string }>`
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  background-color: ${props => {
    switch (props.role) {
      case 'admin': return 'rgba(220, 53, 69, 0.1)';
      case 'accountant': return 'rgba(255, 193, 7, 0.1)';
      case 'vendor': return 'rgba(40, 167, 69, 0.1)';
      default: return 'rgba(108, 117, 125, 0.1)';
    }
  }};
  color: ${props => {
    switch (props.role) {
      case 'admin': return 'var(--color-error)';
      case 'accountant': return '#ffc107';
      case 'vendor': return 'var(--color-success)';
      default: return 'var(--color-text-secondary)';
    }
  }};
`;

const StatusBadge = styled.span<{ active: boolean }>`
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  background-color: ${props => props.active ? 'rgba(40, 167, 69, 0.1)' : 'rgba(108, 117, 125, 0.1)'};
  color: ${props => props.active ? 'var(--color-success)' : 'var(--color-text-secondary)'};
`;

// Modal para crear usuario
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: var(--color-background);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
  width: 100%;
  max-width: 500px;
  box-shadow: var(--shadow-lg);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  
  h2 {
    margin: 0;
    color: var(--color-text);
  }
  
  button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--color-text-secondary);
    
    &:hover {
      color: var(--color-text);
    }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const Label = styled.label`
  font-size: var(--font-size-sm);
  color: var(--color-text);
`;

const Input = styled.input`
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background);
  color: var(--color-text);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
`;

const Select = styled.select`
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-background);
  color: var(--color-text);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
`;

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'viewer',
    companyId: ''
  });
  
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        if (!user?.company?.id) {
          setError('No se encontró información de la empresa');
          setLoading(false);
          return;
        }
        
        const response = await axios.get('/api/users', {
          params: { companyId: user.company.id }
        });
        
        if (response.data.success) {
          setUsers(response.data.data);
        } else {
          throw new Error(response.data.message || 'Error al cargar los usuarios');
        }
      } catch (err: any) {
        console.error('Error al cargar los usuarios:', err);
        setError(err.response?.data?.message || err.message || 'Error al cargar los usuarios');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!user?.company?.id) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se encontró información de la empresa'
        });
        return;
      }
      
      const userData = {
        ...formData,
        companyId: user.company.id
      };
      
      const response = await axios.post('/api/auth/admin/register', userData);
      
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Usuario creado',
          text: 'El usuario ha sido creado exitosamente'
        });
        
        // Actualizar la lista de usuarios
        setUsers(prev => [...prev, response.data.data.user]);
        
        // Cerrar el modal y limpiar el formulario
        setShowModal(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'viewer',
          companyId: ''
        });
      } else {
        throw new Error(response.data.message || 'Error al crear el usuario');
      }
    } catch (err: any) {
      console.error('Error al crear el usuario:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || err.message || 'Error al crear el usuario'
      });
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'var(--color-error)',
        cancelButtonColor: 'var(--color-text-secondary)',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });
      
      if (result.isConfirmed) {
        const response = await axios.delete(`/api/users/${id}`);
        
        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Usuario eliminado',
            text: 'El usuario ha sido eliminado exitosamente'
          });
          
          // Actualizar la lista de usuarios
          setUsers(prev => prev.filter(user => user.id !== id));
        } else {
          throw new Error(response.data.message || 'Error al eliminar el usuario');
        }
      }
    } catch (err: any) {
      console.error('Error al eliminar el usuario:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || err.message || 'Error al eliminar el usuario'
      });
    }
  };
  
  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'accountant': return 'Contador';
      case 'vendor': return 'Vendedor';
      case 'viewer': return 'Visualizador';
      default: return role;
    }
  };
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <SectionLoader message="Cargando usuarios" size="large" />
      </div>
    );
  }
  
  return (
    <Container>
      <Header>
        <h1>Gestión de Usuarios</h1>
        <Button 
          variant="primary"
          onClick={() => setShowModal(true)}
        >
          <FaPlus /> Nuevo Usuario
        </Button>
      </Header>
      
      <SearchBar>
        <SearchInput>
          <FaSearch />
          <input 
            type="text" 
            placeholder="Buscar por nombre, correo o rol..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchInput>
      </SearchBar>
      
      {error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : filteredUsers.length === 0 ? (
        <EmptyState>
          <p>No se encontraron usuarios con los criterios de búsqueda.</p>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <FaPlus /> Crear nuevo usuario
          </Button>
        </EmptyState>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>Nombre</Th>
                <Th>Correo Electrónico</Th>
                <Th>Rol</Th>
                <Th>Estado</Th>
                <Th>Fecha de Creación</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <Td>{user.firstName} {user.lastName}</Td>
                  <Td>{user.email}</Td>
                  <Td>
                    <RoleBadge role={user.role}>
                      {getRoleLabel(user.role)}
                    </RoleBadge>
                  </Td>
                  <Td>
                    <StatusBadge active={user.isActive}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </StatusBadge>
                  </Td>
                  <Td>{formatDate(user.createdAt)}</Td>
                  <Td>
                    <ActionButtons>
                      <ActionButton title="Editar" onClick={() => console.log('Editar usuario', user.id)}>
                        <FaEdit />
                      </ActionButton>
                      <ActionButton title="Eliminar" onClick={() => handleDelete(user.id)}>
                        <FaTrash />
                      </ActionButton>
                    </ActionButtons>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
      
      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h2>Crear Nuevo Usuario</h2>
              <button onClick={() => setShowModal(false)}>&times;</button>
            </ModalHeader>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="firstName">Nombre</Label>
                <Input 
                  type="text" 
                  id="firstName" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleInputChange} 
                  required 
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="lastName">Apellido</Label>
                <Input 
                  type="text" 
                  id="lastName" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleInputChange} 
                  required 
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  required 
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="password">Contraseña</Label>
                <Input 
                  type="password" 
                  id="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  required 
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="role">Rol</Label>
                <Select 
                  id="role" 
                  name="role" 
                  value={formData.role} 
                  onChange={handleInputChange} 
                  required
                >
                  <option value="viewer">Visualizador</option>
                  <option value="vendor">Vendedor</option>
                  <option value="accountant">Contador</option>
                  <option value="admin">Administrador</option>
                </Select>
              </FormGroup>
              <ModalFooter>
                <Button 
                  variant="secondary" 
                  type="button" 
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
                >
                  Crear Usuario
                </Button>
              </ModalFooter>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default UserManagementPage;
