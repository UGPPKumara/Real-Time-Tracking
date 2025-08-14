import React from 'react';
import { FiX } from 'react-icons/fi';

const Sidebar = ({ sidebarOpen, setSidebarOpen, navItems }) => {
    return (
        <div 
            className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-shrink-0`}
        >
            <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
                    <span className="text-xl font-bold">Tracker</span>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-2 py-4 space-y-1">
                    {navItems.map(item => (
                        <button 
                            key={item.name} 
                            onClick={() => {
                                item.action();
                                setSidebarOpen(false); // Close sidebar on item click for mobile
                            }} 
                            className="w-full flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md text-left"
                        >
                            {item.icon}
                            <span className="ml-3">{item.name}</span>
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default Sidebar;