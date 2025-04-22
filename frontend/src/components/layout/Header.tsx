import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaBars, FaBell, FaQuestion, FaSignOutAlt, FaUser, FaCog } from 'react-icons/fa';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const HeaderContainer = styled.header<{ sidebarOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  left: ${props => props.sidebarOpen ? '250px' : '70px'};
  height: 64px;
  /* Glass background */
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  /* Texto e iconos segun tema */
  color: var(--color-text);
  /* Optional border bottom for separation */
  border-bottom: 1px solid var(--glass-border);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-md);
  z-index: 90;
  transition: left var(--transition-normal);
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: var(--color-text);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-circle);
  transition: background-color var(--transition-fast);
  
  &:hover {
    background-color: var(--color-gray-light);
  }
`;

const PageTitle = styled.h1`
  font-size: var(--font-size-lg);
  margin: 0 0 0 var(--spacing-md);
  color: var(--color-text);
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: var(--color-text);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-circle);
  transition: background-color var(--transition-fast);
  position: relative;
  
  &:hover {
    background-color: var(--color-gray-light);
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 5px;
  right: 5px;
  width: 8px;
  height: 8px;
  border-radius: var(--border-radius-circle);
  background-color: var(--color-error);
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-circle);
  background-color: var(--color-primary);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  position: relative;
`;

const UserMenu = styled.div`
  position: absolute;
  top: 45px;
  right: 0;
  width: 200px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-lg);
  z-index: 100;
  overflow: hidden;
  /* texto y iconos acorde al tema */
  color: var(--color-text);
`;

const UserMenuItem = styled.div`
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  
  &:hover {
    background-color: var(--color-gray-light);
  }
  
  svg {
    margin-right: var(--spacing-sm);
    font-size: 16px;
  }
`;

const UserInfo = styled.div`
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  
  h4 {
    margin: 0;
    font-size: var(--font-size-md);
    color: var(--color-text);
  }
  
  p {
    margin: var(--spacing-xs) 0 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }
`;

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Get current page name from URL
  const pathname = window.location.pathname;
  const currentPage = pathname.split('/')[1] || 'Dashboard';
  const currentPageFormatted = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
  
  // Get user initials
  const userInitials = user ? 
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : 'U';
  
  const hasNotifications = true; // Esto podría venir de un contexto o estado real
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };
  
  const handleProfile = () => {
    navigate('/profile');
    setShowUserMenu(false);
  };
  
  return (
    <HeaderContainer sidebarOpen={sidebarOpen}>
      <LeftSection>
        <MenuButton onClick={toggleSidebar}>
          <FaBars />
        </MenuButton>
        <PageTitle>{currentPage}</PageTitle>
      </LeftSection>
      
      <RightSection>
        <Button 
          variant="accent" 
          size="small"
        >
          Nueva Factura
        </Button>
        
        <ThemeToggle />
        
        <IconButton>
          <FaQuestion />
        </IconButton>
        
        <IconButton>
          <FaBell />
          {hasNotifications && <NotificationBadge />}
        </IconButton>
        
        <UserAvatar onClick={() => setShowUserMenu(!showUserMenu)} ref={menuRef}>
          {userInitials}
          {showUserMenu && (
            <UserMenu>
              <UserInfo>
                <h4>{user?.firstName} {user?.lastName}</h4>
                <p>{user?.email}</p>
              </UserInfo>
              <UserMenuItem onClick={handleProfile}>
                <FaUser />
                Perfil
              </UserMenuItem>
              <UserMenuItem onClick={handleLogout}>
                <FaSignOutAlt />
                Cerrar Sesión
              </UserMenuItem>
            </UserMenu>
          )}
        </UserAvatar>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;
