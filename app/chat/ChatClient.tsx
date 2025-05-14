"use client"

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Plus, Settings, User, Sparkles, X, Maximize2, Minimize2, ChevronDown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const BackgroundAnimation = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const particles = [];
    
    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
        opacity: Math.random() * 0.5 + 0.1
      });
    }
    
    // Animation loop
    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw and update particles
      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(125, 211, 252, ${particle.opacity})`;
        ctx.fill();
        
        // Move particles
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });
      
      // Connect nearby particles with lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const opacity = 0.1 * (1 - distance / 100);
            ctx.strokeStyle = `rgba(125, 211, 252, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Resize handler
    const handleResize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
};

// AI response typing animation
const TypingAnimation = () => {
  return (
    <div className="flex items-center space-x-2 p-2">
      <div className="flex space-x-1">
        <div className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" style={{ animationDelay: "0.1s" }}></div>
        <div className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" style={{ animationDelay: "0.3s" }}></div>
        <div className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" style={{ animationDelay: "0.5s" }}></div>
      </div>
      <span className="text-sm font-medium text-slate-400">AI is thinking...</span>
    </div>
  );
};

// Message component
const Message = ({ isUser, content, timestamp }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0 ${isUser ? 'ml-2 bg-indigo-600' : 'mr-2 bg-slate-700'}`}>
          {isUser ? <User size={16} className="text-white" /> : <Sparkles size={16} className="text-sky-400" />}
        </div>
        <div className={`rounded-2xl px-4 py-2 ${isUser ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 text-slate-100 backdrop-blur-sm border border-slate-700'}`}>
          <div className="text-sm">{content}</div>
          <div className="text-xs mt-1 opacity-70">{timestamp}</div>
        </div>
      </div>
    </div>
  );
};

export default function FuturisticAIChatbot() {
  const [messages, setMessages] = useState([
    { id: 1, content: "Hello! I'm your AI assistant. How can I help you today?", isUser: false, timestamp: "10:03 AM" },
    { id: 2, content: "Can you help me with a data analysis task?", isUser: true, timestamp: "10:04 AM" },
    { id: 3, content: "I'd be happy to help with your data analysis task. Could you provide more details about what you're looking to analyze?", isUser: false, timestamp: "10:04 AM" }
  ]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (inputText.trim() === "") return;
    
    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      content: inputText,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newUserMessage]);
    setInputText("");
    
    // Simulate AI thinking
    setIsThinking(true);
    setTimeout(() => {
      setIsThinking(false);
      
      // Add AI response
      const newAIMessage = {
        id: messages.length + 2,
        content: "I understand your request. I'm processing the information and will help you with this task. Would you like me to explain my approach?",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, newAIMessage]);
    }, 2000);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`flex flex-col bg-slate-900 text-white overflow-hidden relative ${isFullscreen ? 'fixed inset-0 z-50' : 'h-screen max-w-6xl mx-auto rounded-lg border border-slate-700 shadow-lg shadow-sky-900/20'}`}>
      {/* 3D Background Animation */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <BackgroundAnimation />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-900/95"></div>
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 backdrop-blur-md bg-slate-900/50 z-10">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center mr-3">
            <Sparkles size={18} className="text-sky-400" />
          </div>
          <div className="relative">
            <button 
              className="flex items-center px-2 py-1 rounded-lg bg-slate-800 text-sm font-medium hover:bg-slate-700 transition-colors"
              onClick={() => setShowModels(!showModels)}
            >
              AI Assistant <ChevronDown size={14} className="ml-1" />
            </button>
            
            {showModels && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-slate-800 rounded-lg border border-slate-700 shadow-lg z-50">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400">Select a model</div>
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-md bg-sky-900/30 cursor-pointer">
                    <div className="h-4 w-4 rounded-full bg-sky-500"></div>
                    <div className="text-sm font-medium">AI Assistant Pro</div>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-700/50 cursor-pointer mt-1">
                    <div className="h-4 w-4 rounded-full bg-slate-600"></div>
                    <div className="text-sm font-medium">AI Assistant</div>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-slate-700/50 cursor-pointer mt-1">
                    <div className="h-4 w-4 rounded-full bg-emerald-600"></div>
                    <div className="text-sm font-medium">AI Assistant Lite</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-slate-800 transition-colors">
            <Settings size={16} className="text-slate-400 hover:text-white" />
          </button>
          <button className="p-2 rounded-full hover:bg-slate-800 transition-colors" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 size={16} className="text-slate-400 hover:text-white" /> : <Maximize2 size={16} className="text-slate-400 hover:text-white" />}
          </button>
          <button className="p-2 rounded-full hover:bg-slate-800 transition-colors">
            <X size={16} className="text-slate-400 hover:text-white" />
          </button>
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto py-4 px-4 z-10">
        {/* New Chat Alert */}
        <Alert className="mb-4 bg-slate-800/70 border-sky-800 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-sky-500" />
          <AlertTitle className="text-sky-400">New Conversation</AlertTitle>
          <AlertDescription className="text-slate-300 text-sm">
            Welcome to your AI assistant. Ask me anything to get started!
          </AlertDescription>
        </Alert>
        
        {/* Messages */}
        <div className="space-y-4">
          {messages.map((message) => (
            <Message 
              key={message.id}
              isUser={message.isUser}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}
          {isThinking && <TypingAnimation />}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t border-slate-700/50 backdrop-blur-md bg-slate-900/50 z-10">
        <div className="relative flex items-center">
          <button className="absolute left-3 text-slate-400 hover:text-white transition-colors">
            <Plus size={18} />
          </button>
          
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message AI Assistant..."
            className="w-full bg-slate-800/70 border border-slate-700 rounded-2xl py-3 pl-10 pr-14 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none h-12 max-h-32 overflow-y-auto"
            style={{ minHeight: '48px' }}
          />
          
          <button 
            className="absolute right-3 p-1.5 rounded-full bg-sky-600 hover:bg-sky-500 transition-colors"
            onClick={handleSendMessage}
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-center text-slate-500">
          AI Assistant may produce inaccurate information. Verify important info.
        </div>
      </div>
    </div>
  );
}