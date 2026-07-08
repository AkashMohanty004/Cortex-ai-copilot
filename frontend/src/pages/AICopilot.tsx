import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCustomer } from '../context/CustomerContext';
import apiClient from '../api/client';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  AlertCircle, 
  HelpCircle,
  FileText,
  Loader2,
  Bookmark,
  LineChart,
  Code
} from 'lucide-react';

interface CitedSource {
  document_name: string;
  snippet: string;
}

interface Message {
  id?: number;
  customer_id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  chart_type?: string | null;
  code_block?: string | null;
  references_list?: CitedSource[] | null;
}

// Simple Markdown parser for beautiful output in light mode
const MarkdownText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        let trimmed = line.trim();
        
        // Headers
        if (trimmed.startsWith('### ')) {
          return <h4 key={idx} className="text-sm font-bold text-slate-800 uppercase tracking-wider mt-3 mb-1">{trimmed.replace('### ', '')}</h4>;
        }
        if (trimmed.startsWith('## ')) {
          return <h3 key={idx} className="text-base font-bold text-cortex-copper mt-4 mb-2">{trimmed.replace('## ', '')}</h3>;
        }
        if (trimmed.startsWith('# ')) {
          return <h2 key={idx} className="text-lg font-extrabold text-slate-950 mt-5 mb-2">{trimmed.replace('# ', '')}</h2>;
        }
        
        // Lists
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const content = trimmed.substring(2);
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1 my-1 text-slate-700">
              <li>{parseFormat(content)}</li>
            </ul>
          );
        }
        
        // Paragraphs / Normal lines
        if (trimmed === '') {
          return <div key={idx} className="h-2" />;
        }
        
        return <p key={idx} className="text-slate-800">{parseFormat(line)}</p>;
      })}
    </div>
  );
};

// Helper function to replace **bold** and `code` inside lines
function parseFormat(text: string) {
  const parts = [];
  let lastIndex = 0;
  
  // Basic bold regex **text**
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  
  while ((match = boldRegex.exec(text)) !== null) {
    const textBefore = text.substring(lastIndex, match.index);
    if (textBefore) parts.push(textBefore);
    
    parts.push(
      <strong key={match.index} className="font-bold text-cortex-copper">
        {match[1]}
      </strong>
    );
    lastIndex = boldRegex.lastIndex;
  }
  
  const remaining = text.substring(lastIndex);
  if (remaining) {
    // Check for inline code `code`
    const codeRegex = /`(.*?)`/g;
    let codeMatch;
    let codeLastIdx = 0;
    const subParts = [];
    
      while ((codeMatch = codeRegex.exec(remaining)) !== null) {
      const subBefore = remaining.substring(codeLastIdx, codeMatch.index);
      if (subBefore) subParts.push(subBefore);
      subParts.push(
        <code key={codeMatch.index} className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md text-xs font-mono text-slate-800">
          {codeMatch[1]}
        </code>
      );
      codeLastIdx = codeRegex.lastIndex;
    }
    
    const codeRemaining = remaining.substring(codeLastIdx);
    if (codeRemaining) subParts.push(codeRemaining);
    
    parts.push(...subParts);
  } else {
    // If no bold matches, check inline code directly on original text
    if (parts.length === 0) {
      const codeRegex = /`(.*?)`/g;
      let codeMatch;
      let codeLastIdx = 0;
      
      while ((codeMatch = codeRegex.exec(text)) !== null) {
        const subBefore = text.substring(codeLastIdx, codeMatch.index);
        if (subBefore) parts.push(subBefore);
        parts.push(
          <code key={codeMatch.index} className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-md text-xs font-mono text-slate-800">
            {codeMatch[1]}
          </code>
        );
        codeLastIdx = codeRegex.lastIndex;
      }
      const codeRemaining = text.substring(codeLastIdx);
      if (codeRemaining) parts.push(codeRemaining);
    }
  }
  
  return parts.length > 0 ? parts : text;
}

