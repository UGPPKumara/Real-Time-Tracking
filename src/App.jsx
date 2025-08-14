import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, appId } from './firebase/config';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import LoginView from './components/Login';
import { Spinner } from './components/Spinner';

export default function App() {
    const [view, setView] = useState('loading');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userDocRef = doc(db, `artifacts/${appId}/public/data/users`, firebaseUser.uid);
                let userDoc = await getDoc(userDocRef);

                // Create admin user if it doesn't exist
                if (!userDoc.exists() && firebaseUser.email === 'admin@nuvoora.com') {
                    await setDoc(userDocRef, { email: firebaseUser.email, role: 'admin', name: 'Admin' });
                    userDoc = await getDoc(userDocRef); // Re-fetch the document
                }
                
                if (userDoc.exists()) {
                    setUser({ uid: firebaseUser.uid, ...userDoc.data() });
                    setView(userDoc.data().role);
                } else {
                    // If user is not in the database, sign them out
                    await signOut(auth);
                }
            } else {
                setUser(null);
                setView('login');
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
    };

    if (view === 'loading') {
        return <div className="flex justify-center items-center h-screen bg-gray-100"><Spinner /></div>;
    }

    switch (view) {
        case 'admin':
            return <AdminDashboard user={user} onLogout={handleLogout} />;
        case 'employee':
            return <EmployeeDashboard user={user} onLogout={handleLogout} />;
        case 'login':
            return <LoginView />;
        default:
            return <div className="flex justify-center items-center h-screen bg-gray-100"><Spinner /></div>;
    }
}