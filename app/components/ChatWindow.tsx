'use client';

import { useChat } from '@ai-sdk/react';
import { marked } from 'marked';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mic, MicOff, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "sonner";
import confetti from 'canvas-confetti';

export default function ChatWindow() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [],
    onError: (error) => {
      console.error('Client-side chat error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });
  
  const [sessionId] = useState<string>(crypto.randomUUID());
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [badges, setBadges] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Speech recognition setup
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  
  useEffect(() => {
    // Initialize speech recognition if supported
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      
      recognitionInstance.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
    
    // Fetch user badges
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          setBadges(userData.badges || []);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      handleInputChange({ target: { value: transcript } } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [transcript, handleInputChange]);
  
  const toggleListening = () => {
    if (!recognition) {
      toast({
        title: 'Speech Recognition Not Supported',
        description: 'Your browser does not support speech recognition.',
        variant: 'destructive',
      });
      return;
    }
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognition.start();
      setIsListening(true);
    }
  };
  
  const checkForBadges = async () => {
    try {
      const response = await fetch('/api/badges', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.newBadges && data.newBadges.length > 0) {
          // Trigger confetti
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          
          // Show toast with celebration message
          toast({
            title: `🎉 New Badge: ${data.newBadges[0]}`,
            description: data.celebrationMessage || "You've earned a new badge!",
            duration: 5000,
          });
          
          // Update badges state
          setBadges(data.allBadges);
        }
      }
    } catch (error) {
      console.error('Error checking badges:', error);
    }
  };
  
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() === '') return;
    
    // Stop listening if active
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }
    
    handleSubmit(e, { body: { sessionId } }).then(() => {
      // Check for badges after the message is sent and response is received
      checkForBadges();
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="text-primary">Chat Session</span>
          {badges.length > 0 && (
            <div className="flex space-x-1">
              {badges.map((badge, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground"
                  title={badge}
                >
                  🏆
                </span>
              ))}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[60vh] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground">
            <div>
              <p className="mb-2">👋 Welcome to your AI Companion!</p>
              <p>Ask me anything to get started.</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} max-w-[80%]`}>
                <Avatar className={`${message.role === 'user' ? 'ml-2' : 'mr-2'} h-8 w-8`}>
                  <AvatarFallback>{message.role === 'user' ? 'U' : 'AI'}</AvatarFallback>
                  {message.role !== 'user' && (
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  )}
                </Avatar>
                <div 
                  className={`p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                  dangerouslySetInnerHTML={{ 
                    __html: marked(message.content, { breaks: true }) 
                  }}
                />
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex mb-4 justify-start">
            <div className="flex flex-row max-w-[80%]">
              <Avatar className="mr-2 h-8 w-8">
                <AvatarFallback>AI</AvatarFallback>
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
              </Avatar>
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <CardFooter>
        <form onSubmit={onSubmit} className="flex w-full space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-grow"
            disabled={isLoading}
          />
          <Button 
            type="button" 
            variant={isListening ? "destructive" : "outline"} 
            size="icon" 
            onClick={toggleListening}
            disabled={isLoading}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </form>
      </CardFooter>
      <Toaster />
    </Card>
  );
}