import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db, appId } from '../firebase/config';
import { Spinner } from './Spinner';

const Reports = () => {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredVisits, setFilteredVisits] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const fetchVisitsAndEmployees = async () => {
            setLoading(true);
            // Fetch all visits
            const visitsQuery = query(collection(db, `artifacts/${appId}/public/data/visits`), orderBy('checkInTime', 'desc'));
            const visitsSnapshot = await getDocs(visitsQuery);
            const visitsData = visitsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                checkInTime: doc.data().checkInTime.toDate(),
                checkOutTime: doc.data().checkOutTime ? doc.data().checkOutTime.toDate() : null
            }));
            setVisits(visitsData);
            setFilteredVisits(visitsData);

            // Fetch employees for the filter dropdown
            const uniqueEmployees = [...new Map(visitsData.map(v => [v.employeeId, {id: v.employeeId, name: v.employeeName}])).values()];
            setEmployees(uniqueEmployees);

            setLoading(false);
        };

        fetchVisitsAndEmployees();
    }, []);

    const handleFilter = () => {
        let data = [...visits];

        if (selectedEmployee) {
            data = data.filter(v => v.employeeId === selectedEmployee);
        }

        if (startDate) {
            data = data.filter(v => v.checkInTime >= new Date(startDate));
        }
        
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // Include the whole day
            data = data.filter(v => v.checkInTime <= end);
        }

        setFilteredVisits(data);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Visit Reports</h2>
            
            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 border rounded-lg bg-gray-50">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                    <select onChange={(e) => setSelectedEmployee(e.target.value)} value={selectedEmployee} className="w-full p-2 border rounded-md">
                        <option value="">All Employees</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" onChange={(e) => setStartDate(e.target.value)} value={startDate} className="w-full p-2 border rounded-md"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" onChange={(e) => setEndDate(e.target.value)} value={endDate} className="w-full p-2 border rounded-md"/>
                </div>
                <div className="self-end">
                     <button onClick={handleFilter} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Apply Filter</button>
                </div>
            </div>

            {/* Reports Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredVisits.map(visit => (
                            <tr key={visit.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{visit.employeeName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{visit.customerName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{visit.checkInTime.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{visit.checkOutTime ? visit.checkOutTime.toLocaleString() : 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        visit.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {visit.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredVisits.length === 0 && <p className="text-center text-gray-500 py-8">No visits found for the selected criteria.</p>}
            </div>
        </div>
    );
};

export default Reports;