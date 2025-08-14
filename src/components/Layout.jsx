import React, { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

const DashboardLayout = ({ user, onLogout, children, navItems, pageTitle }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (
        <div className="flex h-screen bg-gray-100">
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-shrink-0`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
                        <span className="text-xl font-bold">Tracker</span>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white"><FiX className="w-6 h-6" /></button>
                    </div>
                    <nav className="flex-1 px-2 py-4 space-y-1">
                        {navItems.map(item => (
                            <button key={item.name} onClick={item.action} className="w-full flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md text-left">
                                {item.icon}
                                <span className="ml-3">{item.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center h-16 px-6 bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="flex items-center">
                        <button onClick={() => setSidebarOpen(true)} className="text-gray-500 focus:outline-none md:hidden"><FiMenu className="w-6 h-6" /></button>
                        <h1 className="text-2xl font-semibold text-gray-800 ml-2">{pageTitle}</h1>
                    </div>
                    <div className="flex items-center">
                        <span className="text-gray-600 mr-4">Welcome, <span className="font-semibold">{user.name || user.email}</span></span>
                        <button onClick={onLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm">Logout</button>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;