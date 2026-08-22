import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CodeEditor } from '../components/CodeEditor';
import { OJGenieTab } from '../components/OJGenieTab';
import { Play, CheckCircle2, XCircle, AlertTriangle, Clock, RefreshCw, History, FileText, Code2, Sparkles } from 'lucide-react';

interface Problem {
  _id: string;
  title: string;
  statement: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  constraints: {
    timeLimitMs: number;
    memoryLimitMb: number;
  };
  sampleInput: string;
  sampleOutput: string;
}

interface SubmissionRecord {
  _id: string;
  userId: string;
  problemId: string;
  language: string;
  sourceCode: string;
  verdict: string;
  executionTimeMs: number;
  memoryUsedKb: number;
  submittedAt: string;
}

export const ProblemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Tab State: 'description' | 'submissions' | 'genie'
  const [activeTab, setActiveTab] = useState<'description' | 'submissions' | 'genie'>('description');
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'cpp' | 'python' | 'java'>('cpp');
  const [sourceCode, setSourceCode] = useState<string>(
    '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    int a, b;\n    if (cin >> a >> b) {\n        cout << (a + b) << endl;\n    }\n    return 0;\n}'
  );
  const [submitting, setSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [verdictData, setVerdictData] = useState<SubmissionRecord | null>(null);
  const [submissionHistory, setSubmissionHistory] = useState<SubmissionRecord[]>([]);
  const [selectedSubmissionCode, setSelectedSubmissionCode] = useState<string | null>(null);

  const starterCodeMap = {
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    int a, b;\n    if (cin >> a >> b) {\n        cout << (a + b) << endl;\n    }\n    return 0;\n}',
    python: '# Write your Python 3 solution here\nimport sys\n\ndef main():\n    lines = sys.stdin.read().split()\n    if lines:\n        a, b = int(lines[0]), int(lines[1])\n        print(a + b)\n\nif __name__ == "__main__":\n    main()',
    java: 'import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int a = sc.nextInt();\n            int b = sc.nextInt();\n            System.out.println(a + b);\n        }\n    }\n}'
  };

  const handleLanguageChange = (lang: 'cpp' | 'python' | 'java') => {
    setLanguage(lang);
    setSourceCode(starterCodeMap[lang]);
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get(`/submissions/problem/${id}`);
      if (response.data.success) {
        setSubmissionHistory(response.data.data);
      }
    } catch (e) {
      console.error('Error fetching history:', e);
    }
  };

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await api.get(`/problems/${id}`);
        if (response.data.success) {
          setProblem(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching problem details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
    fetchHistory();
  }, [id]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (submissionId) {
      intervalId = setInterval(async () => {
        try {
          const response = await api.get(`/submissions/${submissionId}`);
          if (response.data.success) {
            const data = response.data.data;
            setVerdictData(data);
            if (data.verdict !== 'Pending' && data.verdict !== 'Processing') {
              setSubmitting(false);
              fetchHistory();
              clearInterval(intervalId);
            }
          }
        } catch (error) {
          console.error('Error polling verdict:', error);
          setSubmitting(false);
          clearInterval(intervalId);
        }
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [submissionId]);

  const handleSubmit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setVerdictData(null);

    try {
      const response = await api.post('/submissions', {
        problemId: id,
        language,
        sourceCode
      });

      if (response.data.success) {
        setSubmissionId(response.data.data.submissionId);
      }
    } catch (error: any) {
      setSubmitting(false);
      alert(error.response?.data?.error?.message || 'Submission failed');
    }
  };

  const getVerdictBadge = (verdict: string, time: number) => {
    switch (verdict) {
      case 'Accepted':
        return <span className="text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Accepted ({time}ms)</span>;
      case 'Wrong Answer':
        return <span className="text-rose-400 font-semibold flex items-center gap-1"><XCircle className="w-4 h-4" /> Wrong Answer</span>;
      case 'Time Limit Exceeded':
        return <span className="text-amber-400 font-semibold flex items-center gap-1"><Clock className="w-4 h-4" /> Time Limit Exceeded</span>;
      case 'Compilation Error':
        return <span className="text-rose-400 font-semibold flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Compilation Error</span>;
      case 'Runtime Error':
        return <span className="text-rose-400 font-semibold flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Runtime Error</span>;
      default:
        return <span className="text-sky-400 font-semibold animate-pulse">{verdict}...</span>;
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading challenge workspace...</div>;
  }

  if (!problem) {
    return <div className="text-center py-20 text-rose-500">Problem not found.</div>;
  }

  return (
    <div className="flex flex-col justify-between bg-slate-950 min-h-[calc(100vh-65px)]">
      {/* Main Split Layout: Description & Monaco Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 border-b border-slate-800">
        {/* Left Panel: Problem Description, History, and OJ Genie Tab */}
        <div className="flex flex-col border-r border-slate-800 bg-slate-950">
          {/* Navigation Tabs Header */}
          <div className="flex items-center border-b border-slate-800 bg-slate-900/60 px-4 shrink-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab('description')}
              className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition shrink-0 cursor-pointer ${
                activeTab === 'description'
                  ? 'border-sky-500 text-sky-400 bg-slate-900/90'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Description</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('submissions');
                fetchHistory();
              }}
              className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition shrink-0 cursor-pointer ${
                activeTab === 'submissions'
                  ? 'border-sky-500 text-sky-400 bg-slate-900/90'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Submissions ({submissionHistory.length})</span>
            </button>

            {/* 🧞 OJ GENIE TAB (Exclusively available when opening the problem panel!) */}
            <button
              onClick={() => setActiveTab('genie')}
              className={`flex items-center space-x-2 py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition shrink-0 cursor-pointer ${
                activeTab === 'genie'
                  ? 'border-sky-500 text-sky-400 bg-slate-900/90'
                  : 'border-transparent text-sky-400 hover:text-sky-300'
              }`}
            >
              <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
              <span>🧞 OJ Genie</span>
              <span className="bg-sky-500 text-slate-950 text-[9px] px-1.5 py-0.2 rounded font-bold">AI</span>
            </button>
          </div>

          {/* Tab 1: Problem Description */}
          {activeTab === 'description' && (
            <div className="p-6 overflow-y-auto max-h-[520px]">
              <div className="flex items-center space-x-3 mb-4">
                <h1 className="text-2xl font-bold text-white tracking-tight">{problem.title}</h1>
                <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-2.5 py-0.5 rounded-full border border-slate-700">
                  {problem.difficulty}
                </span>
              </div>

              <div className="flex items-center space-x-6 text-xs text-slate-400 mb-6 pb-4 border-b border-slate-800">
                <div>Time Limit: <span className="text-slate-200 font-semibold">{problem.constraints.timeLimitMs} ms</span></div>
                <div>Memory Limit: <span className="text-slate-200 font-semibold">{problem.constraints.memoryLimitMb} MB</span></div>
              </div>

              <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                {problem.statement}
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sample Input</h4>
                  <pre className="bg-slate-950 text-slate-200 p-3 rounded text-xs font-mono">{problem.sampleInput}</pre>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sample Output</h4>
                  <pre className="bg-slate-950 text-slate-200 p-3 rounded text-xs font-mono">{problem.sampleOutput}</pre>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Submission History Table */}
          {activeTab === 'submissions' && (
            <div className="p-6 overflow-y-auto max-h-[520px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Your Past Submissions</h2>
                <button
                  onClick={fetchHistory}
                  className="text-xs text-sky-400 hover:text-sky-300 flex items-center space-x-1 font-semibold cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>

              {submissionHistory.length === 0 ? (
                <div className="text-center py-16 text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800/80">
                  <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">No submissions yet for this problem.</p>
                  <p className="text-xs text-slate-500 mt-1">Submit your code using the editor on the right to see your verdict logs.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissionHistory.map((sub, idx) => (
                    <div
                      key={sub._id || idx}
                      className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col gap-2 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm">{getVerdictBadge(sub.verdict, sub.executionTimeMs)}</div>
                        <span className="text-xs text-slate-500">{new Date(sub.submittedAt).toLocaleTimeString()}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                        <span className="uppercase font-mono font-semibold bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                          {sub.language}
                        </span>
                        <span>Memory: {sub.memoryUsedKb || 3420} KB</span>
                        <button
                          onClick={() => setSelectedSubmissionCode(sub.sourceCode)}
                          className="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
                        >
                          View Code
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Code Preview Modal */}
              {selectedSubmissionCode && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-sky-400" />
                        <span>Submitted Solution Source</span>
                      </h3>
                      <button
                        onClick={() => setSelectedSubmissionCode(null)}
                        className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                    <pre className="p-6 text-xs font-mono text-slate-200 bg-slate-950 overflow-x-auto max-h-96">
                      {selectedSubmissionCode}
                    </pre>
                    <div className="p-4 bg-slate-900 border-t border-slate-800 text-right">
                      <button
                        onClick={() => setSelectedSubmissionCode(null)}
                        className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: 🧞 OJ Genie AI Mentor Tab */}
          {activeTab === 'genie' && (
            <OJGenieTab
              problemId={problem._id}
              problemTitle={problem.title}
              problemStatement={problem.statement}
              sourceCode={sourceCode}
              language={language}
              verdict={verdictData?.verdict}
              executionTimeMs={verdictData?.executionTimeMs}
            />
          )}
        </div>

        {/* Right Panel: Code Editor Canvas & Action Bar */}
        <div className="flex flex-col p-4 bg-slate-900">
          <div className="w-full">
            <CodeEditor
              language={language}
              value={sourceCode}
              onChange={(val) => setSourceCode(val || '')}
              onLanguageChange={handleLanguageChange}
            />
          </div>

          {/* Action Controls Bar */}
          <div className="pt-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {verdictData && (
                <div className="flex items-center space-x-2 text-sm">
                  {getVerdictBadge(verdictData.verdict, verdictData.executionTimeMs)}
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg transition flex items-center space-x-2 shadow-sm cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Submit Solution</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
