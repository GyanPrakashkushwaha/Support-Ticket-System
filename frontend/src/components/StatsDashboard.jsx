

import { useState, useEffect } from 'react';
import api from '../api';

export default function StatsDashboard({ refreshTrigger }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/tickets/stats/');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [refreshTrigger]);

    if (loading) {
        return <div className="h-32 bg-gray-200 animate-pulse rounded-xl mt-8"></div>;
    }

    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <span className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Total Tickets</span>
                <span className="text-4xl font-extrabold text-gray-900">{stats.total_tickets}</span>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <span className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Open Tickets</span>
                <span className="text-4xl font-extrabold text-blue-600">{stats.open_tickets}</span>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <span className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">Avg Tickets / Day</span>
                <span className="text-4xl font-extrabold text-green-600">{stats.avg_tickets_per_day}</span>
            </div>

            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-700 font-bold mb-4">Tickets by Priority</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(stats.priority_breakdown).map(([priority, count]) => (
                            <div key={priority} className="flex justify-between items-center border-b pb-2">
                                <span className="capitalize text-gray-600">{priority}</span>
                                <span className="font-semibold">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-700 font-bold mb-4">Tickets by Category</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(stats.category_breakdown).map(([category, count]) => (
                            <div key={category} className="flex justify-between items-center border-b pb-2">
                                <span className="capitalize text-gray-600">{category}</span>
                                <span className="font-semibold">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}