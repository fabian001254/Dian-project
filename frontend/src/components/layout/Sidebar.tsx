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
  FaCog,
  FaBook,
  FaQuestionCircle
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
  background-color: var(--color-primary);
  color: var(--color-white);
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.div<{ isOpen: boolean }>`
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
  font-size: ${props => props.isOpen ? 'var(--font-size-lg)' : 'var(--font-size-md)'};
  color: var(--color-white);
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
  color: rgba(255, 255, 255, 0.8);
  transition: all var(--transition-fast);
  border-left: 3px solid transparent;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: var(--color-white);
  }
  
  &.active {
    background-color: rgba(255, 255, 255, 0.15);
    color: var(--color-white);
    border-left-color: var(--color-accent);
  }
  
  svg {
    font-size: 18px;
    min-width: ${props => props.isOpen ? '24px' : '70px'};
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
  color: rgba(255, 255, 255, 0.5);
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
    { path: '/products', icon: <FaBoxes />, text: 'Productos' },
    { path: '/certificates', icon: <FaCertificate />, text: 'Certificados' },
    { path: '/reports', icon: <FaChartBar />, text: 'Reportes' },
  ];
  
  const educationalItems = [
    { path: '/learning', icon: <FaBook />, text: 'Aprendizaje' },
    { path: '/help', icon: <FaQuestionCircle />, text: 'Ayuda' },
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
        
        <SectionTitle isOpen={isOpen}>Educativo</SectionTitle>
        
        {educationalItems.map((item) => (
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
