import React from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import { Spinner } from './Spinner'; // Assuming you have a Spinner component

const LiveMap = ({ activeEmployees }) => {
    const defaultPosition = [6.9271, 79.8612]; // Colombo, Sri Lanka

    if (activeEmployees.length === 0) {
        return (
            <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                No active employees to display on the map.
            </div>
        );
    }

    return (
        <MapContainer
            center={activeEmployees[0].location || defaultPosition}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="rounded-lg"
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {activeEmployees.map(emp => (
                emp.location && <Marker key={emp.id} position={emp.location}>
                    <Tooltip>{emp.name}</Tooltip>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default LiveMap;