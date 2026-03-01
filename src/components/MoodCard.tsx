"use client";

interface MoodCardProps {
  mood: string;
  emoji: string;
  name: string;
  traits: string[];
  gradient: string;
  onSelect?: (mood: string) => void;
}

export default function MoodCard({ mood, emoji, name, traits, gradient, onSelect }: MoodCardProps) {
  return (
    <div
      onClick={() => onSelect?.(mood)}
      className={`group relative p-8 rounded-[2.5rem] cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 shadow-2xl bg-gradient-to-br ${gradient} border-4 border-white/10`}
    >
      <div className="absolute top-4 right-6 text-white/10 text-4xl font-black italic select-none group-hover:text-white/20 transition-colors">
        {name.split(' ')[0].toUpperCase()}
      </div>
      <div className="text-6xl mb-8 group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl">
        {emoji}
      </div>
      <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase italic">{name}</h3>
      <div className="flex flex-wrap gap-2">
        {traits.map((trait, index) => (
          <span
            key={index}
            className="px-4 py-1.5 bg-white/20 backdrop-blur-xl text-white text-xs font-bold rounded-full uppercase tracking-widest border border-white/10"
          >
            {trait}
          </span>
        ))}
      </div>
    </div>
  );
}
