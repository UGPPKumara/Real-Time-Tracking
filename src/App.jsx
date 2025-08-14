import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, onSnapshot, query, where } from 'firebase/firestore';

// --- Firebase Configuration ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = {
  apiKey: "AIzaSyA7r9IuqmXYUpEJ1CYVVNx9iRFqKY3P450",
  authDomain: "realtimetracker-703cb.firebaseapp.com",
  projectId: "realtimetracker-703cb",
  storageBucket: "realtimetracker-703cb.firebasestorage.app",
  messagingSenderId: "945284286927",
  appId: "1:945284286927:web:ca3135ea2d118b71f2eaba",
  measurementId: "G-YDWLEDFEDC"
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- SVG Icons ---
const HomeIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const UsersIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 013 1.803M15 21a9 9 0 00-9-5.197" /></svg>;
const LocationMarkerIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const MenuIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const XIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

// --- Helper Components ---
const Spinner = () => <div className="loader border-4 border-solid border-gray-200 border-t-blue-500 rounded-full w-6 h-6 animate-spin"></div>;

// --- Layout Components ---
const DashboardLayout = ({ user, onLogout, children, navItems, pageTitle }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (
        <div className="flex h-screen bg-gray-100">
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-shrink-0`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
                        <span className="text-xl font-bold">Tracker</span>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white"><XIcon /></button>
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
                        <button onClick={() => setSidebarOpen(true)} className="text-gray-500 focus:outline-none md:hidden"><MenuIcon /></button>
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

// --- Main Components ---
const LoginView = () => {
    const [email, setEmail] = useState('admin@nuvoora.com');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            if (err.code === 'auth/user-not-found' && email === 'admin@nuvoora.com') {
                try {
                    await createUserWithEmailAndPassword(auth, email, password);
                } catch (createError) {
                    setError(`Admin creation failed: ${createError.message}`);
                }
            } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                setError('Incorrect password. Please try again.');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">Location Tracker</h1>
                <p className="text-center text-gray-500 mb-8">Sign in to your account</p>
                {error && <div className="text-red-500 text-center mb-4 p-2 bg-red-100 rounded">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-600 mb-2">Email</label>
                        <input type="email" id="email" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-600 mb-2">Password</label>
                        <input type="password" id="password" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center h-10" disabled={loading}>
                        {loading ? <Spinner /> : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Admin Dashboard Components ---
const StatCard = ({ title, value, color }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color}`}>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
);

const LiveMap = ({ activeEmployees, mapReady }) => {
    if (!mapReady || !window.ReactLeaflet) {
        return (
             <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                <Spinner /> <span className="ml-4">Loading Map...</span>
            </div>
        );
    }

    const { MapContainer, TileLayer, Marker, Tooltip } = window.ReactLeaflet;
    const defaultPosition = [6.9271, 79.8612]; // Default to Colombo, Sri Lanka
    
    if (activeEmployees.length === 0) {
        return (
             <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                No active employees to display on the map.
            </div>
        );
    }

    return (
        <MapContainer center={activeEmployees[0].location || defaultPosition} zoom={13} style={{ height: '100%', width: '100%' }} className="rounded-lg">
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {activeEmployees.map(emp => (
                <Marker key={emp.id} position={emp.location}>
                    <Tooltip>{emp.name}</Tooltip>
                </Marker>
            ))}
        </MapContainer>
    );
};


const EmployeeManagement = ({ employees, onAddEmployee, feedback }) => (
    <div>
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center"><UsersIcon /><span className="ml-2">Add New Employee</span></h2>
            <form onSubmit={onAddEmployee.handler} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                <input id="name" value={onAddEmployee.formState.name} onChange={onAddEmployee.updater} placeholder="Employee Name" className="w-full px-3 py-2 border rounded-lg" required />
                <input id="email" type="email" value={onAddEmployee.formState.email} onChange={onAddEmployee.updater} placeholder="Employee Email" className="w-full px-3 py-2 border rounded-lg" required />
                <input id="password" type="password" value={onAddEmployee.formState.password} onChange={onAddEmployee.updater} placeholder="Password (min. 6 chars)" className="w-full px-3 py-2 border rounded-lg" required />
                <div className="md:col-span-2 lg:col-span-3 text-right">
                    <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">Add Employee</button>
                </div>
            </form>
            {feedback.message && <div className={`mt-4 text-center p-2 rounded ${feedback.type === 'success' ? 'text-green-700 bg-green-100' : feedback.type === 'error' ? 'text-red-700 bg-red-100' : 'text-blue-700 bg-blue-100'}`}>{feedback.message}</div>}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">All Employees</h2>
            <div className="space-y-2">
                {employees.length > 0 ? employees.map(emp => (
                    <div key={emp.id} className="p-3 border rounded-lg flex justify-between items-center bg-gray-50">
                        <p className="font-semibold">{emp.name}</p>
                        <p className="text-sm text-gray-600">{emp.email}</p>
                    </div>
                )) : <p className="text-gray-500">No employees registered yet.</p>}
            </div>
        </div>
    </div>
);

