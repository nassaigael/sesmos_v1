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
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#F5F7FA' }}>
            {sidebarOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed top-0 left-0 h-full z-30 transition-transform duration-300 ease-in-out
                    ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
                    w-64`}
                style={{ backgroundColor: '#1A3C5E' }}
            >
                <Sidebar isMobile={isMobile} onClose={() => setSidebarOpen(false)} />
            </aside>

            <div className={`transition-all duration-300 ease-in-out ${!isMobile ? 'ml-64' : 'ml-0'}`}>
                <Outlet context={{ toggleSidebar, sidebarOpen, isMobile }} />
            </div>
        </div>
    );
};

export default Layout;