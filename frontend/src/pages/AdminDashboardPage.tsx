import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Shield, PlusCircle, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Problem creation form state
  const [title, setTitle] = useState('');
  const [statement, setStatement] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [timeLimitMs, setTimeLimitMs] = useState(1000);
  const [memoryLimitMb, setMemoryLimitMb] = useState(256);
  const [sampleInput, setSampleInput] = useState('');
  const [sampleOutput, setSampleOutput] = useState('');

  // Testcase upload state
  const [createdProblemId, setCreatedProblemId] = useState<string | null>(null);
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [isHidden, setIsHidden] = useState(true);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  if (user?.role !== 'Admin') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-slate-950 border border-slate-800 rounded-2xl text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400 text-sm">Administrator privileges are required to access this dashboard.</p>
      </div>
    );
  }

  const handleCreateProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await api.post('/problems', {
        title,
        statement,
        difficulty,
        constraints: {
          timeLimitMs,
          memoryLimitMb
        },
        sampleInput,
        sampleOutput
      });

      if (response.data.success) {
        const problemId = response.data.data._id;
        setCreatedProblemId(problemId);
        setMessage({
          type: 'success',
          text: `Problem "${title}" created successfully! You can now add hidden evaluation testcases below.`
        });
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.error?.message || 'Failed to create problem.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdProblemId) return;

    setLoading(true);
    try {
      const response = await api.post('/testcases', {
        problemId: createdProblemId,
        input: testInput,
        expectedOutput: testOutput,
        isHidden
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Test case uploaded successfully!' });
        setTestInput('');
        setTestOutput('');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error?.message || 'Failed to add testcase.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-sky-950 text-sky-400 border border-sky-800/50 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Management Panel</h1>
          <p className="text-slate-400 text-sm">Author algorithmic challenges and manage hidden test suites.</p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl mb-8 flex items-center space-x-2 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
              : 'bg-rose-950/60 border border-rose-800 text-rose-300'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* 1. Create Problem Section */}
      <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl mb-8 shadow-sm">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
          <PlusCircle className="w-5 h-5 text-sky-400" />
          <span>Step 1: Create New Problem</span>
        </h2>

        <form onSubmit={handleCreateProblem} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Problem Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Reverse Linked List"
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Problem Statement (Markdown / Plain Text)
            </label>
            <textarea
              required
              rows={5}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Describe the problem, input format, output format, and constraints..."
              className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-sm rounded-lg p-3.5 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Time Limit (ms)
              </label>
              <input
                type="number"
                value={timeLimitMs}
                onChange={(e) => setTimeLimitMs(parseInt(e.target.value, 10))}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Memory Limit (MB)
              </label>
              <input
                type="number"
                value={memoryLimitMb}
                onChange={(e) => setMemoryLimitMb(parseInt(e.target.value, 10))}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Sample Input
              </label>
              <textarea
                required
                rows={3}
                value={sampleInput}
                onChange={(e) => setSampleInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-sm rounded-lg p-3 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Sample Output
              </label>
              <textarea
                required
                rows={3}
                value={sampleOutput}
                onChange={(e) => setSampleOutput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-sm rounded-lg p-3 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-6 py-2.5 rounded-lg transition"
          >
            Create Problem
          </button>
        </form>
      </div>

      {/* 2. Upload Hidden Testcases Section */}
      {createdProblemId && (
        <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl shadow-sm animate-fadeIn">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <span>Step 2: Upload Hidden Evaluation Test Cases</span>
          </h2>

          <form onSubmit={handleAddTestCase} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Testcase Input
                </label>
                <textarea
                  required
                  rows={4}
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Raw stdin input data..."
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-sm rounded-lg p-3 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Expected Output
                </label>
                <textarea
                  required
                  rows={4}
                  value={testOutput}
                  onChange={(e) => setTestOutput(e.target.value)}
                  placeholder="Exact expected stdout..."
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-sm rounded-lg p-3 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 py-2">
              <input
                type="checkbox"
                id="isHidden"
                checked={isHidden}
                onChange={(e) => setIsHidden(e.target.checked)}
                className="w-4 h-4 text-sky-600 bg-slate-900 border-slate-800 rounded focus:ring-sky-500"
              />
              <label htmlFor="isHidden" className="text-sm text-slate-300">
                Mark as Hidden Test Case (Concealed from solvers during evaluation)
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-lg transition"
            >
              Upload Test Case
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
