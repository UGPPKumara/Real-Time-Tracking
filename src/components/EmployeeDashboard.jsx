import React, { useState, useEffect, useRef } from 'react';
import { doc, setDoc, collection, query, where, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../firebase/config';
import DashboardLayout from './Layout';
import VisitModal from './VisitModal';
import { FiMapPin } from 'react-icons/fi';

const EmployeeDashboard = ({ user, onLogout }) => {
    const [isTracking, setIsTracking] = useState(false);
    const [location, setLocation] = useState(null);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [visitLoading, setVisitLoading] = useState(false);
    const [currentVisitId, setCurrentVisitId] = useState(null);
    const locationWatchId = useRef(null);

    const navItems = [{ name: 'My Location', icon: <FiMapPin />, action: () => {} }];

    const updateLocationInFirestore = async (lat, lon, status) => {
        const locationDocRef = doc(db, `artifacts/${appId}/public/data/locations`, user.uid);
        await setDoc(locationDocRef, { lat, lon, status, name: user.name }, { merge: true });
    };

    const handleCheckIn = () => {
        if (!("geolocation" in navigator)) {
            setError("Geolocation is not supported by your browser.");
            return;
        }
        setModalOpen(true);
    };

    const handleStartVisit = async ({ customerName, visitNotes }) => {
        setVisitLoading(true);
        setError('');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const newLocation = { lat: latitude, lon: longitude };
                setLocation(newLocation);
                
                // Create new visit document
                const visitRef = doc(collection(db, `artifacts/${appId}/public/data/visits`));
                await setDoc(visitRef, {
                    employeeId: user.uid,
                    employeeName: user.name,
                    customerName,
                    visitNotes,
                    checkInTime: serverTimestamp(),
                    checkOutTime: null,
                    startLocation: newLocation,
                    status: 'ongoing'
                });
                setCurrentVisitId(visitRef.id);

                await updateLocationInFirestore(latitude, longitude, 'active');
                setIsTracking(true);
                setModalOpen(false);
                setVisitLoading(false);

                locationWatchId.current = navigator.geolocation.watchPosition(
                    (pos) => {
                        const { latitude, longitude } = pos.coords;
                        setLocation({ lat: latitude, lon: longitude });
                        updateLocationInFirestore(latitude, longitude, 'active');
                    },
                    (err) => {
                        setError(`Geolocation error: ${err.message}`);
                        handleCheckOut();
                    },
                    { enableHighAccuracy: true }
                );
            },
            (err) => {
                setError(`Could not get location: ${err.message}`);
                setVisitLoading(false);
            }
        );
    };

    const handleCheckOut = async () => {
        if (locationWatchId.current) {
            navigator.geolocation.clearWatch(locationWatchId.current);
            locationWatchId.current = null;
        }
        
        if (currentVisitId) {
            const visitDocRef = doc(db, `artifacts/${appId}/public/data/visits`, currentVisitId);
            await updateDoc(visitDocRef, {
                checkOutTime: serverTimestamp(),
                status: 'completed'
            });
            setCurrentVisitId(null);
        }

        setIsTracking(false);
        setLocation(null);
        await updateLocationInFirestore(null, null, 'inactive');
    };
    
    // Check for ongoing visits on component mount
    useEffect(() => {
        const checkForOngoingVisit = async () => {
            const q = query(collection(db, `artifacts/${appId}/public/data/visits`), where("employeeId", "==", user.uid), where("status", "==", "ongoing"));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const ongoingVisit = querySnapshot.docs[0];
                setCurrentVisitId(ongoingVisit.id);
                setIsTracking(true);
                 // You might want to re-initiate watchPosition here if the page was reloaded
            }
        };
        if(user) checkForOngoingVisit();

        return () => {
            if (locationWatchId.current) navigator.geolocation.clearWatch(locationWatchId.current);
        };
    }, [user]);

    return (
        <>
            <VisitModal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                onSubmit={handleStartVisit}
                loading={visitLoading}
            />
            <DashboardLayout user={user} onLogout={onLogout} navItems={navItems} pageTitle="Employee Dashboard">
                <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
                    <h2 className="text-xl font-semibold mb-2">Location Tracking</h2>
                    <p className={`text-lg font-medium mb-6 ${isTracking ? 'text-green-600' : 'text-gray-500'}`}>Status: {isTracking ? 'Tracking Active' : 'Inactive'}</p>
                    <div className="flex justify-center space-x-4">
                        <button onClick={handleCheckIn} disabled={isTracking} className="bg-green-500 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-green-600 transition disabled:bg-gray-400">IN</button>
                        <button onClick={handleCheckOut} disabled={!isTracking} className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-yellow-600 transition disabled:bg-gray-400">OUT</button>
                    </div>
                     <div className="mt-6 text-gray-600 min-h-[48px]">
                        {isTracking && location && <div><p><strong>Latitude:</strong> {location.lat.toFixed(5)}</p><p><strong>Longitude:</strong> {location.lon.toFixed(5)}</p></div>}
                        {!isTracking && <p>Start a new visit to begin tracking.</p>}
                    </div>
                    {error && <div className="text-red-500 mt-4 p-2 bg-red-100 rounded">{error}</div>}
                </div>
            </DashboardLayout>
        </>
    );
};

export default EmployeeDashboard;