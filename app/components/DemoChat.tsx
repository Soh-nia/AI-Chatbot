"use client"

import React from 'react';
import { useState, useEffect } from 'react';
import { ArrowRight, MessageSquare } from 'lucide-react';

// Define props interface for DemoChatMessage
interface DemoChatMessageProps {
  isUser: boolean;
  content: string;
  delay: number;
}

const DemoChatMessage: React.FC<DemoChatMessageProps> = ({ isUser, content, delay }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`rounded-2xl px-4 py-2 max-w-xs ${isUser ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 border border-slate-700 text-slate-100'}`}>
        <div className="text-sm">{content}</div>
      </div>
    </div>
  );
};

// Define type for demo messages
interface DemoMessage {
  content: string;
  isUser: boolean;
  delay: number;
}

// Animated demo chat messages
const demoMessages: DemoMessage[] = [
  { content: "Hi there! How can I assist you today?", isUser: false, delay: 500 },
  { content: "Can you help me analyze this dataset?", isUser: true, delay: 1500 },
  { content: "Of course! I'll analyze the key patterns in your data and provide insights.", isUser: false, delay: 2500 },
  { content: "Great! Can you also create a visualization?", isUser: true, delay: 3500 },
  { content: "Absolutely! I'll generate a clear visual representation of the trends.", isUser: false, delay: 4500 },
];

// DemoChat component
const DemoChat = () => {
  return (
    <div className="relative">
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl overflow-hidden shadow-2xl shadow-sky-900/20">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 flex items-center justify-center mr-3">
              <MessageSquare size={16} className="text-white" />
            </div>
            <div className="font-medium">NOVA AI Assistant</div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="p-4 h-80 overflow-y-auto bg-slate-900/50">
          {demoMessages.map((msg, index) => (
            <DemoChatMessage
              key={index}
              content={msg.content}
              isUser={msg.isUser}
              delay={msg.delay}
            />
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="relative">
            <input
              type="text"
              placeholder="Message NOVA AI..."
              className="w-full bg-slate-800/70 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              disabled
            />
            <button className="absolute right-2 top-2 p-1.5 rounded-lg bg-sky-600">
              <ArrowRight size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -top-6 -right-6 h-24 w-24 bg-gradient-to-r from-pink-500 to-indigo-600 rounded-full blur-2xl opacity-20"></div>
      <div className="absolute -bottom-8 -left-8 h-32 w-32 bg-gradient-to-r from-sky-500 to-teal-500 rounded-full blur-2xl opacity-20"></div>
    </div>
  );
};

export default DemoChat;