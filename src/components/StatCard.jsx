import React from 'react';

const StatCard = ({ title, value, color }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color}`}>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
);

export default StatCard;