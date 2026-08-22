import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  problemsSolved: number;
  totalSubmissions: number;
  accuracy: number;
}

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get('/leaderboard');
        if (response.data.success) {
          setLeaderboard(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-amber-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-slate-500 font-bold text-sm w-5 text-center">{rank}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-950/60 border border-amber-800/50 text-amber-400 rounded-2xl mb-3">
          <Trophy className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Global Leaderboard</h1>
        <p className="text-slate-400 text-sm mt-1">Top algorithmic problem solvers ranked by solved challenges and accuracy.</p>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th className="py-4 px-6 text-center w-16">Rank</th>
              <th className="py-4 px-6">Coder</th>
              <th className="py-4 px-6 text-center">Problems Solved</th>
              <th className="py-4 px-6 text-center">Total Submissions</th>
              <th className="py-4 px-6 text-right">Accuracy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-500">
                  Calculating rankings...
                </td>
              </tr>
            ) : leaderboard.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-500">
                  No submissions recorded yet. Be the first to solve a problem!
                </td>
              </tr>
            ) : (
              leaderboard.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-4 px-6 text-center">
                    <div className="flex justify-center">{getRankBadge(entry.rank)}</div>
                  </td>
                  <td className="py-4 px-6 font-semibold text-white">{entry.name}</td>
                  <td className="py-4 px-6 text-center text-emerald-400 font-bold">{entry.problemsSolved}</td>
                  <td className="py-4 px-6 text-center text-slate-400">{entry.totalSubmissions}</td>
                  <td className="py-4 px-6 text-right font-mono text-sky-400 font-semibold">{entry.accuracy}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
