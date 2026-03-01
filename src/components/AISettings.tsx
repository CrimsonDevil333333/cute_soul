"use client";

import { useState, useEffect } from "react";

interface AIConfig {
  apiBase: string;
  apiKey: string;
  model: string;
  provider: "openrouter" | "ollama" | "custom";
}

export default function AISettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<AIConfig>({
    apiBase: "https://openrouter.ai/api/v1",
    apiKey: "",
    model: "openai/gpt-3.5-turbo",
    provider: "openrouter",
  });
  const [isConnected, setIsConnected] = useState(false);
  const [testing, setTesting] = useState(false);

  // Load config from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("cute_soul_ai_config");
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
        setIsConnected(true);
      } catch (e) {
        console.error("Failed to parse AI config:", e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("cute_soul_ai_config", JSON.stringify(config));
    setIsConnected(true);
    setIsOpen(false);
  };

  const handleClear = () => {
    localStorage.removeItem("cute_soul_ai_config");
    setConfig({
      apiBase: "https://openrouter.ai/api/v1",
      apiKey: "",
      model: "openai/gpt-3.5-turbo",
      provider: "openrouter",
    });
    setIsConnected(false);
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const response = await fetch(`${config.apiBase}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: "user", content: "Say 'ping' if you can read this." }],
          max_tokens: 10,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
          alert("✅ Connection successful! API is working.");
          setIsConnected(true);
        } else {
          alert("⚠️ API responded but no choices returned.");
        }
      } else {
        const error = await response.json();
        alert(`❌ Connection failed: ${error.error?.message || response.statusText}`);
      }
    } catch (error: any) {
      alert(`❌ Connection failed: ${error.message || "Network error"}`);
    } finally {
      setTesting(false);
    }
  };

  const presetProviders = [
    {
      name: "OpenRouter",
      apiBase: "https://openrouter.ai/api/v1",
      model: "openai/gpt-3.5-turbo",
      provider: "openrouter" as const,
    },
    {
      name: "Ollama (Local)",
      apiBase: "http://localhost:11434/v1",
      model: "llama3.2",
      provider: "ollama" as const,
    },
    {
      name: "Ollama (Network)",
      apiBase: "http://192.168.1.100:11434/v1",
      model: "llama3.2",
      provider: "ollama" as const,
    },
  ];

  return (
    <>
      {/* Floating Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50"
        title="AI Settings"
      >
        ⚙️
      </button>

      {/* Connection Status Indicator */}
      {isConnected && (
        <div className="fixed bottom-6 left-6 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-2 z-50">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-green-500 uppercase tracking-widest">AI Connected</span>
        </div>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black tracking-tight">⚡ AI Provider Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets */}
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                Quick Presets
              </label>
              <div className="grid grid-cols-3 gap-3">
                {presetProviders.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setConfig({
                      apiBase: preset.apiBase,
                      model: preset.model,
                      provider: preset.provider,
                      apiKey: config.apiKey,
                    })}
                    className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                      config.provider === preset.provider && config.apiBase === preset.apiBase
                        ? "bg-pink-500 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* API Base */}
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                API Base URL
              </label>
              <input
                type="text"
                value={config.apiBase}
                onChange={(e) => setConfig({ ...config, apiBase: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all font-mono text-sm"
                placeholder="https://api.example.com/v1"
              />
            </div>

            {/* API Key */}
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                API Key
              </label>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all font-mono text-sm"
                placeholder="sk-..."
              />
            </div>

            {/* Model */}
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                Model Name
              </label>
              <input
                type="text"
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition-all font-mono text-sm"
                placeholder="gpt-3.5-turbo, llama3.2, etc."
              />
            </div>

            {/* Test Connection */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleTest}
                disabled={testing || !config.apiKey}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black rounded-xl uppercase tracking-widest text-xs hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {testing ? "Testing..." : "🔌 Test Connection"}
              </button>
              {isConnected && (
                <button
                  onClick={handleClear}
                  className="px-6 py-3 bg-red-500/10 text-red-500 font-black rounded-xl uppercase tracking-widest text-xs hover:bg-red-500/20 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Info Box */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                🔒 <strong>Privacy First:</strong> Your API key is stored locally in your browser. 
                It never leaves your device except when making requests to your chosen AI provider.
              </p>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-black rounded-xl uppercase tracking-widest text-xs hover:opacity-90 transition-opacity shadow-lg shadow-pink-500/25"
            >
              💾 Save Configuration
            </button>
          </div>
        </div>
      )}
    </>
  );
}
