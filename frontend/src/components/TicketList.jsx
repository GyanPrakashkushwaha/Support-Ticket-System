
import { useState, useEffect, useCallback } from 'react';
import api from '../api';

const CATEGORIES = ['', 'billing', 'technical', 'account', 'general'];
const PRIORITIES = ['', 'low', 'medium', 'high', 'critical'];
const STATUSES = ['', 'open', 'in_progress', 'resolved', 'closed'];

export default function TicketList({ refreshTrigger, onTicketUpdated }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('');
    const [status, setStatus] = useState('');

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (category) params.append('category', category);
            if (priority) params.append('priority', priority);
            if (status) params.append('status', status);

            const response = await api.get(`/tickets/?${params.toString()}`);
            setTickets(response.data);
        } catch (error) {
            console.error("Failed to fetch tickets", error);
        } finally {
            setLoading(false);
        }
    }, [search, category, priority, status]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets, refreshTrigger]);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.patch(`/tickets/${id}/`, { status: newStatus });
            onTicketUpdated(); // Trigger a refresh for the stats and list
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update ticket status.");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Tickets</h2>
            
            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <input 
                        type="text" 
                        placeholder="Search title or description..." 
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select className="px-4 py-2 border rounded-lg outline-none" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    {CATEGORIES.filter(c => c).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="px-4 py-2 border rounded-lg outline-none" value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="">All Priorities</option>
                    {PRIORITIES.filter(p => p).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select className="px-4 py-2 border rounded-lg outline-none" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    {STATUSES.filter(s => s).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Ticket List */}
            {loading ? (
                <div className="text-center py-10 text-gray-500 animate-pulse">Loading tickets...</div>
            ) : tickets.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-gray-100 text-gray-500">
                    No tickets found matching your filters.
                </div>
            ) : (
                <div className="space-y-4">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-gray-900">{ticket.title}</h3>
                                <div className="flex gap-2">
                                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                                        {ticket.category}
                                    </span>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${ticket.priority === 'critical' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {ticket.priority}
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-4 text-sm line-clamp-2">{ticket.description}</p>
                            
                            <div className="flex justify-between items-center border-t pt-4 mt-2">
                                <span className="text-xs text-gray-400">
                                    {new Date(ticket.created_at).toLocaleString()}
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600 font-medium">Update Status:</span>
                                    <select 
                                        className={`text-sm px-3 py-1.5 rounded-lg border-none font-medium capitalize ${getStatusColor(ticket.status)} outline-none cursor-pointer`}
                                        value={ticket.status}
                                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                                    >
                                        {STATUSES.filter(s => s).map(s => (
                                            <option key={s} value={s} className="bg-white text-gray-900">{s.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}