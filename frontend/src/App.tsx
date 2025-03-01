import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Settings } from 'lucide-react';
import AgentDashboard from './components/AgentDashboard';
import AgentChat from './pages/AgentChat';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Router>
      <div className="h-screen flex">
        <Sidebar />
        <div className="flex-1 flex flex-col bg-[#1a1a1a]">
          <header className="flex-none bg-[#1a1a1a]">
            <div className="px-4 py-3">
              <div className="flex justify-end items-center">
                <button className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors">
                  <Settings size={20} />
                </button>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<AgentDashboard />} />
              <Route path="/chat" element={<AgentChat />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;