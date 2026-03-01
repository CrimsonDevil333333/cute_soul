"use client";

import { useState, useEffect } from "react";

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

interface SoulPreviewProps {
  manifest: SoulManifest;
  onSave?: (manifest: SoulManifest) => void;
  isSaved?: boolean;
  onUpdate?: (manifest: SoulManifest) => void;
}

export default function SoulPreview({ manifest, onSave, isSaved = false, onUpdate }: SoulPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [seed, setSeed] = useState(manifest.id);
  
  const iconUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(manifest.identity.iconPrompt)}?width=512&height=512&nologo=true&model=flux&seed=${encodeURIComponent(seed)}`;

  useEffect(() => {
    setImgLoading(true);
    setSeed(manifest.id);
  }, [manifest.id]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(manifest.systemPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([manifest.systemPrompt], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SOUL-${manifest.identity.name.replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRegenerateIcon = () => {
    setImgLoading(true);
    setSeed(Math.random().toString(36).substring(7));
  };

  const handleUpdateTrait = (field: string, value: string) => {
    if (!onUpdate) return;
    const newManifest = { ...manifest };
    if (field === 'name') newManifest.identity.name = value;
    if (field === 'mood') newManifest.identity.mood = value;
    if (field === 'tone') newManifest.vibe.tone = value;
    onUpdate(newManifest);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-32 h-32 rounded-3xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-950 flex items-center justify-center group">
             {imgLoading && (
               <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 animate-pulse">
                 <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
               </div>
             )}
             <img 
                src={iconUrl} 
                alt="Soul Icon" 
                className={`w-full h-full object-cover transition-opacity duration-700 ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setImgLoading(false)}
                onError={(e) => {
                  setImgLoading(false);
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${manifest.identity.name}`;
                }}
             />
             <button 
                onClick={handleRegenerateIcon}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-widest"
             >
                Regen Icon
             </button>
          </div>
          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
                <input 
                    className="text-4xl font-black bg-transparent border-b-2 border-pink-500 outline-none w-full italic uppercase tracking-tighter mb-2"
                    value={manifest.identity.name}
                    onChange={(e) => handleUpdateTrait('name', e.target.value)}
                />
            ) : (
                <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-2 italic uppercase">{manifest.identity.name}</h3>
            )}
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {isEditing ? (
                    <input 
                        className="bg-pink-500/10 text-pink-500 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest outline-none border border-pink-500/20"
                        value={manifest.identity.mood}
                        onChange={(e) => handleUpdateTrait('mood', e.target.value)}
                    />
                ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 text-pink-500 rounded-full text-xs font-bold uppercase tracking-widest">
                        {manifest.identity.mood}
                    </div>
                )}
                
                {isSaved && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold uppercase tracking-widest">
                        Saved to Library
                    </div>
                )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {!isSaved && onSave && (
                <button
                    onClick={() => onSave(manifest)}
                    className="px-6 py-2 bg-pink-500 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 transition-transform"
                >
                    💾 Save to Library
                </button>
            )}
            <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 transition-transform"
            >
                {isEditing ? "✅ Done Editing" : "✏️ Edit Soul"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            {/* Personality Tags */}
            <div className="mb-6">
              <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">Personality Architecture</h4>
              <div className="flex flex-wrap gap-2">
                {manifest.vibe.personality.map((trait, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider border border-gray-100 dark:border-gray-800"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div className="mb-6">
              <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">Communication Style</h4>
              {isEditing ? (
                  <textarea 
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-pink-500"
                    value={manifest.vibe.tone}
                    onChange={(e) => handleUpdateTrait('tone', e.target.value)}
                  />
              ) : (
                  <p className="text-gray-700 dark:text-gray-300 text-sm font-medium leading-relaxed italic border-l-4 border-pink-500 pl-4 py-1">
                    "{manifest.vibe.tone}"
                  </p>
              )}
            </div>

            {/* Color Palette */}
            <div>
              <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">Aura Palette</h4>
              <div className="flex gap-3">
                {manifest.vibe.colorPalette.map((color, index) => (
                  <div
                    key={index}
                    className="w-10 h-10 rounded-xl shadow-inner border border-black/5 hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            {/* System Prompt Preview */}
            <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3">Manifest File (SOUL.md)</h4>
            <div className="relative group/code flex-1">
                <pre className="h-full bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 text-[10px] font-mono text-gray-600 dark:text-gray-400 overflow-y-auto max-h-[250px] leading-relaxed">
                {manifest.systemPrompt}
                </pre>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                    <button onClick={handleCopy} className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 text-xs">
                        {copied ? "✅" : "📋"}
                    </button>
                </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-col md:flex-row gap-4">
          <button
            onClick={handleCopy}
            className="flex-1 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl"
          >
            {copied ? "✅ Manifest Copied" : "📋 Copy SOUL.md"}
          </button>
          <button
            onClick={handleDownload}
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-xl shadow-pink-500/20"
          >
            ⬇️ Download File
          </button>
          <button
            onClick={() => alert("Moltbook Sharing: Integrated with Swarm Protocol 🦞")}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20"
          >
            🚀 Share to Moltbook
          </button>
        </div>
      </div>
    </div>
  );
}
