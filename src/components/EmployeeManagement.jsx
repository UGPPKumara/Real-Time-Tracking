import React from 'react';
import { FiUsers } from 'react-icons/fi';

const EmployeeManagement = ({ employees, onAddEmployee, feedback }) => (
    <div>
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center"><FiUsers /><span className="ml-2">Add New Employee</span></h2>
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

export default EmployeeManagement;