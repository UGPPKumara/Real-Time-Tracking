// src/components/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, setDoc, doc } from 'firebase/firestore';
// --- MEWENAS KAMA ---
import { initializeApp } from 'firebase/app'; 
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { db, app as mainApp, appId } from '../firebase/config'; // mainApp kiyala import karaganna
// --- ---

import DashboardLayout from './Layout';
import LiveMap from './LiveMap';
import EmployeeManagement from './EmployeeManagement';
import StatCard from './StatCard';
import { FiHome, FiUsers } from 'react-icons/fi';

const AdminDashboard = ({ user, onLogout }) => {
    // ... (anith state tika methana thiyenawa)
    const [page, setPage] = useState('dashboard');
    const [employees, setEmployees] = useState([]);
    const [locations, setLocations] = useState({});
    const [newEmployee, setNewEmployee] = useState({ name: '', email: '', password: '' });
    const [feedback, setFeedback] = useState({ message: '', type: '' });


    useEffect(() => {
        // ... (useEffect eke anith code eka)
    }, []);

    // --- ME FUNCTION EKA WENAS KARANNA ---
    const handleAddEmployee = async (e) => {
        e.preventDefault();
        setFeedback({ message: 'Adding employee...', type: 'info' });

        // 1. Create a temporary Firebase app instance
        const tempApp = initializeApp(mainApp.options, `secondary-${Date.now()}`);
        const tempAuth = getAuth(tempApp);

        try {
            // 2. Create the user with the temporary auth instance
            const { user: newUser } = await createUserWithEmailAndPassword(tempAuth, newEmployee.email, newEmployee.password);
            
            // 3. Save user data to your main Firestore database
            const userDocRef = doc(db, `artifacts/${appId}/public/data/users`, newUser.uid);
            await setDoc(userDocRef, { 
                name: newEmployee.name, 
                email: newEmployee.email, 
                role: 'employee' 
            });

            const locationDocRef = doc(db, `artifacts/${appId}/public/data/locations`, newUser.uid);
            await setDoc(locationDocRef, { 
                name: newEmployee.name, 
                status: 'inactive', 
                lat: null, 
                lon: null 
            });

            setFeedback({ message: `Successfully added ${newEmployee.name}.`, type: 'success' });
            setNewEmployee({ name: '', email: '', password: '' }); // Clear the form

        } catch (error) {
            // Provide more specific error messages
            if (error.code === 'auth/email-already-in-use') {
                setFeedback({ message: 'This email is already registered.', type: 'error' });
            } else if (error.code === 'auth/weak-password') {
                setFeedback({ message: 'Password should be at least 6 characters.', type: 'error' });
            } else {
                setFeedback({ message: `Error: ${error.message}`, type: 'error' });
            }
        }
    };
    
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setNewEmployee(prev => ({ ...prev, [id]: value }));
    };

    const navItems = [
        { name: 'Dashboard', icon: <FiHome />, action: () => setPage('dashboard') },
        { name: 'Employee Management', icon: <FiUsers />, action: () => setPage('management') },
    ];
    
    // ... (component eke anith code tika)
    const activeEmployees = employees.filter(emp => locations[emp.id]?.status === 'active' && locations[emp.id]?.lat && locations[emp.id]?.lon);
    const activeEmployeeDataForMap = activeEmployees.map(emp => ({
        id: emp.id,
        name: emp.name,
        location: [locations[emp.id].lat, locations[emp.id].lon]
    }));

    return (
        <DashboardLayout user={user} onLogout={onLogout} navItems={navItems} pageTitle={page === 'dashboard' ? 'Dashboard' : 'Employee Management'}>
            {page === 'dashboard' && (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <StatCard title="Total Employees" value={employees.length} color="border-blue-500" />
                        <StatCard title="Active" value={activeEmployees.length} color="border-green-500" />
                        <StatCard title="Inactive" value={employees.length - activeEmployees.length} color="border-yellow-500" />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md h-[60vh]">
                         <h2 className="text-xl font-semibold mb-4">Live Employee Map</h2>
                        <LiveMap activeEmployees={activeEmployeeDataForMap} />
                    </div>
                </div>
            )}
            {page === 'management' && (
                <EmployeeManagement 
                    employees={employees} 
                    onAddEmployee={{ handler: handleAddEmployee, formState: newEmployee, updater: handleInputChange }} 
                    feedback={feedback} 
                />
            )}
        </DashboardLayout>
    );

};

export default AdminDashboard;