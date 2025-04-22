import React, { useState } from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import RecentCustomers from '../customers/RecentCustomers';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MainContent = styled.main<{ sidebarOpen: boolean }>`
  flex: 1;
  margin-left: ${props => props.sidebarOpen ? '250px' : '70px'};
  margin-top: 64px;
  padding: var(--spacing-lg);
  /* Glassmorphism panel background */
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  /* Glassmorphism panel border */
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-xl);
  transition: margin-left var(--transition-normal);
`;

const ContentContainer = styled.div`
  display: flex;
  gap: var(--spacing-xl);
  
  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const PrimaryContent = styled.div`
  flex: 3;
`;

const SidebarContent = styled.div`
  flex: 1;
  min-width: 300px;
  
  @media (max-width: 1024px) {
    min-width: 100%;
  }
`;

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <LayoutContainer>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <MainContent sidebarOpen={sidebarOpen}>
        <ContentContainer>
          <PrimaryContent>
            <Outlet />
          </PrimaryContent>
          <SidebarContent>
            <RecentCustomers limit={5} />
          </SidebarContent>
        </ContentContainer>
      </MainContent>
    </LayoutContainer>
  );
};

export default DashboardLayout;
