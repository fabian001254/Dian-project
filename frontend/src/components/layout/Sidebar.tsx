import React from 'react';
import styled from 'styled-components';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaFileInvoiceDollar, 
  FaUsers, 
  FaBoxes, 
  FaCertificate, 
  FaChartBar, 
  FaUserTie,
  FaCog
} from 'react-icons/fa';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const SidebarContainer = styled.aside<{ isOpen: boolean }>`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: ${props => props.isOpen ? '250px' : '70px'};
  /* Background del sidebar según tema */
  background: var(--sidebar-bg);
  border-right: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
  color: var(--color-text);
  /* Transition suave al cambiar tema */
  transition: background var(--transition-normal), color var(--transition-normal), border-color var(--transition-normal);
  border-top-right-radius: var(--border-radius-xl);
  border-bottom-right-radius: var(--border-radius-xl);
  transition: width var(--transition-normal);
  z-index: 100;
  box-shadow: var(--shadow-lg);
  overflow-x: hidden;
  overflow-y: auto;
`;

const SidebarHeader = styled.div`
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--glass-border);
`;

const Logo = styled.div<{ isOpen: boolean }>`
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
  font-size: ${props => props.isOpen ? 'var(--font-size-lg)' : 'var(--font-size-md)'};
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MenuList = styled.ul`
  list-style: none;
  padding: var(--spacing-md) 0;
  margin: 0;
`;

const MenuItem = styled.li`
  margin-bottom: 4px;
`;

// Creamos un componente personalizado que no pase la prop isOpen al DOM
const NavLinkWrapper: React.FC<{ isOpen: boolean } & React.ComponentProps<typeof NavLink>> = ({ isOpen, ...props }) => <NavLink {...props} />;

const MenuLink = styled(NavLinkWrapper)<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  padding: ${props => props.isOpen ? '10px 16px' : '10px 0'};
  justify-content: ${props => props.isOpen ? 'flex-start' : 'center'};
  color: var(--color-text);
  transition: all var(--transition-fast);
  border-left: 3px solid transparent;
  
  &:hover {
    background-color: var(--glass-bg);
    color: var(--color-text);
  }
  
  &.active {
    background-color: var(--glass-border);
    color: var(--color-text);
    border-left-color: var(--color-accent);
  }
  
  svg {
    font-size: 18px;
    width: 24px;
  }
`;

const MenuText = styled.span<{ isOpen: boolean }>`
  margin-left: var(--spacing-sm);
  white-space: nowrap;
  opacity: ${props => props.isOpen ? 1 : 0};
  transition: opacity var(--transition-fast);
`;

const SectionTitle = styled.div<{ isOpen: boolean }>`
  padding: ${props => props.isOpen ? '8px 16px' : '8px 0'};
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  color: var(--color-gray);
  margin-top: var(--spacing-md);
  white-space: nowrap;
  opacity: ${props => props.isOpen ? 1 : 0};
  text-align: ${props => props.isOpen ? 'left' : 'center'};
  transition: opacity var(--transition-fast);
`;

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/dashboard', icon: <FaHome />, text: 'Inicio' },
    { path: '/invoices', icon: <FaFileInvoiceDollar />, text: 'Facturación' },
    { path: '/customers', icon: <FaUsers />, text: 'Clientes' },
    { path: '/vendors', icon: <FaUserTie />, text: 'Vendedores' },
    { path: '/products', icon: <FaBoxes />, text: 'Productos' },
    { path: '/certificates', icon: <FaCertificate />, text: 'Certificados' },
    { path: '/reports', icon: <FaChartBar />, text: 'Reportes' },
  ];
  
  const settingsItems = [
    { path: '/settings', icon: <FaCog />, text: 'Configuración' },
  ];

  return (
    <SidebarContainer isOpen={isOpen}>
      <SidebarHeader>
        <Logo isOpen={isOpen}>
          {isOpen ? 'DIAN Facturación' : 'DIAN'}
        </Logo>
      </SidebarHeader>
      
      <MenuList>
        {menuItems.map((item) => (
          <MenuItem key={item.path}>
            <MenuLink 
              to={item.path} 
              isOpen={isOpen}
              className={location.pathname === item.path ? 'active' : ''}
            >
              {item.icon}
              <MenuText isOpen={isOpen}>{item.text}</MenuText>
            </MenuLink>
          </MenuItem>
        ))}
        
        <SectionTitle isOpen={isOpen}>Sistema</SectionTitle>
        
        {settingsItems.map((item) => (
          <MenuItem key={item.path}>
            <MenuLink 
              to={item.path} 
              isOpen={isOpen}
              className={location.pathname === item.path ? 'active' : ''}
            >
              {item.icon}
              <MenuText isOpen={isOpen}>{item.text}</MenuText>
            </MenuLink>
          </MenuItem>
        ))}
      </MenuList>
    </SidebarContainer>
  );
};

export default Sidebar;
