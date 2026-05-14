// components/common/Layout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Layout/Sidebar';

const Layout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleSidebar = () => {
        if (isMobile) {
            setSidebarOpen(!sidebarOpen);
        }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
            {/* Overlay pour mobile */}
            {sidebarOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full z-30 transition-all duration-300 ease-in-out
                    ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
                    w-64 lg:w-72`}
                style={{ backgroundColor: 'var(--color-primary)' }}
            >
                <Sidebar isMobile={isMobile} onClose={() => setSidebarOpen(false)} />
            </aside>

            {/* Main content */}
            <div className={`transition-all duration-300 ease-in-out ${!isMobile ? 'ml-64 lg:ml-72' : 'ml-0'}`}>
                <Outlet context={{ toggleSidebar, sidebarOpen, isMobile }} />
            </div>
        </div>
    );
};

export default Layout;