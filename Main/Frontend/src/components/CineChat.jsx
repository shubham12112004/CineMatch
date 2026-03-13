import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Mic, MicOff, Bot, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { fetchFromTMDB, POSTER_BASE_URL } from '../services/tmdb';
import CustomSelect from './CustomSelect';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const COUNTRIES = [
  { code: 'IN', name: 'India', lang: 'hi-IN' },
  { code: 'US', name: 'USA', lang: 'en-US' },
  { code: 'GB', name: 'UK', lang: 'en-GB' },
  { code: 'KR', name: 'South Korea', lang: 'ko-KR' },
  { code: 'JP', name: 'Japan', lang: 'ja-JP' },
  { code: 'FR', name: 'France', lang: 'fr-FR' },
];

export default function CineChat({ onClose, onMovieClick, familySafeMode = false, initialAssistantMessage = '' }) {
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Namaste! I'm your AI Cinema Assistant. Tell me what you're in the mood for, and I'll find the perfect content for you. I'll prioritize Indian content first!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const currentCountry = COUNTRIES.find(c => c.code === selectedCountry);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const seed = String(initialAssistantMessage || '').trim();
    if (!seed) return;

    setMessages((prev) => {
      const alreadyExists = prev.some((msg) => msg.role === 'bot' && msg.content === seed);
      if (alreadyExists) return prev;
      return [...prev, { role: 'bot', content: seed }];
    });
  }, [initialAssistantMessage]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = currentCountry.lang;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [selectedCountry]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.lang = currentCountry.lang;
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      if (!GEMINI_API_KEY) {
        throw new Error('MISSING_GEMINI_KEY');
      }

      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const model = "gemini-2.5-flash";

      const systemInstruction = `You are a cinematic expert chatbot. Your goal is to help users find movies or TV shows.
      
      CRITICAL RULES:
      1. ALWAYS prioritize content from ${currentCountry.name} (Country Code: ${selectedCountry}). If the user asks for a genre like "family show", you MUST list ${currentCountry.name} content first, followed by international content.
      2. OUTPUT FORMAT: You MUST use a bulleted list for recommendations. Do NOT write long paragraphs.
      3. Each recommendation MUST follow this EXACT structure:
         • **[TITLE] (YEAR)**
           - **Type**: [Movie or TV Series]
           - **Genre**: [Genres]
           - **Rating**: [Rating]/10
           - **Info**: [A concise 1-sentence description]
      
      4. Be conversational but extremely concise.
      5. Use the search tool for any specific content requests to ensure accuracy.
      
      Example of a good response:
      "Here are some family shows you might enjoy, starting with top picks from ${currentCountry.name}:
      
      • **Gullak (2019)**
        - **Type**: TV Series
        - **Genre**: Comedy, Family, Drama
        - **Rating**: 9.1/10
        - **Info**: A heart-warming collection of stories centered around the Mishra family in a small town.
      
      • **Modern Family (2009)**
        - **Type**: TV Series
        - **Genre**: Comedy, Family
        - **Rating**: 8.5/10
        - **Info**: Three different but related families face trials and tribulations in their own uniquely comedic ways."`;

      const response = await ai.models.generateContent({
        model,
        contents: userMessage,
        config: {
          systemInstruction,
          tools: [{
            functionDeclarations: [
              {
                name: "searchContent",
                description: "Search for movies or TV shows on TMDB",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    query: { type: "STRING", description: "The search query" },
                    type: { type: "STRING", enum: ["movie", "tv", "multi"], description: "The type of content" },
                    prioritizeCountry: { type: "BOOLEAN", description: "Whether to prioritize the user's selected country" }
                  },
                  required: ["query"]
                }
              }
            ]
          }]
        }
      });

      let botResponse = response.text;
      let recommendations = [];

      const functionCalls = response.functionCalls;
      if (functionCalls) {
        for (const call of functionCalls) {
          if (call.name === "searchContent") {
            const { query, type = 'multi' } = call.args;
            
            // Fetch both local and global results to prioritize
            // For India, we often want to search specifically for Hindi/Indian content
            const [localData, globalData] = await Promise.all([
              fetchFromTMDB(`search/${type === 'multi' ? 'movie' : type}`, { 
                query, 
                region: selectedCountry,
                language: currentCountry.lang,
                include_adult: false
              }),
              fetchFromTMDB(`search/${type}`, { 
                query,
                language: currentCountry.lang,
                include_adult: false
              })
            ]);

            // Combine and deduplicate, prioritizing local
            const localResults = localData.results || [];
            const globalResults = globalData.results || [];
            
            // Filter out Romance genre (10749) when Family Safe Mode is enabled
            const filterSafe = (results) => {
              if (!familySafeMode) return results;
              return results.filter(item => !item.genre_ids || !item.genre_ids.includes(10749));
            };
            
            // Filter local results to ensure they are actually from the selected country if possible
            const filteredLocal = filterSafe(localResults).filter(r => 
              r.origin_country?.includes(selectedCountry) || 
              r.original_language === currentCountry.lang.split('-')[0]
            );

            recommendations = [...filteredLocal.slice(0, 4), ...filterSafe(globalResults).filter(g => !filteredLocal.some(l => l.id === g.id)).slice(0, 4)];
            
            const followUp = await ai.models.generateContent({
              model,
              contents: [
                { text: userMessage },
                { text: `I found these results. Local (${currentCountry.name}) matches: ${filteredLocal.map(r => r.title || r.name).join(', ')}. Other Global matches: ${globalResults.map(r => r.title || r.name).join(', ')}. Please list them in the required bulleted format, prioritizing ${currentCountry.name} content as requested.` }
              ],
              config: { systemInstruction }
            });
            botResponse = followUp.text;
          }
        }
      }

      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: botResponse,
        recommendations: recommendations.length > 0 ? recommendations : null
      }]);
    } catch (err) {
      console.error('AI Chat failed', err);
      const isMissingKey = err?.message === 'MISSING_GEMINI_KEY';
      const content = isMissingKey
        ? "Gemini API key is missing. Please set VITE_GEMINI_API_KEY in your Main/.env file, then restart the server."
        : "I couldn't connect to Gemini right now. Please try again in a moment, or rephrase your prompt.";

      setMessages(prev => [...prev, { role: 'bot', content }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 bottom-0 w-full md:w-112.5 z-150 bg-[#141414] border-l border-white/10 shadow-2xl flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)]">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-black uppercase tracking-tighter">CineBot</h2>
            <div className="w-40">
              <CustomSelect
                options={COUNTRIES.map(c => ({ value: c.code, label: c.name }))}
                value={selectedCountry}
                onChange={(value) => setSelectedCountry(value)}
                placeholder="Select Country"
                colorTheme="red"
              />
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
          <X size={24} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] space-y-3 ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-red-600 text-white rounded-tr-none shadow-lg' 
                  : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
              
              {msg.recommendations && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {msg.recommendations.map(movie => (
                    <button
                      key={movie.id}
                      onClick={() => onMovieClick(movie, movie.media_type || (movie.title ? 'movie' : 'tv'))}
                      className="group relative aspect-2/3 rounded-xl overflow-hidden border border-white/10 hover:border-red-600 transition-all"
                    >
                      <img 
                        src={movie.poster_path ? `${POSTER_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-2 left-2 right-2 text-left">
                        <p className="text-[10px] font-black text-white uppercase truncate leading-tight">{movie.title || movie.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star size={8} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-[8px] text-gray-300 font-bold">{movie.vote_average?.toFixed(1)}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex gap-1.5">
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-white/10 bg-black/20">
        <form onSubmit={handleSend} className="relative flex items-center gap-3">
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-600 text-white animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Tell me what to watch..."}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white text-sm outline-none focus:border-red-600 focus:bg-white/10 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-red-600 hover:text-red-500 disabled:opacity-50 disabled:text-gray-600 transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
        <p className="mt-4 text-[10px] text-center text-gray-500 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <Sparkles size={12} className="text-red-600" />
          Powered by Gemini AI
        </p>
      </div>
    </motion.div>
  );
}

const Star = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
