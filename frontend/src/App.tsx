import AgentDashboard from './components/AgentDashboard';

function App() {
  return (
    <div className="min-h-screen w-full">
      <header className="w-full border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold title-gradient">
              Agent Platform
            </h1>
            <div className="flex gap-4">
              <button className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-200 border border-neutral-700 hover:bg-neutral-700 transition-colors">
                + Add Agent
              </button>
              <button className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-200 border border-neutral-700 hover:bg-neutral-700 transition-colors">
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="w-full">
        <AgentDashboard />
      </main>
    </div>
  );
}

export default App;