import { useState } from 'react';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import StatsDashboard from './components/StatsDashboard';

function App() {
  // We use this state to trigger re-fetches across components
  // when a new ticket is submitted or a ticket status changes.
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-10 tracking-tight">
          Support Dashboard
        </h1>
        
        <StatsDashboard refreshTrigger={refreshTrigger} />
        
        <TicketForm onTicketCreated={triggerRefresh} />
        
        <TicketList refreshTrigger={refreshTrigger} onTicketUpdated={triggerRefresh} />
      </div>
    </div>
  );
}

export default App;