import React, { useState, useEffect, useRef } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, appId } from '../firebase/config';
import DashboardLayout from './Layout';
import { FiMapPin } from 'react-icons/fi';

const EmployeeDashboard = ({ user, onLogout }) => {
    const [isTracking, setIsTracking] = useState(false);
    const [location, setLocation] = useState(null);
    const [error, setError] = useState('');
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
        setError('');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lon: longitude });
                updateLocationInFirestore(latitude, longitude, 'active');
                setIsTracking(true);

                locationWatchId.current = navigator.geolocation.watchPosition(
                    (pos) => {
                        const { latitude, longitude } = pos.coords;
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
            },
            (err) => {
                setError(`Could not get initial location: ${err.message}`);
            }
        );
    };

    const handleCheckOut = () => {
        if (locationWatchId.current) {
            navigator.geolocation.clearWatch(locationWatchId.current);
            locationWatchId.current = null;
        }
        setIsTracking(false);
        setLocation(null);
        updateLocationInFirestore(null, null, 'inactive');
    };
    
    useEffect(() => {
        // Cleanup on component unmount
        return () => {
            if (locationWatchId.current) {
                navigator.geolocation.clearWatch(locationWatchId.current);
            }
        };
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

export default EmployeeDashboard;