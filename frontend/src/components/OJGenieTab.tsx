import React, { useState } from 'react';
import api from '../services/api';
import { Sparkles, HelpCircle, Bug, Swords, Flame, Stethoscope, Send, Bot, ArrowRight } from 'lucide-react';

interface OJGenieTabProps {
  problemId: string;
  problemTitle: string;
  problemStatement: string;
  sourceCode: string;
  language: string;
  verdict?: string;
  executionTimeMs?: number;
}

export const OJGenieTab: React.FC<OJGenieTabProps> = ({
  problemId,
  problemTitle,
  problemStatement,
  sourceCode,
  language,
  verdict,
  executionTimeMs
}) => {
  const [activeFeature, setActiveFeature] = useState<'chat' | 'hint' | 'autopsy' | 'break_my_code' | 'bug_detective' | 'code_duel'>('chat');
  const [loading, setLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'genie'; message: string }>>([
    {
      sender: 'genie',
      message: `🧞 **Hello! I'm OJ Genie**, your personalized coding mentor for **${problemTitle}**.\n\nAsk me for a **code breakdown**, progressive hints, or edge-case diagnostics!`
    }
  ]);

  // Data states
  const [hintLevel, setHintLevel] = useState(1);
  const [currentHint, setCurrentHint] = useState<any>(null);
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

  const handleSendMessage = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = customQuery || chatInput;
    if (!query.trim()) return;

    setChatInput('');
    setChatHistory((prev) => [...prev, { sender: 'user', message: query }]);
    setLoading(true);

    const res = await requestGenie('chat', { userMessage: query });
    if (res?.reply) {
      setChatHistory((prev) => [...prev, { sender: 'genie', message: res.reply }]);
    }
    setLoading(false);
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
    <div className="flex flex-col h-full bg-slate-950 p-5 space-y-4 overflow-y-auto max-h-[520px]">
      {/* Sub-Tabs for Genie Modules */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
        <button
          onClick={() => setActiveFeature('chat')}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeFeature === 'chat' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Ask Genie</span>
        </button>

        <button
          onClick={() => {
            setActiveFeature('hint');
            handleFetchHint(1);
          }}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeFeature === 'hint' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Adaptive Hints</span>
        </button>

        <button
          onClick={() => {
            setActiveFeature('autopsy');
            handleFetchAutopsy();
          }}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeFeature === 'autopsy' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Autopsy</span>
        </button>

        <button
          onClick={() => {
            setActiveFeature('bug_detective');
            handleFetchBugDetective();
          }}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeFeature === 'bug_detective' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Bug className="w-3.5 h-3.5" />
          <span>Bug Detective</span>
        </button>

        <button
          onClick={() => {
            setActiveFeature('break_my_code');
            handleFetchBreakCode();
          }}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeFeature === 'break_my_code' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Break Code</span>
        </button>

        <button
          onClick={() => {
            setActiveFeature('code_duel');
            handleFetchCodeDuel();
          }}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
            activeFeature === 'code_duel' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Code Duel</span>
        </button>
      </div>

      {/* Feature 1: Chat Tab */}
      {activeFeature === 'chat' && (
        <div className="flex flex-col space-y-3">
          {/* Quick Action Chips */}
          <div className="flex flex-wrap gap-2 pb-2">
            <button
              onClick={() => handleSendMessage(undefined, 'Give me a code breakdown')}
              className="text-[11px] bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 px-3 py-1.5 rounded-full transition cursor-pointer"
            >
              🔍 Code Breakdown
            </button>
            <button
              onClick={() => handleSendMessage(undefined, 'Why would nested loops get TLE?')}
              className="text-[11px] bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 px-3 py-1.5 rounded-full transition cursor-pointer"
            >
              ⚡ Why TLE?
            </button>
            <button
              onClick={() => handleSendMessage(undefined, 'What edge cases should I test?')}
              className="text-[11px] bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 px-3 py-1.5 rounded-full transition cursor-pointer"
            >
              🧪 Edge Cases
            </button>
            <button
              onClick={() => handleSendMessage(undefined, 'Give me a hint without giving the answer')}
              className="text-[11px] bg-slate-900 hover:bg-slate-800 text-purple-400 border border-slate-800 px-3 py-1.5 rounded-full transition cursor-pointer"
            >
              💡 Give Hint
            </button>
          </div>

          {/* Chat Messages */}
          <div className="space-y-3 overflow-y-auto max-h-[280px] pr-2">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white ml-auto max-w-[85%]'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 mr-auto max-w-[95%] whitespace-pre-wrap font-sans'
                }`}
              >
                {msg.message}
              </div>
            ))}
            {loading && (
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-sky-400 animate-pulse w-48">
                🧞 Genie is analyzing...
              </div>
            )}
          </div>

          {/* Input Field */}
          <form onSubmit={(e) => handleSendMessage(e)} className="flex gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              placeholder="Ask Genie (e.g. 'code break down', 'edge cases', 'hints')..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* Feature 2: Progressive Hints */}
      {activeFeature === 'hint' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-bold text-white">Select Hint Progression:</span>
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
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
              <h4 className="font-bold text-sky-400">{currentHint.title}</h4>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{currentHint.hint}</p>
              {currentHint.nextLevel && (
                <button
                  onClick={() => handleFetchHint(currentHint.nextLevel)}
                  className="mt-2 text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                >
                  <span>Unlock Hint {currentHint.nextLevel}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">Loading progressive hint...</div>
          )}
        </div>
      )}

      {/* Feature 3: Autopsy */}
      {activeFeature === 'autopsy' && (
        <div className="space-y-3 text-xs">
          {autopsyData ? (
            <>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Diagnosed Category</span>
                  <span className="text-white font-semibold text-sm">{autopsyData.category}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Confidence</span>
                  <span className="text-emerald-400 font-bold text-sm">{autopsyData.likelyCauseScore}%</span>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Detected Issue</span>
                <p className="text-slate-300">{autopsyData.detectedIssue}</p>
                <div className="pt-2 border-t border-slate-800 text-sky-400 font-medium">
                  💡 Advice: {autopsyData.actionableAdvice}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-500">Generating submission autopsy...</div>
          )}
        </div>
      )}

      {/* Feature 4: Bug Detective */}
      {activeFeature === 'bug_detective' && (
        <div className="space-y-3 text-xs">
          {bugData ? (
            bugData.analysis?.map((b: any, idx: number) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400">{b.type}</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">{b.location}</span>
                </div>
                <p className="text-slate-300">{b.explanation}</p>
                {b.fix && <div className="text-emerald-400 font-semibold pt-1">Fix: {b.fix}</div>}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">Scanning for off-by-one and syntax bugs...</div>
          )}
        </div>
      )}

      {/* Feature 5: Break My Code */}
      {activeFeature === 'break_my_code' && (
        <div className="space-y-3 text-xs">
          {breakCodeData ? (
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="font-bold text-rose-400">{breakCodeData.attackTitle}</span>
              <p className="text-slate-300">{breakCodeData.vulnerabilityAnalysis}</p>
              <div className="bg-slate-950 p-3 rounded font-mono text-[11px] text-slate-300 border border-slate-800">
                {breakCodeData.attackPayload?.targetCharacteristics}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">Crafting adversarial counter-examples...</div>
          )}
        </div>
      )}

      {/* Feature 6: Code Duel */}
      {activeFeature === 'code_duel' && (
        <div className="space-y-3 text-xs">
          {duelData ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Your Approach</span>
                  <span className="text-rose-400 font-bold text-sm block mt-1">{duelData.yourCodeMetrics?.estimatedComplexity}</span>
                  <span className="text-slate-400 text-[10px]">{duelData.yourCodeMetrics?.memoryProfile}</span>
                </div>
                <div className="bg-slate-900 border border-sky-800/60 p-3.5 rounded-xl">
                  <span className="text-sky-400 block text-[10px] uppercase font-bold">Optimal Target</span>
                  <span className="text-emerald-400 font-bold text-sm block mt-1">{duelData.optimalGenieMetrics?.complexity}</span>
                  <span className="text-slate-400 text-[10px]">{duelData.optimalGenieMetrics?.memoryProfile}</span>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-slate-300 leading-relaxed">
                {duelData.architecturalInsight}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-500">Simulating comparative code duel...</div>
          )}
        </div>
      )}
    </div>
  );
};
