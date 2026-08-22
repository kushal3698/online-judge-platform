import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Shield, Zap, Award, ArrowRight, Code } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-65px)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="inline-flex items-center space-x-2 bg-sky-950/60 border border-sky-800/50 text-sky-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Terminal className="w-3.5 h-3.5" />
          <span>Production-Oriented Code Execution Engine</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl leading-tight mb-6">
          Master Algorithms on a <span className="text-sky-400">Hardened Online Judge</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mb-10 leading-relaxed">
          Write solutions in C++, Python, and Java. Get instant, reliable verdicts evaluated asynchronously inside isolated, resource-constrained Docker sandboxes.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/problems"
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-6 py-3.5 rounded-xl transition flex items-center space-x-2 shadow-lg shadow-sky-950"
          >
            <span>Browse Problem Set</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/leaderboard"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-6 py-3.5 rounded-xl border border-slate-700 transition"
          >
            View Global Rankings
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
          <div className="w-12 h-12 bg-sky-950 border border-sky-800/50 text-sky-400 rounded-xl flex items-center justify-center mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Asynchronous Queues</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            High-throughput job distribution powered by Redis and BullMQ, preventing HTTP timeouts during peak submission bursts.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
          <div className="w-12 h-12 bg-emerald-950 border border-emerald-800/50 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Docker Sandboxing</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            OS-level isolation with Linux cgroups v2 resource limits, custom seccomp filters, non-root execution, and unlinked networking.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
          <div className="w-12 h-12 bg-purple-950 border border-purple-800/50 text-purple-400 rounded-xl flex items-center justify-center mb-4">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Instant Verdicts</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Accurate multi-testcase evaluation with standard verdicts: Accepted, Wrong Answer, TLE, MLE, Runtime Error, and Compilation Error.
          </p>
        </div>
      </section>
    </div>
  );
};
