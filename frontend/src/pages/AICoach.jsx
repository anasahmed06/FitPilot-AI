import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Send, Bot, User as UserIcon, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AICoach = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('/api/coach/history');
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/coach/chat', { message: userMessage });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await axios.delete('/api/coach/history');
      setMessages([]);
    } catch (err) {
      console.error("Failed to clear history", err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-textMain p-4 md:p-8">
      <div className="max-w-4xl mx-auto flex flex-col h-[85vh] bg-surface rounded-2xl border border-surfaceHighlight overflow-hidden">
        
        <div className="p-6 border-b border-surfaceHighlight flex items-center justify-between bg-surface">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/20 p-3 rounded-full">
              <MessageSquare className="text-primary" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">FitPilot Coach</h2>
              <p className="text-sm text-textMuted flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                Online - Gemini AI
              </p>
            </div>
          </div>
          <button 
            onClick={clearHistory}
            className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center space-x-1 px-3 py-1.5 rounded-lg hover:bg-red-500/10"
          >
            Clear Chat
          </button>
        </div>

      <main className="flex-1 overflow-y-auto p-4 flex flex-col">
        <div className="flex-1 space-y-6 pb-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`p-2 rounded-full ${msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-surfaceHighlight text-textMuted'}`}>
                  {msg.role === 'user' ? <UserIcon size={20} /> : <Bot size={20} />}
                </div>
                <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-surface border border-surfaceHighlight text-textMain'}`}>
                  {msg.role === 'user' ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-surfaceHighlight text-textMuted">
                  <Bot size={20} />
                </div>
                <div className="p-4 rounded-2xl bg-surface border border-surfaceHighlight flex space-x-2 items-center h-12">
                  <div className="w-2 h-2 bg-textMuted rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-textMuted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-textMuted rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="pt-4 sticky bottom-4">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your coach anything..."
              className="w-full bg-surface border border-surfaceHighlight rounded-full py-4 pl-6 pr-14 text-textMain placeholder-textMuted focus:outline-none focus:ring-2 focus:ring-primary shadow-lg"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 p-2 bg-primary text-white rounded-full hover:bg-primaryHover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </main>
      </div>
    </div>
  );
};

export default AICoach;
