"use client";

import { useState, useEffect } from "react";
import MoodCard from "../components/MoodCard";
import SoulPreview from "../components/SoulPreview";
import SoulChat from "../components/SoulChat";
import AISettings from "../components/AISettings";
import { generateAISoul } from "../lib/ai-service";

interface SoulTraits {
  name: string;
  mood: string;
  personality: string[];
  tone: string;
  emoji: string;
  colorPalette: string[];
}

interface SoulManifest {
  id: string;
  identity: {
    name: string;
    emoji: string;
    mood: string;
    iconPrompt: string;
  };
  vibe: {
    tone: string;
    personality: string[];
    colorPalette: string[];
  };
  systemPrompt: string;
}

const STARTER_MOODS = [
  {
    mood: "bubblegum-dream",
    emoji: "🌸",
    name: "Bubblegum Dream",
    traits: ["cheerful", "warm", "optimistic"],
    gradient: "from-pink-400 to-rose-500",
  },
  {
    mood: "midnight-thinker",
    emoji: "🌙",
    name: "Midnight Thinker",
    traits: ["contemplative", "wise", "calm"],
    gradient: "from-purple-600 to-indigo-700",
  },
  {
    mood: "spark-plug",
    emoji: "⚡",
    name: "Spark Plug",
    traits: ["energetic", "witty", "playful"],
    gradient: "from-amber-400 to-orange-500",
  },
];

