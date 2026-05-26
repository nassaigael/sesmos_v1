import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import ClientSidebar from '../../components/client/ClientSidebar';
import ClientHeader from '../../components/client/ClientHeader';
import { ClientAuthProvider } from '../../contexts/ClientAuthContext';

interface LayoutContext {
    toggleSidebar: () => void;
    sidebarOpen: boolean;
    isMobile: boolean;
}

const ClientLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const layoutContext: LayoutContext = {
        toggleSidebar,
        sidebarOpen,
        isMobile
    };

    return (
        <ClientAuthProvider>
            <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F5F7FA' }}>
                {isMobile && sidebarOpen && (
                    <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
                )}

                <aside
                    className={`fixed md:relative z-40 h-full transition-transform duration-300 ease-in-out
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                        w-64 shadow-xl`}
                    style={{ backgroundColor: '#1A3C5E' }}
                >
                    <ClientSidebar isMobile={isMobile} onClose={() => setSidebarOpen(false)} />
                </aside>

                <div className="flex-1 flex flex-col overflow-hidden">
                    <ClientHeader toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} isMobile={isMobile} />
                    <main className="flex-1 overflow-y-auto p-4 md:p-6">
                        <Outlet context={layoutContext} />
                    </main>
                </div>
            </div>
        </ClientAuthProvider>
    );
};

export default ClientLayout;