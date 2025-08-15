import React, { useState } from 'react';
import { Spinner } from './Spinner';

const VisitModal = ({ isOpen, onClose, onSubmit, loading }) => {
    const [customerName, setCustomerName] = useState('');
    const [visitNotes, setVisitNotes] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ customerName, visitNotes });
        setCustomerName('');
        setVisitNotes('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Start New Visit</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="customerName" className="block text-gray-700 font-semibold mb-2">Customer Name</label>
                        <input
                            id="customerName"
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="visitNotes" className="block text-gray-700 font-semibold mb-2">Visit Notes</label>
                        <textarea
                            id="visitNotes"
                            value={visitNotes}
                            onChange={(e) => setVisitNotes(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="4"
                            placeholder="Add any notes about the visit..."
                        ></textarea>
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center" disabled={loading}>
                            {loading ? <Spinner /> : 'Start Tracking'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VisitModal;