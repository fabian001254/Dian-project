import React, { useState } from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

// Ya no necesitamos la interfaz LayoutProps porque usaremos Outlet

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MainContent = styled.main<{ sidebarOpen: boolean }>`
  flex: 1;
  margin-left: ${props => props.sidebarOpen ? '250px' : '70px'};
  margin-top: 64px;
  padding: var(--spacing-lg);
  background-color: var(--color-background);
  transition: margin-left var(--transition-normal);
`;

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <LayoutContainer>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <MainContent sidebarOpen={sidebarOpen}>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;