const AdminDashboard = ({ user, onLogout, mapReady }) => {
    const [page, setPage] = useState('dashboard'); // dashboard or management
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
        try {
            const tempApp = initializeApp(firebaseConfig, `secondary-${Date.now()}`);
            const tempAuth = getAuth(tempApp);
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
        { name: 'Dashboard', icon: <HomeIcon />, action: () => setPage('dashboard') },
        { name: 'Employee Management', icon: <UsersIcon />, action: () => setPage('management') },
    ];

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
                        <LiveMap activeEmployees={activeEmployeeDataForMap} mapReady={mapReady} />
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

const EmployeeDashboard = ({ user, onLogout }) => {
    const [isTracking, setIsTracking] = useState(false);
    const [location, setLocation] = useState(null);
    const [error, setError] = useState('');
    const locationWatchId = useRef(null);
    const navItems = [{ name: 'My Location', icon: <LocationMarkerIcon />, action: () => {} }];

    const updateLocationInFirestore = async (lat, lon, status) => {
        const locationDocRef = doc(db, `artifacts/${appId}/public/data/locations`, user.uid);
        await setDoc(locationDocRef, { lat, lon, status, name: user.name }, { merge: true });
    };

    const handleCheckIn = () => {
        if (!("geolocation" in navigator)) {
            setError("Geolocation is not supported by your browser.");
            return;
        }
        setError('');
        locationWatchId.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lon: longitude });
                updateLocationInFirestore(latitude, longitude, 'active');
            },
            (err) => {
                setError(`Geolocation error: ${err.message}`);
                if (err.code === err.PERMISSION_DENIED) {
                    setError('Location permission denied. Please enable it in your browser settings.');
                }
                handleCheckOut();
            },
            { enableHighAccuracy: true }
        );
        setIsTracking(true);
    };

    const handleCheckOut = () => {
        if (locationWatchId.current) navigator.geolocation.clearWatch(locationWatchId.current);
        setIsTracking(false);
        setLocation(null);
        updateLocationInFirestore(null, null, 'inactive');
    };
    
    useEffect(() => () => {
        if (locationWatchId.current) navigator.geolocation.clearWatch(locationWatchId.current);
    }, []);

    return (
        <DashboardLayout user={user} onLogout={onLogout} navItems={navItems} pageTitle="Employee Dashboard">
            <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
                <h2 className="text-xl font-semibold mb-2">Location Tracking</h2>
                <p className={`text-lg font-medium mb-6 ${isTracking ? 'text-green-600' : 'text-gray-500'}`}>Status: {isTracking ? 'Active' : 'Inactive'}</p>
                <div className="flex justify-center space-x-4">
                    <button onClick={handleCheckIn} disabled={isTracking} className="bg-green-500 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-green-600 transition transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed">IN</button>
                    <button onClick={handleCheckOut} disabled={!isTracking} className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-yellow-600 transition transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed">OUT</button>
                </div>
                <div className="mt-6 text-gray-600 min-h-[48px]">
                    {isTracking && location && <div><p><strong>Latitude:</strong> {location.lat.toFixed(5)}</p><p><strong>Longitude:</strong> {location.lon.toFixed(5)}</p></div>}
                    {!isTracking && <p>Tracking stopped.</p>}
                </div>
                {error && <div className="text-red-500 mt-4 p-2 bg-red-100 rounded">{error}</div>}
            </div>
        </DashboardLayout>
    );
};

// --- App Component ---
export default function App() {
    const [view, setView] = useState('loading');
    const [user, setUser] = useState(null);
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        // This effect handles loading the Leaflet CSS and JS files
        // and polls until the map library is ready.
        const loadMapScripts = () => {
            // Prevent re-adding scripts if they already exist
            if (document.getElementById('leaflet-css')) return; 

            const leafletCss = document.createElement('link');
            leafletCss.id = 'leaflet-css';
            leafletCss.rel = 'stylesheet';
            leafletCss.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
            document.head.appendChild(leafletCss);

            const leafletJs = document.createElement('script');
            leafletJs.id = 'leaflet-js';
            leafletJs.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
            
            // Load react-leaflet only after leaflet has loaded
            leafletJs.onload = () => {
                 const reactLeafletJs = document.createElement('script');
                 reactLeafletJs.id = 'react-leaflet-js';
                 reactLeafletJs.src = 'https://unpkg.com/react-leaflet@3.2.5/dist/react-leaflet.min.js';
                 document.body.appendChild(reactLeafletJs);
            };
            document.body.appendChild(leafletJs);
        };

        loadMapScripts();

        // Poll to check when the map library is available on the window object
        const interval = setInterval(() => {
            if (window.ReactLeaflet) {
                setMapReady(true);
                clearInterval(interval);
            }
        }, 200);

        // Firebase authentication listener
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userDocRef = doc(db, `artifacts/${appId}/public/data/users`, firebaseUser.uid);
                let userDoc = await getDoc(userDocRef);
                if (!userDoc.exists() && firebaseUser.email === 'admin@nuvoora.com') {
                    await setDoc(userDocRef, { email: firebaseUser.email, role: 'admin', name: 'Admin' });
                    userDoc = await getDoc(userDocRef);
                }
                if (userDoc.exists()) {
                    setUser({ uid: firebaseUser.uid, ...userDoc.data() });
                    setView(userDoc.data().role);
                } else {
                    await signOut(auth);
                }
            } else {
                setUser(null);
                setView('login');
            }
        });

        // Cleanup function
        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    const handleLogout = async () => await signOut(auth);

    if (view === 'loading') {
        return <div className="flex justify-center items-center h-screen bg-gray-100"><Spinner /></div>;
    }

    switch (view) {
        case 'admin': return <AdminDashboard user={user} onLogout={handleLogout} mapReady={mapReady} />;
        case 'employee': return <EmployeeDashboard user={user} onLogout={handleLogout} />;
        case 'login': return <LoginView />;
        default: return <div className="flex justify-center items-center h-screen bg-gray-100"><Spinner /></div>;
    }
}
