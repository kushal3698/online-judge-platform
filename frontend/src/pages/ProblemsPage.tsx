import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Filter, CheckCircle2, Clock } from 'lucide-react';

interface Problem {
  _id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  constraints: {
    timeLimitMs: number;
    memoryLimitMb: number;
  };
}

export const ProblemsPage: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const response = await api.get('/problems', {
        params: {
          search: search || undefined,
          difficulty: difficulty || undefined
        }
      });
      if (response.data.success) {
        setProblems(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch problems:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [difficulty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProblems();
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Easy</span>;
      case 'Medium':
        return <span className="bg-amber-950 text-amber-400 border border-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Medium</span>;
      case 'Hard':
        return <span className="bg-rose-950 text-rose-400 border border-rose-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Hard</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Problem Set</h1>
          <p className="text-slate-400 text-sm mt-1">Select a challenge to solve and submit your algorithmic code.</p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-sky-500 w-60"
            />
          </form>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Problems Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th className="py-3.5 px-6">Title</th>
              <th className="py-3.5 px-6">Difficulty</th>
              <th className="py-3.5 px-6">Time Limit</th>
              <th className="py-3.5 px-6">Memory Limit</th>
              <th className="py-3.5 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-500">
                  Loading problems catalog...
                </td>
              </tr>
            ) : problems.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-500">
                  No problems match your query.
                </td>
              </tr>
            ) : (
              problems.map((problem) => (
                <tr key={problem._id} className="hover:bg-slate-900/40 transition">
                  <td className="py-4 px-6 font-medium text-white">
                    <Link to={`/problem/${problem._id}`} className="hover:text-sky-400 transition">
                      {problem.title}
                    </Link>
                  </td>
                  <td className="py-4 px-6">{getDifficultyBadge(problem.difficulty)}</td>
                  <td className="py-4 px-6 text-slate-400">{problem.constraints.timeLimitMs} ms</td>
                  <td className="py-4 px-6 text-slate-400">{problem.constraints.memoryLimitMb} MB</td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      to={`/problem/${problem._id}`}
                      className="bg-sky-600/20 hover:bg-sky-600 text-sky-400 hover:text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-sky-800/50 transition inline-block"
                    >
                      Solve
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
