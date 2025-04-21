import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaBuilding, FaKey, FaHistory } from 'react-icons/fa';

// Interfaces
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  lastLogin: string;
  createdAt: string;
  company: {
    id: string;
    name: string;
    nit: string;
    address: string;
    phone: string;
    city: string;
    legalRepresentative: string;
    legalRepresentativeId: string;
  };
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Aquí iría la llamada al API para obtener el perfil
        // Por ahora usamos datos de ejemplo
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Datos de ejemplo
        const mockProfile: UserProfile = {
          id: '1',
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@empresa.com',
          role: 'admin',
          lastLogin: '2025-04-19T10:30:00',
          createdAt: '2025-01-15',
          company: {
            id: '1',
            name: 'Empresa Ejemplo S.A.S',
            nit: '900.123.456-7',
            address: 'Calle 123 #45-67, Bogotá',
            phone: '(601) 123-4567',
            city: 'Bogotá',
            legalRepresentative: 'Carlos Rodríguez',
            legalRepresentativeId: '79.876.543'
          }
        };
        
        setProfile(mockProfile);
        setFormData({
          firstName: mockProfile.firstName,
          lastName: mockProfile.lastName,
          email: mockProfile.email,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (err: any) {
        setError(err.message || 'Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'password') {
      if (!formData.currentPassword) {
        setPasswordError('Debes ingresar tu contraseña actual');
        return;
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        setPasswordError('Las contraseñas no coinciden');
        return;
      }
      
      if (formData.newPassword.length < 8) {
        setPasswordError('La contraseña debe tener al menos 8 caracteres');
        return;
      }
    }
    
    try {
      setIsUpdating(true);
      setPasswordError('');
      
      // Aquí iría la llamada al API para actualizar el perfil
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (activeTab === 'personal') {
        // Actualizar datos del perfil en el estado
        setProfile(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email
          };
        });
      }
      
      setIsEditing(false);
      
      // Mostrar mensaje de éxito
      alert(activeTab === 'personal' 
        ? 'Perfil actualizado correctamente' 
        : 'Contraseña actualizada correctamente');
      
      // Limpiar campos de contraseña
      if (activeTab === 'password') {
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Error al actualizar el perfil');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'accountant': return 'Contador';
      case 'viewer': return 'Visualizador';
      default: return role;
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Cargando perfil...</LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container>
        <ErrorMessage>No se pudo cargar el perfil</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>Mi Perfil</h1>
      </Header>

      <ProfileGrid>
        <Sidebar>
          <ProfileAvatar>
            <div className="avatar">
              {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
            </div>
            <div className="name">
              {profile.firstName} {profile.lastName}
            </div>
            <div className="role">
              {getRoleLabel(profile.role)}
            </div>
          </ProfileAvatar>
          
          <TabList>
            <TabItem 
              active={activeTab === 'personal'} 
              onClick={() => { setActiveTab('personal'); setIsEditing(false); }}
            >
              <FaUser /> Información Personal
            </TabItem>
            <TabItem 
              active={activeTab === 'company'} 
              onClick={() => { setActiveTab('company'); setIsEditing(false); }}
            >
              <FaBuilding /> Datos de Empresa
            </TabItem>
            <TabItem 
              active={activeTab === 'password'} 
              onClick={() => { setActiveTab('password'); setIsEditing(false); }}
            >
              <FaKey /> Cambiar Contraseña
            </TabItem>
            <TabItem 
              active={activeTab === 'activity'} 
              onClick={() => { setActiveTab('activity'); setIsEditing(false); }}
            >
              <FaHistory /> Actividad Reciente
            </TabItem>
          </TabList>
        </Sidebar>
        
        <Content>
          {activeTab === 'personal' && (
            <TabContent>
              <TabHeader>
                <h2>Información Personal</h2>
                {!isEditing ? (
                  <Button variant="outline" size="small" onClick={() => setIsEditing(true)}>
                    Editar
                  </Button>
                ) : (
                  <ButtonGroup>
                    <Button variant="outline" size="small" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                    <Button size="small" onClick={handleSubmit} isLoading={isUpdating}>
                      Guardar
                    </Button>
                  </ButtonGroup>
                )}
              </TabHeader>
              
              {!isEditing ? (
                <InfoGrid>
                  <InfoItem>
                    <label>Nombre</label>
                    <span>{profile.firstName}</span>
                  </InfoItem>
                  <InfoItem>
                    <label>Apellido</label>
                    <span>{profile.lastName}</span>
                  </InfoItem>
                  <InfoItem>
                    <label>Correo Electrónico</label>
                    <span>{profile.email}</span>
                  </InfoItem>
                  <InfoItem>
                    <label>Rol</label>
                    <span>{getRoleLabel(profile.role)}</span>
                  </InfoItem>
                  <InfoItem>
                    <label>Fecha de Registro</label>
                    <span>{formatDate(profile.createdAt)}</span>
                  </InfoItem>
                  <InfoItem>
                    <label>Último Acceso</label>
                    <span>{formatDate(profile.lastLogin)}</span>
                  </InfoItem>
                </InfoGrid>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <FormGroup>
                    <label htmlFor="firstName">Nombre</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label htmlFor="lastName">Apellido</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup>
                    <label htmlFor="email">Correo Electrónico</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Form>
              )}
            </TabContent>
          )}
          
          {activeTab === 'company' && (
            <TabContent>
              <TabHeader>
                <h2>Datos de Empresa</h2>
              </TabHeader>
              
              <InfoGrid>
                <InfoItem>
                  <label>Nombre/Razón Social</label>
                  <span>{profile.company.name}</span>
                </InfoItem>
                <InfoItem>
                  <label>NIT</label>
                  <span>{profile.company.nit}</span>
                </InfoItem>
                <InfoItem>
                  <label>Dirección</label>
                  <span>{profile.company.address}</span>
                </InfoItem>
                <InfoItem>
                  <label>Teléfono</label>
                  <span>{profile.company.phone}</span>
                </InfoItem>
                <InfoItem>
                  <label>Ciudad</label>
                  <span>{profile.company.city}</span>
                </InfoItem>
                <InfoItem>
                  <label>Representante Legal</label>
                  <span>{profile.company.legalRepresentative}</span>
                </InfoItem>
                <InfoItem>
                  <label>Identificación Representante</label>
                  <span>{profile.company.legalRepresentativeId}</span>
                </InfoItem>
              </InfoGrid>
              
              <Note>
                Para modificar los datos de la empresa, contacta al administrador del sistema.
              </Note>
            </TabContent>
          )}
          
          {activeTab === 'password' && (
            <TabContent>
              <TabHeader>
                <h2>Cambiar Contraseña</h2>
              </TabHeader>
              
              {passwordError && <ErrorMessage>{passwordError}</ErrorMessage>}
              
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <label htmlFor="currentPassword">Contraseña Actual</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                </FormGroup>
                <FormGroup>
                  <label htmlFor="newPassword">Nueva Contraseña</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                </FormGroup>
                <FormGroup>
                  <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </FormGroup>
                
                <Button type="submit" isLoading={isUpdating}>
                  Actualizar Contraseña
                </Button>
              </Form>
              
              <PasswordRequirements>
                <h4>Requisitos de contraseña:</h4>
                <ul>
                  <li>Mínimo 8 caracteres</li>
                  <li>Al menos una letra mayúscula</li>
                  <li>Al menos un número</li>
                  <li>Al menos un carácter especial</li>
                </ul>
              </PasswordRequirements>
            </TabContent>
          )}
          
          {activeTab === 'activity' && (
            <TabContent>
              <TabHeader>
                <h2>Actividad Reciente</h2>
              </TabHeader>
              
              <ActivityList>
                <ActivityItem>
                  <div className="date">19 de abril de 2025, 10:30</div>
                  <div className="description">Inicio de sesión exitoso</div>
                </ActivityItem>
                <ActivityItem>
                  <div className="date">18 de abril de 2025, 15:45</div>
                  <div className="description">Creación de factura FE-2025-0001</div>
                </ActivityItem>
                <ActivityItem>
                  <div className="date">17 de abril de 2025, 09:15</div>
                  <div className="description">Inicio de sesión exitoso</div>
                </ActivityItem>
                <ActivityItem>
                  <div className="date">16 de abril de 2025, 14:20</div>
                  <div className="description">Actualización de datos de perfil</div>
                </ActivityItem>
                <ActivityItem>
                  <div className="date">15 de abril de 2025, 11:30</div>
                  <div className="description">Registro de nuevo cliente</div>
                </ActivityItem>
              </ActivityList>
            </TabContent>
          )}
        </Content>
      </ProfileGrid>
    </Container>
  );
};

const Container = styled.div`
  padding: var(--spacing-lg);
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: var(--spacing-lg);
  
  h1 {
    margin: 0;
    color: var(--color-text-primary);
  }
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--spacing-lg);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  @media (max-width: 768px) {
    margin-bottom: var(--spacing-md);
  }
`;

const ProfileAvatar = styled.div`
  background-color: var(--color-white);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
  text-align: center;
  margin-bottom: var(--spacing-md);
  
  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: var(--color-primary);
    color: var(--color-white);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    margin: 0 auto var(--spacing-md);
  }
  
  .name {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-xs);
  }
  
  .role {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }
`;

const TabList = styled.div`
  background-color: var(--color-white);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
`;

const TabItem = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--spacing-md);
  background-color: ${props => props.active ? 'var(--color-primary-light)' : 'transparent'};
  color: ${props => props.active ? 'var(--color-primary)' : 'var(--color-text-primary)'};
  border: none;
  text-align: left;
  cursor: pointer;
  font-weight: ${props => props.active ? 'var(--font-weight-medium)' : 'normal'};
  border-left: 3px solid ${props => props.active ? 'var(--color-primary)' : 'transparent'};
  transition: all var(--transition-normal);
  
  svg {
    margin-right: var(--spacing-sm);
  }
  
  &:hover {
    background-color: ${props => props.active ? 'var(--color-primary-light)' : 'var(--color-background)'};
  }
`;

const Content = styled.div`
  background-color: var(--color-white);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
`;

const TabContent = styled.div``;

const TabHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  
  h2 {
    margin: 0;
    color: var(--color-primary);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: var(--spacing-xs);
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  
  label {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-xs);
  }
  
  span {
    font-size: var(--font-size-md);
    color: var(--color-text-primary);
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
  
  label {
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-xs);
  }
  
  input {
    padding: 10px 16px;
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-sm);
    
    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgba(48, 102, 190, 0.2);
    }
  }
`;

const Note = styled.div`
  background-color: var(--color-info-bg);
  color: var(--color-info);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  margin-top: var(--spacing-lg);
  font-size: var(--font-size-sm);
`;

const PasswordRequirements = styled.div`
  margin-top: var(--spacing-lg);
  background-color: var(--color-background);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  
  h4 {
    margin-top: 0;
    margin-bottom: var(--spacing-sm);
    color: var(--color-text-primary);
  }
  
  ul {
    margin: 0;
    padding-left: var(--spacing-lg);
    
    li {
      margin-bottom: var(--spacing-xs);
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const ActivityItem = styled.div`
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  
  .date {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-xs);
  }
  
  .description {
    color: var(--color-text-primary);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
`;

const ErrorMessage = styled.div`
  background-color: var(--color-error-bg);
  color: var(--color-error);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-lg);
`;

export default ProfilePage;
