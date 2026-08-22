import React, { useState } from 'react';
import api from '../services/api';
import { Sparkles, HelpCircle, Bug, Swords, Flame, Stethoscope, Send, ChevronDown, ChevronUp, Bot, ArrowRight } from 'lucide-react';

interface OJGeniePanelProps {
  problemId: string;
  problemTitle: string;
  problemStatement: string;
  sourceCode: string;
  language: string;
  verdict?: string;
  executionTimeMs?: number;
}

export const OJGeniePanel: React.FC<OJGeniePanelProps> = ({
  problemId,
  problemTitle,
  problemStatement,
  sourceCode,
  language,
  verdict,
  executionTimeMs
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFeature, setActiveFeature] = useState<'chat' | 'hint' | 'autopsy' | 'break_my_code' | 'bug_detective' | 'code_duel'>('chat');
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'genie'; message: string }>>([
    {
      sender: 'genie',
      message: `🧞 **Hello! I'm OJ Genie**, your personalized coding mentor.\n\nI can provide **progressive hints**, diagnose why a submission is failing, find **edge-case bugs**, or generate **adversarial testcases** to break your code.`
    }
  ]);

  // Hint State
  const [hintLevel, setHintLevel] = useState(1);
  const [currentHint, setCurrentHint] = useState<any>(null);

  // Result States
  const [autopsyData, setAutopsyData] = useState<any>(null);
  const [breakCodeData, setBreakCodeData] = useState<any>(null);
  const [bugData, setBugData] = useState<any>(null);
  const [duelData, setDuelData] = useState<any>(null);

  const requestGenie = async (mode: string, extra: any = {}) => {
    setLoading(true);
    try {
      const response = await api.post('/genie/mentor', {
        problemId,
        problemTitle,
        problemStatement,
        sourceCode,
        language,
        verdict,
        executionTimeMs,
        mode,
        ...extra
      });

      if (response.data.success) {
        return response.data.data;
      }
    } catch (err) {
      console.error('Genie API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatInput('');
    setChatHistory((prev) => [...prev, { sender: 'user', message: userText }]);

    const res = await requestGenie('chat', { userMessage: userText });
    if (res?.reply) {
      setChatHistory((prev) => [...prev, { sender: 'genie', message: res.reply }]);
    }
  };

  const handleFetchHint = async (level: number) => {
    setHintLevel(level);
    const data = await requestGenie('hint', { hintLevel: level });
    if (data) setCurrentHint(data);
  };

  const handleFetchAutopsy = async () => {
    const data = await requestGenie('autopsy');
    if (data) setAutopsyData(data);
  };

  const handleFetchBreakCode = async () => {
    const data = await requestGenie('break_my_code');
    if (data) setBreakCodeData(data);
  };

  const handleFetchBugDetective = async () => {
    const data = await requestGenie('bug_detective');
    if (data) setBugData(data);
  };

  const handleFetchCodeDuel = async () => {
    const data = await requestGenie('code_duel');
    if (data) setDuelData(data);
  };

  return (
    <div className="bg-slate-950 border-t border-slate-800 transition-all duration-300">
      {/* Genie Collapsible Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-6 py-3 bg-gradient-to-r from-sky-950/90 via-slate-900 to-indigo-950/90 flex items-center justify-between cursor-pointer border-b border-slate-800 hover:bg-slate-900 transition"
      >
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-lg bg-sky-600/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              🧞 OJ Genie <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-800/80 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">AI Coding Mentor</span>
            </span>
            <p className="text-xs text-slate-400 hidden sm:block">Context-aware algorithmic advisor observing your current workspace</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-xs text-slate-400 font-medium">
            {isExpanded ? 'Collapse Genie' : 'Open Mentor'}
          </span>
          {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Expanded Genie Main Workspace */}
      {isExpanded && (
        <div className="p-6 bg-slate-950 max-h-[420px] overflow-y-auto flex flex-col md:flex-row gap-6">
          {/* Left Action Menu */}
          <div className="w-full md:w-56 flex flex-row md:flex-col gap-2 shrink-0 overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => setActiveFeature('chat')}
              className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left ${
                activeFeature === 'chat' ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Bot className="w-4 h-4 shrink-0" />
              <span>Ask Genie</span>
            </button>

            <button
              onClick={() => {
                setActiveFeature('hint');
                handleFetchHint(1);
              }}
              className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left ${
                activeFeature === 'hint' ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Adaptive Hints</span>
            </button>

            <button
              onClick={() => {
                setActiveFeature('autopsy');
                handleFetchAutopsy();
              }}
              className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left ${
                activeFeature === 'autopsy' ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Stethoscope className="w-4 h-4 shrink-0" />
              <span>Submission Autopsy</span>
            </button>

            <button
              onClick={() => {
                setActiveFeature('bug_detective');
                handleFetchBugDetective();
              }}
              className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left ${
                activeFeature === 'bug_detective' ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Bug className="w-4 h-4 shrink-0" />
              <span>Bug Detective</span>
            </button>

            <button
              onClick={() => {
                setActiveFeature('break_my_code');
                handleFetchBreakCode();
              }}
              className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left ${
                activeFeature === 'break_my_code' ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Flame className="w-4 h-4 shrink-0" />
              <span>Break My Code</span>
            </button>

            <button
              onClick={() => {
                setActiveFeature('code_duel');
                handleFetchCodeDuel();
              }}
              className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left ${
                activeFeature === 'code_duel' ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Swords className="w-4 h-4 shrink-0" />
              <span>Code Duel</span>
            </button>
          </div>

          {/* Right Feature Panel */}
          <div className="flex-1 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 overflow-y-auto">
            {/* Feature 1: Chat */}
            {activeFeature === 'chat' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 space-y-3 overflow-y-auto pr-2 max-h-56 mb-4">
                  {chatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-sky-600 text-white ml-auto max-w-[80%]'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 mr-auto max-w-[90%] whitespace-pre-wrap'
                      }`}
                    >
                      {msg.message}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask Genie (e.g. 'Why is my solution getting TLE?')..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            )}

            {/* Feature 2: Progressive Hints */}
            {activeFeature === 'hint' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-sky-400" />
                    <span>Adaptive Progressive Hint System</span>
                  </h3>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => handleFetchHint(lvl)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${
                          hintLevel === lvl
                            ? 'bg-sky-600 text-white border-sky-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        Hint {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {currentHint ? (
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                    <h4 className="text-xs font-bold text-sky-400 mb-2">{currentHint.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{currentHint.hint}</p>
                    {currentHint.nextLevel && (
                      <button
                        onClick={() => handleFetchHint(currentHint.nextLevel)}
                        className="mt-3 text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                      >
                        <span>Need a stronger hint? Unlock Hint {currentHint.nextLevel}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 py-6 text-center">Loading progressive hint...</div>
                )}
              </div>
            )}

            {/* Feature 3: Submission Autopsy */}
            {activeFeature === 'autopsy' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-rose-400" />
                    <span>Submission Autopsy & Root-Cause Diagnosis</span>
                  </h3>
                </div>

                {autopsyData ? (
                  <div className="space-y-3 text-xs">
                    <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Diagnosed Category</span>
                        <span className="text-white font-semibold">{autopsyData.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Confidence</span>
                        <span className="text-emerald-400 font-bold">{autopsyData.likelyCauseScore}%</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Detected Flaw</span>
                      <p className="text-slate-300 leading-relaxed">{autopsyData.detectedIssue}</p>
                      <div className="pt-2 border-t border-slate-900 text-sky-400 font-medium">
                        💡 Advice: {autopsyData.actionableAdvice}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 py-6 text-center">Generating submission autopsy...</div>
                )}
              </div>
            )}

            {/* Feature 4: Bug Detective */}
            {activeFeature === 'bug_detective' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Bug className="w-4 h-4 text-amber-400" />
                    <span>AI Bug Detective & Code Flaw Scanner</span>
                  </h3>
                </div>

                {bugData ? (
                  <div className="space-y-3 text-xs">
                    {bugData.analysis.map((b: any, idx: number) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-400">{b.type}</span>
                          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">{b.location}</span>
                        </div>
                        <p className="text-slate-300">{b.explanation}</p>
                        {b.fix && <div className="text-emerald-400 font-semibold pt-1">Fix: {b.fix}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 py-6 text-center">Inspecting code syntax and logic...</div>
                )}
              </div>
            )}

            {/* Feature 5: Break My Code */}
            {activeFeature === 'break_my_code' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-500" />
                    <span>AI Adversarial Attack Generator (Break My Code)</span>
                  </h3>
                </div>

                {breakCodeData ? (
                  <div className="space-y-3 text-xs">
                    <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2">
                      <span className="font-bold text-rose-400">{breakCodeData.attackTitle}</span>
                      <p className="text-slate-300">{breakCodeData.vulnerabilityAnalysis}</p>
                      <div className="bg-slate-900 p-2.5 rounded font-mono text-[11px] text-slate-300 border border-slate-800">
                        {breakCodeData.attackPayload.targetCharacteristics}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 py-6 text-center">Crafting adversarial counter-examples...</div>
                )}
              </div>
            )}

            {/* Feature 6: Code Duel */}
            {activeFeature === 'code_duel' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Swords className="w-4 h-4 text-purple-400" />
                    <span>Code Duel: Your Implementation vs. Optimal Approach</span>
                  </h3>
                </div>

                {duelData ? (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Your Approach</span>
                        <span className="text-rose-400 font-bold text-sm block mt-1">{duelData.yourCodeMetrics.estimatedComplexity}</span>
                        <span className="text-slate-400 text-[10px]">{duelData.yourCodeMetrics.memoryProfile}</span>
                      </div>
                      <div className="bg-slate-950 border border-sky-800/60 p-3 rounded-xl">
                        <span className="text-sky-400 block text-[10px] uppercase font-bold">Optimal Target</span>
                        <span className="text-emerald-400 font-bold text-sm block mt-1">{duelData.optimalGenieMetrics.complexity}</span>
                        <span className="text-slate-400 text-[10px]">{duelData.optimalGenieMetrics.memoryProfile}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-slate-300 leading-relaxed">
                      {duelData.architecturalInsight}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 py-6 text-center">Simulating comparative code duel...</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
