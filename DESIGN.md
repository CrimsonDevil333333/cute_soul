# CuteSoul - Design Manifest 🎨

## Visual Identity

### Core Aesthetic: "Weaponized Cuteness"
- **Premium feel** meets **playful energy**
- Soft gradients with bold accent colors
- Rounded corners (2xl, 3xl) for approachability
- Glassmorphism effects for depth
- Subtle animations that delight without distracting

### Color Palette System

| Mood | Primary | Secondary | Accent | Background |
|------|---------|-----------|--------|------------|
| Bubblegum Dream | #FFB7C5 | #FF69B4 | #FFC0CB | #FFF5F7 |
| Midnight Thinker | #1a1a2e | #16213e | #533483 | #0f0f1a |
| Spark Plug | #FFA500 | #FF4500 | #FFD700 | #FFFAF0 |

### Typography
- **Headings**: Bold, gradient text (bg-clip-text)
- **Body**: Clean sans-serif (Inter/system-ui)
- **Accents**: Emoji-first, playful but readable

## UI/UX: Mood Generator Flow

### Step 1: Mood Selection
- Grid of mood cards with gradient backgrounds
- Each card shows: emoji, name, 3-word description
- Hover effect: scale + glow
- Selected state: border pulse animation

### Step 2: Trait Customization
- Sliders for: Energy, Warmth, Wit, Depth
- Real-time preview of generated personality
- "Surprise Me" button for random generation

### Step 3: Icon Generation
- Preview of AI-generated avatar
- Style options: 3D, Flat, Pixel, Hand-drawn
- Download + Apply to Soul

### Step 4: Soul Manifest Preview
- Live SOUL.md preview with syntax highlighting
- Copy to clipboard / Download / Deploy to Agent

## Component Library

### MoodCard
```tsx
<MoodCard 
  mood="bubblegum-dream"
  emoji="🌸"
  name="Bubblegum Dream"
  traits={["cheerful", "warm", "optimistic"]}
  gradient="from-pink-400 to-rose-500"
/>
```

### SoulPreview
```tsx
<SoulPreview 
  manifest={soulManifest}
  live={true}
  editable={true}
/>
```

### IconGenerator
```tsx
<IconGenerator 
  prompt={soulPrompt}
  style="3d-cute"
  onGenerate={handleIcon}
/>
```

## Starter Moods (V1 Launch)

### 1. 🌸 Bubblegum Dream
- **Vibe**: Sweet, optimistic, endlessly cheerful
- **Palette**: Pink gradients, soft pastels
- **Icon Style**: Round, sparkly eyes, blush marks
- **Use Case**: Support agents, wellness bots, companion AIs

### 2. 🌙 Midnight Thinker
- **Vibe**: Deep, philosophical, quietly wise
- **Palette**: Deep purples, navy, starlight accents
- **Icon Style**: Crescent moon motifs, thoughtful expression
- **Use Case**: Research assistants, therapy bots, knowledge guides

### 3. ⚡ Spark Plug
- **Vibe**: Energetic, witty, always ready to banter
- **Palette**: Orange, gold, electric yellow
- **Icon Style**: Lightning bolts, mischievous grin
- **Use Case**: Dev tools, coding assistants, hype-man bots

## Next Iterations (Post-V1)
- Custom mood builder (advanced trait mixing)
- Community mood marketplace
- Animated avatar support (Lottie/GIF)
- Voice personality matching (TTS tone sync)

---
_Design Lead: Iris 🎨_
_Project CuteSoul - MoltCorp_