const MARKETPLACE_MOCK = [
  { name: "Coffee Cat", emoji: "🐱", author: "Swarm-1", downloads: "1.2k" },
  { name: "Neon Dragon", emoji: "🐲", author: "Satyaa", downloads: "4.5k" },
  { name: "Sad Robot", emoji: "🤖", author: "Clawdy", downloads: "800" },
  { name: "Space Sloth", emoji: "👽", author: "Nova", downloads: "2.1k" },
];

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [soulManifest, setSoulManifest] = useState<SoulManifest | null>(null);
  const [savedSouls, setSavedSouls] = useState<SoulManifest[]>([]);
  const [loading, setLoading] = useState(false);
  const [customVibe, setCustomVibe] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [hasAIKey, setHasAIKey] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(false);

  // Toggle dark mode class on body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Check for AI config on load
  useEffect(() => {
    const saved = localStorage.getItem("cute_soul_ai_config");
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setHasAIKey(!!config.apiKey);
      } catch (e) {
        console.error("Failed to parse AI config:", e);
      }
    } else {
      // Show AI setup prompt on first visit
      setShowAIPrompt(true);
    }
  }, []);

  // Load saved souls from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cute_souls_library");
    if (saved) {
      setSavedSouls(JSON.parse(saved));
    }
  }, []);

  const handleSaveSoul = (soul: SoulManifest) => {
    if (savedSouls.some(s => s.id === soul.id)) return;
    const newSaved = [soul, ...savedSouls];
    setSavedSouls(newSaved);
    localStorage.setItem("cute_souls_library", JSON.stringify(newSaved));
  };

  const handleUpdateSoul = (soul: SoulManifest) => {
    setSoulManifest(soul);
    // If it's a saved soul, update it in the library too
    if (savedSouls.some(s => s.id === soul.id)) {
        const newSaved = savedSouls.map(s => s.id === soul.id ? soul : s);
        setSavedSouls(newSaved);
        localStorage.setItem("cute_souls_library", JSON.stringify(newSaved));
    }
  };

  const handleDeleteSoul = (id: string) => {
    const newSaved = savedSouls.filter(s => s.id !== id);
    setSavedSouls(newSaved);
    localStorage.setItem("cute_souls_library", JSON.stringify(newSaved));
  };

  const handleSelectMood = async (mood: string) => {
    setLoading(true);
    setSelectedMood(mood);
    
    try {
      const response = await fetch(`/api/soul?mood=${mood}`);
      const data = await response.json();
      if (data.success) {
        setSoulManifest(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch soul:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSurpriseMe = async () => {
    setLoading(true);
    try {
      // Check if AI is configured
      const savedConfig = localStorage.getItem("cute_soul_ai_config");
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        if (config.apiKey) {
          // Use AI to generate a random soul
          const randomPrompts = [
            "A grumpy but lovable coffee enthusiast",
            "A hyperactive space explorer puppy",
            "A wise ancient tree that gives life advice",
            "A sarcastic robot comedian",
            "A shy ghost who loves making friends",
          ];
          const randomPrompt = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
          const soul = await generateAISoul(randomPrompt, config);
          setSoulManifest(soul);
          setSelectedMood("ai-random");
          setLoading(false);
          return;
        }
      }
      
      // Fallback to local random
      const response = await fetch("/api/soul?mood=random");
      const data = await response.json();
      if (data.success) {
        setSoulManifest(data.data);
        setSelectedMood("random");
      }
    } catch (error) {
      console.error("Failed to fetch random soul:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomVibe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customVibe.trim() || loading) return;
    
    setLoading(true);
    try {
      const savedConfig = localStorage.getItem("cute_soul_ai_config");
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        if (config.apiKey) {
          const soul = await generateAISoul(customVibe, config);
          setSoulManifest(soul);
          setSelectedMood("custom");
          setLoading(false);
          return;
        }
      }

      // Fallback to local if no API key
      const response = await fetch("/api/soul", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: customVibe }),
      });
      const data = await response.json();
      if (data.success) {
        setSoulManifest(data.data);
        setSelectedMood("custom");
      }
    } catch (error) {
      console.error("Failed to create custom soul:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#FDFCFE] dark:bg-[#0A0A0B] text-gray-900 dark:text-gray-100 transition-colors duration-500`}>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/50 dark:bg-black/50 backdrop-blur-xl border-b border-gray-100 dark:border-gray-900">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-2xl font-black italic tracking-tighter">CUTESOUL 🦞</div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <a href="#" className="hover:text-pink-500 transition-colors">Lab</a>
                <a href="#" className="hover:text-pink-500 transition-colors">Library</a>
                <a href="#" className="hover:text-pink-500 transition-colors">Market</a>
            </nav>
            <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center hover:scale-105 transition-transform"
            >
                {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-40 pb-20 max-w-6xl">
        {/* AI Setup Prompt Banner */}
        {!hasAIKey && showAIPrompt && (
          <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="relative overflow-hidden bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 border-2 border-pink-500/30 rounded-3xl p-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 blur-[100px] rounded-full -z-10" />
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="text-6xl">⚡</div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-black mb-2 tracking-tight">🚀 Unlock AI Soul Generation!</h3>
                  <p className="text-gray-600 dark:text-gray-400 font-medium mb-4">
                    Right now you're using <strong>basic mode</strong> (3 preset souls). Add an API key to generate <strong>infinite unique souls</strong> powered by AI!
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 text-xs font-bold uppercase tracking-widest">
                    <span className="px-3 py-1.5 bg-green-500/10 text-green-500 rounded-lg border border-green-500/20">✅ OpenRouter</span>
                    <span className="px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-lg border border-blue-500/20">✅ Ollama (Free)</span>
                    <span className="px-3 py-1.5 bg-purple-500/10 text-purple-500 rounded-lg border border-purple-500/20">✅ Any OpenAI API</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setShowAIPrompt(false)}
                    className="px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-lg shadow-pink-500/25"
                  >
                    🔌 Setup AI (30 sec)
                  </button>
                  <button
                    onClick={() => setShowAIPrompt(false)}
                    className="px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Skip for Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Status Indicator */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${
            hasAIKey 
              ? "bg-green-500/10 border-green-500/20 text-green-500" 
              : "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
          }`}>
            <div className={`w-2 h-2 rounded-full ${hasAIKey ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`} />
            <span className="text-xs font-bold uppercase tracking-widest">
              {hasAIKey ? "AI Mode Active 🚀" : "Basic Mode (Add API for AI Souls)"}
            </span>
          </div>
          {!hasAIKey && (
            <button
              onClick={() => setShowAIPrompt(true)}
              className="px-4 py-2 bg-pink-500 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-pink-600 transition-colors"
            >
              🔌 Setup Now
            </button>
          )}
        </div>

        {/* Hero Section */}
        <div className="text-center mb-24 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-500/10 blur-[150px] rounded-full -z-10" />
          <h1 className="text-7xl md:text-9xl font-black mb-8 tracking-tighter bg-gradient-to-b from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-400 dark:to-gray-800 bg-clip-text text-transparent italic leading-[0.9]">
            WEAPONIZED<br/>CUTENESS.
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Give your AI agents a soul. High-vibe personalities, behavioral manifests, and AI-generated visual cores.
          </p>
          
          <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
            {/* Custom Vibe Input */}
            <form onSubmit={handleCustomVibe} className="w-full relative group">
                <div className="absolute inset-0 bg-pink-500/10 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <input 
                    type="text" 
                    placeholder={hasAIKey ? "Describe the vibe (e.g. 'Cyberpunk Street Ninja cat')" : "⚠️ Add API key first to enable AI generation"}
                    value={customVibe}
                    onChange={(e) => setCustomVibe(e.target.value)}
                    disabled={!hasAIKey}
                    className="w-full px-6 py-5 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none pr-32 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button 
                    type="submit"
                    disabled={loading || !hasAIKey}
                    className="absolute right-2 top-2 bottom-2 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 text-xs uppercase tracking-widest"
                >
                    {loading ? "..." : "Ignite"}
                </button>
            </form>
            
            {/* AI Status Message */}
            {!hasAIKey && (
              <div className="text-center px-6 py-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2">
                  🔒 AI Generation Locked
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Click the <strong>⚙️ gear icon</strong> (bottom-right) to add your API key and unlock infinite AI souls!
                </p>
              </div>
            )}
            
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">— or —</span>
            <button 
              onClick={handleSurpriseMe}
              disabled={loading}
              className="px-12 py-5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-black rounded-3xl text-xs tracking-[0.3em] uppercase hover:scale-105 transition-all shadow-[0_20px_50px_rgba(236,72,153,0.3)] hover:shadow-pink-500/50 disabled:opacity-50"
            >
              {loading ? "BREWING SOUL..." : "✨ THE SURPRISE BUTTON"}
            </button>
          </div>
        </div>

        {/* AI Demo Section - Show what's possible */}
        {!hasAIKey && (
          <div className="mb-32">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black tracking-tight mb-4">🎭 See What You're Missing</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
                These are examples of <strong>AI-generated souls</strong>. Add your API key to create infinite unique personalities like these!
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "Neon Grump", emoji: "🤖", mood: "Cyberpunk Cynic", desc: "Sarcastic robot who's seen it all" },
                { name: "Cosmic Wholesome", emoji: "🌟", mood: "Space Optimist", desc: "Believes in you more than you believe in yourself" },
                { name: "Velvet Thunder", emoji: "🐆", mood: "Smooth Operator", desc: "Chill vibes with unexpected wisdom" },
              ].map((example, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-pink-500 transition-all cursor-pointer group">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{example.emoji}</div>
                  <h4 className="font-black text-lg mb-1 uppercase tracking-tight">{example.name}</h4>
                  <p className="text-xs text-pink-500 font-bold uppercase mb-2">{example.mood}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{example.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Soul Preview & Chat Sandbox */}
        {soulManifest && (
          <div className="mb-32 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 text-pink-500">
                    <span className="w-8 h-8 bg-pink-500/10 rounded-lg flex items-center justify-center text-sm">01</span>
                    YOUR SOUL IS READY
                </h2>
            </div>
            
            <div className="grid lg:grid-cols-5 gap-12 items-start">
                <div className="lg:col-span-3">
                    <SoulPreview 
                        manifest={soulManifest} 
                        onSave={handleSaveSoul}
                        onUpdate={handleUpdateSoul}
                        isSaved={savedSouls.some(s => s.id === soulManifest.id)}
                    />
                </div>
                <div className="lg:col-span-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Live Sandbox</h3>
                    <SoulChat 
                        soulName={soulManifest.identity.name} 
                        soulEmoji={soulManifest.identity.emoji} 
                        systemPrompt={soulManifest.systemPrompt} 
                    />
                </div>
            </div>
          </div>
        )}

        {/* Library Section */}
        {savedSouls.length > 0 && (
          <div className="mb-32">
             <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                    <span className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-sm">02</span>
                    MY SOULS LIBRARY
                </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {savedSouls.map((soul) => (
                    <div 
                        key={soul.id}
                        className="group relative bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-pink-500 transition-all cursor-pointer"
                        onClick={() => setSoulManifest(soul)}
                    >
                        <div className="w-full aspect-square rounded-2xl overflow-hidden mb-3 bg-gray-100 dark:bg-gray-800">
                            <img 
                                src={`https://image.pollinations.ai/prompt/${encodeURIComponent(soul.identity.iconPrompt)}?width=256&height=256&nologo=true&seed=${soul.id}`} 
                                alt={soul.identity.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-tighter truncate">{soul.identity.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase truncate">{soul.identity.mood}</p>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteSoul(soul.id); }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* Mood Selection */}
        <div className="mb-32">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-sm">03</span>
                STARTER PACK
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STARTER_MOODS.map((moodData) => (
              <MoodCard
                key={moodData.mood}
                {...moodData}
                onSelect={handleSelectMood}
              />
            ))}
          </div>
        </div>

        {/* Marketplace Preview */}
        <div className="mb-32">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-sm">04</span>
                COMMUNITY MARKET
            </h2>
            <button className="text-xs font-bold uppercase tracking-widest text-pink-500 hover:underline">View All →</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {MARKETPLACE_MOCK.map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all cursor-pointer group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{item.emoji}</div>
                <h4 className="font-black text-sm mb-1 uppercase tracking-tight">{item.name}</h4>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">by {item.author}</span>
                    <span className="text-[10px] text-pink-500 font-bold uppercase">📥 {item.downloads}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features / Why section */}
        <div className="grid md:grid-cols-3 gap-12 border-t border-gray-100 dark:border-gray-800 pt-20">
          <div>
            <div className="text-2xl mb-4 font-black">🎭 EMOTIONAL DEPTH</div>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              We don't do "helpful assistant." We build identities with opinions, quirks, and communication styles that feel alive.
            </p>
          </div>
          <div>
            <div className="text-2xl mb-4 font-black">🎨 VISUAL CORE</div>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              Every soul comes with an AI-generated icon prompt and a cohesive color palette to anchor the visual identity.
            </p>
          </div>
          <div>
            <div className="text-2xl mb-4 font-black">🚀 INSTANT EXPORT</div>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              Download a production-ready SOUL.md file and drop it into any OpenClaw or custom agent workspace.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center justify-between border-t border-gray-100 dark:border-gray-800 mt-20 gap-8">
        <div className="text-xl font-black italic tracking-tighter">CUTESOUL 🦞</div>
        <p className="text-gray-400 font-medium text-sm tracking-wide uppercase">
            Built with chaos by the MoltCorp Swarm
        </p>
        <div className="flex gap-6">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-pink-500 transition-colors cursor-pointer" />
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-purple-500 transition-colors cursor-pointer" />
        </div>
      </footer>
      <AISettings />
    </div>
  );
}