export const AICopilot: React.FC = () => {
  const { selectedCustomerId, selectedCustomer } = useCustomer();
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const starterQuestions = [
    "What is the safety protocol for Transformer #2 temperature alerts?",
    "Why is the Power Factor warning active and how do I fix it?",
    "Show me the emergency protocol for CNC Milling Area A voltage sags.",
    "Summarize current grid telemetry stats."
  ];

  // Fetch Chat History
  const { 
    data: chatHistory = [], 
    isLoading: historyLoading,
    isError: historyError 
  } = useQuery<Message[]>({
    queryKey: ['chatHistory', selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return [];
      const res = await apiClient.get<Message[]>(`/copilot/history/${selectedCustomerId}`);
      return res.data;
    },
    enabled: !!selectedCustomerId,
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Chat Mutation
  const chatMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const res = await apiClient.post<any>('/copilot/chat', {
        message: messageText,
        customer_id: selectedCustomerId
      });
      return res.data;
    },
    onMutate: async (messageText) => {
      await queryClient.cancelQueries({ queryKey: ['chatHistory', selectedCustomerId] });
      const previousHistory = queryClient.getQueryData<Message[]>(['chatHistory', selectedCustomerId]) || [];

      const optimisticMsg: Message = {
        customer_id: selectedCustomerId,
        sender: 'user',
        text: messageText,
        timestamp: new Date().toISOString()
      };
      
      queryClient.setQueryData(['chatHistory', selectedCustomerId], [...previousHistory, optimisticMsg]);
      return { previousHistory };
    },
    onError: (err, variables, context) => {
      if (context?.previousHistory) {
        queryClient.setQueryData(['chatHistory', selectedCustomerId], context.previousHistory);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatHistory', selectedCustomerId] });
    }
  });

  const handleSendMessage = (text: string) => {
    if (!text.trim() || chatMutation.isPending) return;
    chatMutation.mutate(text);
    setInputValue('');
  };

  const handleStarterQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl flex flex-col h-[calc(100vh-140px)] overflow-hidden relative shadow-sm">
      
      {/* Copilot Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-cortex-copper/10 p-2 rounded-xl border border-cortex-copper/30">
            <Sparkles className="h-5 w-5 text-cortex-copper animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-0.5">Cortex AI Assistant</h3>
            <p className="text-[10px] text-slate-500 font-mono">Calibrated for {selectedCustomer ? selectedCustomer.name : 'Facility Control Grid'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px] text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg bg-slate-50">
          <Bot className="h-3.5 w-3.5 text-cortex-copper" />
          GEMINI-2.5-FLASH
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20">
        {historyLoading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <Loader2 className="h-8 w-8 text-cortex-copper animate-spin" />
            <p className="text-xs font-mono text-slate-500">Syncing chat log history...</p>
          </div>
        ) : historyError ? (
          <div className="flex flex-col items-center justify-center h-full text-red-600 p-4">
            <AlertCircle className="h-10 w-10 mb-2" />
            <p className="text-xs font-mono">Failed to fetch chat logs.</p>
          </div>
        ) : chatHistory.length === 0 ? (
          /* Empty Chat state & Starter Prompts */
          <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center space-y-6">
            <div className="p-4 bg-cortex-copper/5 border border-cortex-copper/25 rounded-full">
              <Bot className="h-12 w-12 text-cortex-copper" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Ask Cortex AI Copilot</h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                I can troubleshoot active warning relays, verify compliance codes, inspect sensor threshold logs, and guide you on equipment procedures using the local document vaults.
              </p>
            </div>
            <div className="w-full space-y-2">
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-2">Suggested Diagnostics:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {starterQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleStarterQuestion(q)}
                    className="p-3 text-left bg-white border border-slate-200 hover:border-cortex-copper/40 rounded-xl text-xs text-slate-700 hover:text-slate-950 transition-all duration-200 flex items-start gap-2.5 cursor-pointer group shadow-sm hover:shadow-md"
                  >
                    <HelpCircle className="h-4.5 w-4.5 text-cortex-copper/60 group-hover:text-cortex-copper shrink-0 mt-0.5" />
                    <span className="leading-snug">{q}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Message bubble list */
          <div className="space-y-6">
            {chatHistory.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={idx} className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  
                  {/* Bot Avatar */}
                  {!isUser && (
                    <div className="h-9 w-9 shrink-0 rounded-lg bg-cortex-copper/10 border border-cortex-copper/30 flex items-center justify-center shadow-sm">
                      <Bot className="h-4.5 w-4.5 text-cortex-copper" />
                    </div>
                  )}

                  {/* Message Bubble Container */}
                  <div className={`max-w-[75%] rounded-2xl p-4 border flex flex-col justify-between shadow-sm ${
                    isUser 
                      ? 'bg-slate-100 border-slate-200 text-slate-900 rounded-tr-none' 
                      : 'bg-white border-slate-200 text-slate-800 rounded-tl-none'
                  }`}>
                    
                    {/* Message Header */}
                    <div className="flex items-center gap-2 mb-2 font-mono text-[9px] text-slate-400">
                      <span className="font-semibold text-slate-600 uppercase">
                        {isUser ? 'Grid Manager' : 'Cortex Copilot'}
                      </span>
                      <span>•</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Message Text (Markdown) */}
                    <div className="flex-1 pr-1 select-text">
                      <MarkdownText text={msg.text} />
                    </div>

                    {/* Assistant Code Block visual container */}
                    {msg.code_block && (
                      <div className="mt-3.5 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden font-mono text-xs shadow-inner">
                        <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-slate-500 text-[10px]">
                          <span className="flex items-center gap-1.5"><Code className="h-3.5 w-3.5" /> Troubleshooting Script / Log</span>
                          <span>bash</span>
                        </div>
                        <pre className="p-3 overflow-x-auto text-cortex-copper/90 select-all font-semibold">
                          <code>{msg.code_block}</code>
                        </pre>
                      </div>
                    )}

                    {/* Chart recommendation badge */}
                    {msg.chart_type && (
                      <div className="mt-3 p-3 bg-cortex-copper/5 border border-cortex-copper/20 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <LineChart className="h-4.5 w-4.5 text-cortex-copper" />
                          <div>
                            <p className="text-[11px] font-bold text-slate-900">Metric analysis recommended</p>
                            <p className="text-[9px] text-slate-500">You can plot historical intervals on the Analytics page</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Citations / RAG sources cited */}
                    {!isUser && msg.references_list && msg.references_list.length > 0 && (
                      <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col gap-1.5">
                        <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Bookmark className="h-3 w-3 text-cortex-copper" /> Grounded References ({msg.references_list.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {msg.references_list.map((ref, rIdx) => (
                            <div 
                              key={rIdx} 
                              title={ref.snippet}
                              className="text-[10px] font-mono px-2 py-1 bg-slate-50 border border-slate-200 hover:border-cortex-copper/30 rounded-lg flex items-center gap-1 cursor-help transition-all shadow-sm"
                            >
                              <FileText className="h-3 w-3 text-slate-400" />
                              <span className="text-slate-700">{ref.document_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="h-9 w-9 shrink-0 rounded-lg bg-cortex-copper border border-cortex-copper/40 flex items-center justify-center text-white font-bold shadow-sm shadow-cortex-copper/15">
                      <User className="h-4.5 w-4.5" />
                    </div>
                  )}

                </div>
              );
            })}

            {/* Thinking / Streaming loader */}
            {chatMutation.isPending && (
              <div className="flex gap-4 justify-start">
                <div className="h-9 w-9 shrink-0 rounded-lg bg-cortex-copper/10 border border-cortex-copper/30 flex items-center justify-center">
                  <Bot className="h-4.5 w-4.5 text-cortex-copper animate-bounce" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 w-44 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 text-cortex-copper animate-spin" />
                    <span className="text-xs font-mono text-slate-500">Retrieving RAG data...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Input panel */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={chatMutation.isPending}
            placeholder="Ask Cortex AI Copilot about safety thresholds, warning relays, logs..."
            className="flex-1 bg-white border border-slate-200 focus:border-cortex-copper text-xs rounded-xl px-4 py-3 text-slate-900 focus:outline-none transition-all duration-200"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || chatMutation.isPending}
            className="p-3 bg-cortex-copper hover:bg-cortex-copper-hover disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center shadow-md shadow-cortex-copper/15"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
