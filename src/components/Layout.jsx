import React, { useState } from 'react';
import { FiMenu } from 'react-icons/fi';
import Sidebar from './Sidebar'; // Import the new Sidebar component

const DashboardLayout = ({ user, onLogout, children, navItems, pageTitle }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* --- Sidebar Component --- */}
            <Sidebar 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
                navItems={navItems} 
            />

            {/* --- Main Content --- */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center h-16 px-6 bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="flex items-center">
                        <button onClick={() => setSidebarOpen(true)} className="text-gray-500 focus:outline-none md:hidden">
                            <FiMenu className="w-6 h-6" />
                        </button>
                        <h1 className="text-2xl font-semibold text-gray-800 ml-2">{pageTitle}</h1>
                    </div>
                    <div className="flex items-center">
                        <span className="text-gray-600 mr-4">Welcome, <span className="font-semibold">{user.name || user.email}</span></span>
                        <button onClick={onLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm">Logout</button>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;