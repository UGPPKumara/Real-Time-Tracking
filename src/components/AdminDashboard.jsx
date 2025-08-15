import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, setDoc, doc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { db, app as mainApp, appId } from '../firebase/config';
import DashboardLayout from './Layout';
import LiveMap from './LiveMap';
import EmployeeManagement from './EmployeeManagement';
import StatCard from './StatCard';
import Reports from './Reports'; // Import the new Reports component
import { FiHome, FiUsers, FiClipboard } from 'react-icons/fi';

const AdminDashboard = ({ user, onLogout }) => {
    const [page, setPage] = useState('dashboard'); // dashboard, management, or reports
    const [employees, setEmployees] = useState([]);
    const [locations, setLocations] = useState({});
    const [newEmployee, setNewEmployee] = useState({ name: '', email: '', password: '' });
    const [feedback, setFeedback] = useState({ message: '', type: '' });

    useEffect(() => {
        const usersQuery = query(collection(db, `artifacts/${appId}/public/data/users`), where("role", "==", "employee"));
        const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
            setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const locationsQuery = query(collection(db, `artifacts/${appId}/public/data/locations`));
        const unsubscribeLocations = onSnapshot(locationsQuery, (snapshot) => {
            const locs = {};
            snapshot.forEach(doc => {
                locs[doc.id] = doc.data();
            });
            setLocations(locs);
        });

        return () => {
            unsubscribeUsers();
            unsubscribeLocations();
        };
    }, []);

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        setFeedback({ message: 'Adding...', type: 'info' });
        const tempApp = initializeApp(mainApp.options, `secondary-${Date.now()}`);
        const tempAuth = getAuth(tempApp);
        try {
            const { user: newUser } = await createUserWithEmailAndPassword(tempAuth, newEmployee.email, newEmployee.password);
            await setDoc(doc(db, `artifacts/${appId}/public/data/users`, newUser.uid), { name: newEmployee.name, email: newEmployee.email, role: 'employee' });
            await setDoc(doc(db, `artifacts/${appId}/public/data/locations`, newUser.uid), { name: newEmployee.name, status: 'inactive', lat: null, lon: null });
            setFeedback({ message: `Successfully added ${newEmployee.name}.`, type: 'success' });
            setNewEmployee({ name: '', email: '', password: '' });
        } catch (error) {
            setFeedback({ message: `Error: ${error.message}`, type: 'error' });
        }
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setNewEmployee(prev => ({ ...prev, [id]: value }));
    };

    const navItems = [
        { name: 'Dashboard', icon: <FiHome />, action: () => setPage('dashboard') },
        { name: 'Employees', icon: <FiUsers />, action: () => setPage('management') },
        { name: 'Reports', icon: <FiClipboard />, action: () => setPage('reports') } // New reports link
    ];

    const pageTitles = {
        dashboard: 'Dashboard',
        management: 'Employee Management',
        reports: 'Visit Reports'
    };

    const activeEmployees = employees.filter(emp => locations[emp.id]?.status === 'active' && locations[emp.id]?.lat && locations[emp.id]?.lon);
    const activeEmployeeDataForMap = activeEmployees.map(emp => ({
        id: emp.id,
        name: emp.name,
        location: [locations[emp.id].lat, locations[emp.id].lon]
    }));

    const renderPage = () => {
        switch (page) {
            case 'management':
                return <EmployeeManagement 
                            employees={employees} 
                            onAddEmployee={{ handler: handleAddEmployee, formState: newEmployee, updater: handleInputChange }} 
                            feedback={feedback} 
                        />;
            case 'reports':
                return <Reports />;
            case 'dashboard':
            default:
                return (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <StatCard title="Total Employees" value={employees.length} color="border-blue-500" />
                            <StatCard title="Active Now" value={activeEmployees.length} color="border-green-500" />
                            <StatCard title="Inactive" value={employees.length - activeEmployees.length} color="border-yellow-500" />
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md h-[60vh]">
                            <h2 className="text-xl font-semibold mb-4">Live Employee Map</h2>
                            <LiveMap activeEmployees={activeEmployeeDataForMap} />
                        </div>
                    </div>
                );
        }
    }

    return (
        <DashboardLayout user={user} onLogout={onLogout} navItems={navItems} pageTitle={pageTitles[page]}>
            {renderPage()}
        </DashboardLayout>
    );
};

export default AdminDashboard;