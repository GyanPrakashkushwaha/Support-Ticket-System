import { useState } from 'react';
import api from '../api';

const CATEGORIES = ['billing', 'technical', 'account', 'general'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

export default function TicketForm({ onTicketCreated }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('general');
    const [priority, setPriority] = useState('medium');
    
    // Loading states
    const [isClassifying, setIsClassifying] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Trigger LLM classification when the user leaves the description box
    const handleDescriptionBlur = async () => {
        if (!description.trim()) return;

        setIsClassifying(true);
        setError(null);

        try {
            const response = await api.post('/tickets/classify/', { description });
            // The LLM returns suggested_category and suggested_priority
            setCategory(response.data.suggested_category);
            setPriority(response.data.suggested_priority);
        } catch (err) {
            console.error("LLM Classification failed:", err);
            // We fail gracefully. The user can still manually select options.
        } finally {
            setIsClassifying(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await api.post('/tickets/', {
                title,
                description,
                category,
                priority
            });
            
            // Clear the form on success
            setTitle('');
            setDescription('');
            setCategory('general');
            setPriority('medium');
            
            // Notify parent component to refresh the list (if provided)
            if (onTicketCreated) {
                onTicketCreated(response.data);
            }
        } catch (err) {
            setError('Failed to submit ticket. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100 mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Ticket</h2>
            
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        required
                        maxLength={200}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Brief summary of the issue"
                    />
                </div>

                {/* Description */}
                <div>
                    <div className="flex justify-between items-end mb-1">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        {isClassifying && (
                            <span className="text-xs text-blue-600 font-medium flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                AI Classifying...
                            </span>
                        )}
                    </div>
                    <textarea
                        required
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={handleDescriptionBlur}
                        placeholder="Explain the problem in detail... (AI will suggest category & priority when you finish typing)"
                    />
                </div>

                {/* Auto-suggested Dropdowns */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            className={`w-full px-4 py-2 border rounded-lg outline-none transition-colors ${isClassifying ? 'bg-blue-50 border-blue-300' : 'border-gray-300 bg-white'}`}
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                            className={`w-full px-4 py-2 border rounded-lg outline-none transition-colors ${isClassifying ? 'bg-blue-50 border-blue-300' : 'border-gray-300 bg-white'}`}
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            {PRIORITIES.map(pri => (
                                <option key={pri} value={pri}>{pri.charAt(0).toUpperCase() + pri.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || isClassifying}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
            </form>
        </div>
    );
}