// pages/Dashboard.tsx
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Layout/Header';
import DashboardContent from '../components/dashboard/DashboardContent';

interface LayoutContext {
    toggleSidebar: () => void;
    sidebarOpen: boolean;
    isMobile: boolean;
}

const Dashboard: React.FC = () => {
    const { toggleSidebar, sidebarOpen, isMobile } = useOutletContext<LayoutContext>();

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
            <Header
                toggleSidebar={toggleSidebar}
                sidebarOpen={sidebarOpen}
                isMobile={isMobile}
                currentPage="dashboard"
                showAddButton={false}
                showSearch={false}
                showFilter={false}
                showViewToggle={false}
            />
            <div className="p-4 md:p-6">
                <DashboardContent />
            </div>
        </div>
    );
};

export default Dashboard;