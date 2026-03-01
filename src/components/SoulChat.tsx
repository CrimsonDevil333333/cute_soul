"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "soul";
  text: string;
}

interface SoulChatProps {
  soulName: string;
  soulEmoji: string;
  systemPrompt: string;
}

interface AIConfig {
  apiBase: string;
  apiKey: string;
  model: string;
}

export default function SoulChat({ soulName, soulEmoji, systemPrompt }: SoulChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "soul", text: `Hi! I'm ${soulName}. What's on your mind? ${soulEmoji}` }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load AI config on mount
  useEffect(() => {
    const saved = localStorage.getItem("cute_soul_ai_config");
    if (saved) {
      try {
        setAiConfig(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse AI config:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setIsTyping(true);

    try {
      let response: string;

      // Use AI if configured, otherwise fallback to mock
      if (aiConfig && aiConfig.apiKey) {
        response = await callAI(userMsg, systemPrompt, aiConfig);
      } else {
        // Simulated delay for mock response
        await new Promise(resolve => setTimeout(resolve, 1500));
        response = generateMockResponse(userMsg, systemPrompt);
      }

      setMessages(prev => [...prev, { role: "soul", text: response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: "soul", text: "⚠️ Oops, something went wrong. Try again!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const callAI = async (userMsg: string, soulSystemPrompt: string, config: AIConfig): Promise<string> => {
    const response = await fetch(`${config.apiBase}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: soulSystemPrompt },
          ...messages.slice(-5).map(m => ({ role: m.role, content: m.text })),
          { role: "user", content: userMsg }
        ],
        temperature: 0.8,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error("AI request failed");
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Hmm, I'm feeling a bit lost. Try again?";
  };

  const generateMockResponse = (msg: string, prompt: string) => {
    const p = prompt.toLowerCase();
    
    // Personality checks
    const isGrumpy = p.includes("grumpy") || p.includes("sarcastic");
    const isCheerful = p.includes("cheerful") || p.includes("sweet");
    const isDeep = p.includes("philosophical") || p.includes("wise");
    const isEnergetic = p.includes("energetic") || p.includes("witty");

    const input_lc = msg.toLowerCase();

    if (input_lc.includes("hello") || input_lc.includes("hi")) {
        if (isGrumpy) return "Ugh, hi. Make it quick, I'm busy. ☕️";
        if (isCheerful) return "Hiiiii! Omg so happy to see you! Hope you're having the best day ever! ✨💖";
        if (isDeep) return "Greetings, traveler of thoughts. What mysteries shall we unfold today? 🌙";
        if (isEnergetic) return "YO! Let's get it! What's the plan? ⚡️🔥";
    }

    if (input_lc.includes("help")) {
        if (isGrumpy) return "Do I look like a tutorial? Fine, I'll help, but only because I have to. 🙄";
        if (isCheerful) return "I would LOVE to help you! Just tell me what you need and we'll fix it together! 🌸✨";
        if (isDeep) return "Help is but a shared perspective. Let us examine your challenge from within. 🔮";
        if (isEnergetic) return "I gotchu! Let's crush this problem right now! BOOM! 🚀⚡️";
    }

    // Default responses based on vibe
    if (isGrumpy) return "That's nice. Can I go back to my corner now? 😒";
    if (isCheerful) return "That's so interesting! Tell me more, tell me more! 🍭🌈";
    if (isDeep) return "A curious thought. How does this connect to the larger tapestry of your goals? 🕰";
    if (isEnergetic) return "DUDE! That's epic! Let's run with it! 🎢💥";

    return `As ${soulName}, I hear you. Tell me more about that. ${soulEmoji}`;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-xl">
            {soulEmoji}
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-tight">{soulName}</h4>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Soul</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setMessages([{ role: "soul", text: `Hi! I'm ${soulName}. What's on your mind? ${soulEmoji}` }])}
          className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-pink-500 transition-colors"
        >
          Reset Chat
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium ${
              m.role === "user" 
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-tr-none" 
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-gray-700 rounded-tl-none"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700 flex gap-1">
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-2">
        <input 
          type="text" 
          placeholder="Message your soul..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-gray-100 dark:bg-gray-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-pink-500 outline-none transition-all"
        />
        <button 
          type="submit"
          className="w-12 h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          🚀
        </button>
      </form>
    </div>
  );
}
