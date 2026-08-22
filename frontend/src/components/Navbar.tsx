import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, Trophy, ShieldCheck, User as UserIcon, LogOut, LogIn } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-950 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-md">
      <div className="flex items-center space-x-8">
        <Link to="/" className="flex items-center space-x-2.5 text-sky-400 font-bold text-xl tracking-tight">
          <Code2 className="w-7 h-7 text-sky-400" />
          <span>OnlineJudge</span>
        </Link>
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link to="/problems" className="text-slate-300 hover:text-white transition">
            Problems
          </Link>
          <Link to="/leaderboard" className="text-slate-300 hover:text-white transition flex items-center space-x-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Leaderboard</span>
          </Link>
          {user?.role === 'Admin' && (
            <Link to="/admin" className="text-sky-400 hover:text-sky-300 transition flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Panel</span>
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-300 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
              <UserIcon className="w-4 h-4 text-sky-400" />
              <span className="font-semibold text-white">{user.name}</span>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{user.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 transition p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="text-slate-300 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-900 transition flex items-center space-x-1.5"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
            <Link
              to="/register"
              className="bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm"
            >
              Create Account
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
