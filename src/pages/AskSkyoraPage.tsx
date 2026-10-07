import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useAuth } from '../context/AuthContext';
import { getWeatherData } from '../services/weather';
import { generateSkyoraResponse, ChatMessage } from '../services/askSkyora';
import {
  Send,
  User,
  ArrowRight,
  Database,
} from 'lucide-react';

export const AskSkyoraPage: React.FC = () => {
  const { user } = useAuth();
  const { profile, simulatedHour, logInteraction } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();

  const activeLocation =
    profile.locations.find((l) => l.id === profile.activeLocationId) ||
    profile.locations[0] || { name: 'Mumbai', state: 'Maharashtra' };

  const weather = getWeatherData(activeLocation.name, simulatedHour, profile.units);

  const displayName = user?.user_metadata?.full_name || profile.name || 'User';
  const firstName = displayName.split(' ')[0];

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'skyora',
      text: `Hello ${firstName}! I'm Skyora's contextual assistant. I combine national meteorological radar data with your **${profile.primaryActivity}** routine in **${weather.city}**. How can I help plan your day?`,
      timestamp: 'Just now',
      contextSources: ['User Profile Context', 'IMD Regional Radar'],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle prefilled query passed via React Router navigation state
  useEffect(() => {
    if (location.state && (location.state as any).prefilledQuery) {
      handleSend((location.state as any).prefilledQuery);
    }
  }, [location.state]);

  const handleSend = (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text) return;

    logInteraction('ask_question', text);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Simulate natural response latency with typing effect
    setTimeout(() => {
      const response = generateSkyoraResponse(text, profile, weather, simulatedHour);
      setIsTyping(false);
      setMessages((prev) => [...prev, response]);
    }, 600);
  };

  const suggestedQuestions = [
    'Can I go running at 7 PM?',
    'Will it rain during my journey?',
    'What should I carry today?',
    'Why did I receive this weather alert?',
    'When is the driest running window in Mumbai?',
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Ask Skyora Assistant
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Intelligent, contextual weather assistance grounded in your personal schedule and national observations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Chat Window (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                S
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Skyora Context Engine</div>
                <div className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active · Synced with {weather.city} Station
                </div>
              </div>
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              Rule-Based Grounded Model
            </span>
          </div>

          {/* Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-xl ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : 'S'}
                </div>

                <div className="space-y-1.5">
                  <div
                    className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : 'bg-slate-100 text-slate-800 rounded-tl-none whitespace-pre-line'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Context Sources Tagging */}
                  {msg.contextSources && (
                    <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-400">
                      <span>Sources:</span>
                      {msg.contextSources.map((src, i) => (
                        <span key={i} className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">
                          {src}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Contextual Action Button */}
                  {msg.suggestedAction && (
                    <button
                      type="button"
                      onClick={() => navigate(msg.suggestedAction!.path)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-semibold rounded-md transition-colors mt-1"
                    >
                      <span>{msg.suggestedAction.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 max-w-md">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 text-xs font-semibold">
                  S
                </div>
                <div className="p-3.5 rounded-xl bg-slate-100 text-slate-500 rounded-tl-none text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-[11px]">Analyzing radar and routine...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Questions Bar */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 overflow-x-auto flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 px-1">
              Suggested:
            </span>
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-full whitespace-nowrap shrink-0 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your routine, rain windows, commute, or packing..."
              className="flex-1 text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-amber-500 text-slate-900 placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputQuery.trim()}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg transition-colors shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Side Panel: What Skyora Knows About You */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900">
                What Skyora Knows About You
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              This context is used strictly on-device to answer your queries accurately without generic meteorological fluff.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 block font-medium">Primary Focus</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{profile.primaryActivity}</span>
                <span className="text-[11px] text-slate-500">
                  Also tracking: {profile.selectedActivities.filter((a) => a !== profile.primaryActivity).join(', ') || 'None'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 block font-medium">Routine Windows</span>
                <div className="space-y-1 mt-1 font-mono text-[11px] text-slate-700">
                  {profile.preferences.activityWindow && (
                    <div>{profile.primaryActivity}: {profile.preferences.activityWindow.startHour}:00 – {profile.preferences.activityWindow.endHour}:00</div>
                  )}
                  {profile.preferences.commuteWindow && (
                    <div>Commute: {profile.preferences.commuteWindow.startHour}:00 – {profile.preferences.commuteWindow.endHour}:00</div>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 block font-medium">Active Station</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{weather.city}, {weather.state}</span>
                <span className="text-[11px] text-slate-500">{weather.temp}°C · {weather.rainProb}% rain</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="text-amber-800 hover:underline font-semibold"
              >
                Edit your context
              </button>
              <span className="text-[10px] text-slate-400">100% on-device</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
