/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

// Simple SVG Icons
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
  </svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const RobotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 13.5h.008v.008H8.25v-.008zm5.5 0h.008v.008h-.008v-.008zm2.25-6a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-10.5 6a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zm16.5 0a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM12 21a9.004 9.004 0 008.716-6.747A9.001 9.001 0 0012 3a9.001 9.001 0 00-8.716 11.253A9.004 9.004 0 0012 21z" />
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

type Message = {
  role: 'user' | 'agent';
  content: string;
  routeData?: any;
};

const VisualRouteCard = ({ data }: { data: any }) => {
  if (!data || !data.route) return null;
  
  return (
    <div className="mt-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-full max-w-[280px]">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        </svg>
        Route Map
      </div>
      <div className="relative pl-2">
         {/* Vertical line connecting nodes */}
         <div className="absolute left-[11px] top-[10px] bottom-[10px] w-0.5 bg-slate-200 dark:bg-slate-600 -z-10"></div>
         <div className="flex flex-col gap-5 w-full z-10">
           {data.route.map((wp: any, i: number) => (
             <div key={i} className="flex items-center gap-4">
               <div className={`w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-slate-800 ${i === 0 || i === data.route.length - 1 ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-500'} shrink-0`}></div>
               <div className={`text-sm ${i === 0 || i === data.route.length - 1 ? 'font-semibold text-slate-800 dark:text-slate-100' : 'font-medium text-slate-500 dark:text-slate-400'}`}>
                 {wp.name}
               </div>
             </div>
           ))}
         </div>
      </div>
      {data.destination && (
         <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
           <div className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Destination</div>
           <div className="font-bold text-emerald-700 dark:text-emerald-400 text-sm flex justify-between items-center">
             <span>{data.destination.name}</span>
             {data.destination.type && (
               <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 px-2 py-0.5 rounded-full uppercase">
                 {data.destination.type}
               </span>
             )}
           </div>
         </div>
      )}
    </div>
  );
};

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('English');
  const [accessible, setAccessible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    
    // Inject accessibility context if toggle is checked
    const contextMessage = accessible 
      ? `[User requires accessible/wheelchair-friendly route] ${userMessage}` 
      : userMessage;

    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: contextMessage,
          language: language,
          conversationHistory: messages
        })
      });

      const data = await res.json();
      
      if (res.ok && data.reply) {
        setMessages([...newMessages, { role: 'agent', content: data.reply, routeData: data.routeData }]);
      } else {
        setMessages([...newMessages, { role: 'agent', content: data.error || 'Sorry, I encountered an error processing your request.' }]);
      }
    } catch {
      setMessages([...newMessages, { role: 'agent', content: 'Network error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 font-sans mx-auto max-w-[500px] shadow-2xl relative transition-colors duration-300">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-emerald-700 dark:bg-emerald-950 text-white shrink-0 z-10 transition-colors duration-300">
        <Link 
          href="/" 
          aria-label="Go back to home screen" 
          className="p-2 -ml-2 rounded-full hover:bg-emerald-600 dark:hover:bg-emerald-800 focus:ring-4 focus:ring-white outline-none transition-colors"
        >
          <BackIcon />
        </Link>
        <h1 className="text-lg font-bold tracking-tight">Stadium Copilot</h1>
        
        <button 
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          className="p-2 rounded-full hover:bg-emerald-600 dark:hover:bg-emerald-800 focus:ring-4 focus:ring-white outline-none transition-colors ml-auto mr-2"
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
      </header>

      {/* Settings Toolbar */}
      <div className="bg-emerald-50 dark:bg-slate-900 border-b border-emerald-100 dark:border-slate-800 p-3 flex items-center justify-between shrink-0 z-10 transition-colors duration-300">
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="accessible-toggle" 
            checked={accessible}
            onChange={(e) => setAccessible(e.target.checked)}
            className="w-5 h-5 text-emerald-600 border-gray-300 dark:border-slate-700 rounded focus:ring-emerald-500 cursor-pointer dark:bg-slate-800"
          />
          <label htmlFor="accessible-toggle" className="ml-3 text-sm font-medium text-emerald-900 dark:text-emerald-100 cursor-pointer select-none">
            Need accessible route
          </label>
        </div>
        <div>
          <label htmlFor="language-select" className="sr-only">Select Language</label>
          <select 
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-emerald-100 dark:bg-slate-800 text-emerald-900 dark:text-emerald-100 text-xs font-semibold border-none rounded-full px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
          >
            <option value="English">English</option>
            <option value="Hindi">हिन्दी</option>
            <option value="Spanish">Español</option>
          </select>
        </div>
      </div>

      {/* Chat Log Area */}
      <main 
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 bg-slate-50 dark:bg-black transition-colors duration-300" 
        role="log" 
        aria-live="polite" 
        aria-atomic="false"
      >
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-80 mt-10">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mb-5 text-emerald-700 dark:text-emerald-400 shadow-sm">
               <RobotIcon />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Welcome to the Stadium!</h2>
            <p className="text-[15px] text-slate-600 dark:text-slate-400 max-w-[280px]">
              Ask me about live crowd levels, facility locations, or the best routes around the arena.
            </p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 px-1 uppercase tracking-wider">
              {msg.role === 'user' ? 'You' : 'Copilot'}
            </span>
            <div className={`p-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-blue-600 dark:bg-blue-700 text-white rounded-br-none' : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-800'}`}>
              {msg.content}
            </div>
            {msg.routeData && (
              <VisualRouteCard data={msg.routeData} />
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="self-start flex flex-col items-start max-w-[85%]" aria-label="Copilot is typing...">
             <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 px-1 uppercase tracking-wider">Copilot</span>
             <div className="px-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-bl-none shadow-sm flex gap-1.5 items-center">
                <div className="w-2 h-2 bg-emerald-400 dark:bg-emerald-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-400 dark:bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                <div className="w-2 h-2 bg-emerald-400 dark:bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
             </div>
          </div>
        )}
        <div ref={chatEndRef} className="h-2" />
      </main>

      {/* Input Footer */}
      <footer className="p-3 bg-white dark:bg-black border-t border-slate-200 dark:border-slate-800 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 pb-safe transition-colors duration-300">
        <form onSubmit={sendMessage} className="flex items-center gap-2 w-full">
          <button 
            type="button" 
            aria-label="Use voice input (coming soon)" 
            className="p-3 min-w-[44px] min-h-[44px] text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition-colors focus:ring-4 focus:ring-emerald-500 outline-none flex-shrink-0 flex items-center justify-center group relative"
            onClick={() => alert("Voice input coming soon!")}
          >
            <MicIcon />
            {/* Tooltip for accessibility visible text label on focus/hover */}
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">Voice Input</span>
          </button>
          
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about gates, routes..."
            aria-label="Chat input message"
            className="flex-1 min-h-[44px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-full px-4 py-3 focus:ring-4 focus:ring-emerald-500 focus:border-transparent outline-none text-[16px] min-w-0 placeholder-slate-400 dark:placeholder-slate-500 shadow-inner"
            disabled={isLoading}
          />

          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            aria-label="Send message" 
            className="p-3 min-w-[44px] min-h-[44px] bg-emerald-600 dark:bg-emerald-700 text-white rounded-full hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed focus:ring-4 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-black outline-none flex-shrink-0 shadow-sm flex items-center justify-center group relative"
          >
            <SendIcon />
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none transition-opacity">Send</span>
          </button>
        </form>
      </footer>
    </div>
  );
}
