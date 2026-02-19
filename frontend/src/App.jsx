import TicketForm from './components/TicketForm';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-10 tracking-tight">
          Support Dashboard
        </h1>
        
        {/* We will add the Ticket List and Stats components here later! */}
        <TicketForm onTicketCreated={(newTicket) => console.log("Created!", newTicket)} />
        
      </div>
    </div>
  );
}

export default App;