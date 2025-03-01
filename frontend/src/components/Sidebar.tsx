import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: MessageSquare, label: 'Agent Chat', path: '/chat' }
  ];

  return (
    <div className="w-64 flex-none bg-neutral-900 border-r border-neutral-800">
      <div className="p-6">
        <h1 className="text-2xl font-bold title-gradient">Agent Platform</h1>
      </div>
      <nav className="mt-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 text-neutral-300 hover:bg-neutral-800 transition-colors ${
                isActive ? 'bg-neutral-800 text-white' : ''
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar; 