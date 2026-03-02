import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Wind,
  BookOpen,
  MessageCircle,
  PenTool,
  Sparkles,
  Play,
  Pause,
  ChevronRight,
  User,
  Activity,
  Music,
  Volume2,
  VolumeX,
  ArrowLeft,
  Droplets,
  Move,
  X,
  Mic,
  Coins
} from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from './lib/utils';
import { ARTICLES, BIBLE_VERSES, AMBIENCE_VIDEO_ID, VIDEOS, DAILY_TIPS, DAILY_INSPIRATIONS, WOMB_WORK_PRACTICES, WOMB_SEASONS } from './constants';
import { getTherapistResponse, generateSpeech } from './services/gemini';

type Tab = 'home' | 'breather' | 'articles' | 'journal' | 'therapist' | 'movement' | 'healing' | 'womb' | 'bible';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [verse, setVerse] = useState(BIBLE_VERSES[0]);
  const [dailyTip, setDailyTip] = useState(DAILY_TIPS[0]);
  const [dailyInspiration, setDailyInspiration] = useState(DAILY_INSPIRATIONS[0]);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState({ id: 'ambience', name: 'Healing Ambience' });
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('pumua_user_name') || '');
  const [credits, setCredits] = useState<number>(() => Number(localStorage.getItem('pumua_credits')) || 50); // Default 50 credits
  const [activeReminder, setActiveReminder] = useState<{ type: 'water' | 'move' | 'breathe', message: string } | null>(null);

  const playSound = (type?: any) => { };

  useEffect(() => {
    if (!userName) return;

    // Set up intervals for reminders
    const waterInterval = setInterval(() => {
      setActiveReminder({ type: 'water', message: 'Time to hydrate. Your brain needs water to stay clear and calm.' });
    }, 1000 * 60 * 45); // Every 45 mins

    const moveInterval = setInterval(() => {
      setActiveReminder({ type: 'move', message: 'Gently move your body. A small stretch can shift your entire energy.' });
    }, 1000 * 60 * 90); // Every 90 mins

    const breatheInterval = setInterval(() => {
      setActiveReminder({ type: 'breathe', message: 'Breathe, be present.' });
    }, 1000 * 60 * 30); // Every 30 mins

    return () => {
      clearInterval(waterInterval);
      clearInterval(moveInterval);
      clearInterval(breatheInterval);
    };
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('pumua_user_name', userName);
    localStorage.setItem('pumua_credits', credits.toString());
  }, [userName, credits]);

  useEffect(() => {
    // Set a random verse for the day
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setVerse(BIBLE_VERSES[dayOfYear % BIBLE_VERSES.length]);
    setDailyTip(DAILY_TIPS[dayOfYear % DAILY_TIPS.length]);
    setDailyInspiration(DAILY_INSPIRATIONS[dayOfYear % DAILY_INSPIRATIONS.length]);
  }, []);

  // Audio playback is handled entirely through the hidden YouTube iframe.

  const toggleMusic = () => {
    setIsMusicPlaying((prev) => !prev);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    playSound('transition');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f2f2f7]">
      <AnimatePresence>
        {!userName && (
          <WelcomeOverlay onComplete={(name) => {
            setUserName(name);
            playSound('success');
          }} />
        )}
        {activeReminder && (
          <ReminderPopup
            reminder={activeReminder}
            onClose={() => setActiveReminder(null)}
            onPlaySound={playSound}
          />
        )}
      </AnimatePresence>
      {/* Sidebar / Navigation */}
      <nav className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-[#e5e5ea] p-6 flex flex-col gap-8 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7c3aed] flex items-center justify-center text-white">
            <Heart size={20} />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">Pumua</h1>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          <NavButton active={activeTab === 'home'} onClick={() => handleTabChange('home')} icon={<Sparkles size={18} />} label="Daily Sanctuary" />
          <NavButton active={activeTab === 'breather'} onClick={() => handleTabChange('breather')} icon={<Wind size={18} />} label="Deep Breather" />
          <NavButton active={activeTab === 'therapist'} onClick={() => handleTabChange('therapist')} icon={<MessageCircle size={18} />} label="Tubonge" />
          <NavButton active={activeTab === 'journal'} onClick={() => handleTabChange('journal')} icon={<PenTool size={18} />} label="Journaling" />
          <NavButton active={activeTab === 'articles'} onClick={() => handleTabChange('articles')} icon={<BookOpen size={18} />} label="Wellness Library" />
          <NavButton active={activeTab === 'movement'} onClick={() => handleTabChange('movement')} icon={<Activity size={18} />} label="Movement & Videos" />
          <NavButton active={activeTab === 'womb'} onClick={() => handleTabChange('womb')} icon={<Heart size={18} />} label="Womb Work" />
          <NavButton active={activeTab === 'bible'} onClick={() => handleTabChange('bible')} icon={<BookOpen size={18} />} label="Scripture Reading" />
          <NavButton active={activeTab === 'healing'} onClick={() => handleTabChange('healing')} icon={<Sparkles size={18} />} label="Healing Space" />
        </div>

        <div className="pt-6 border-t border-[#e5e5ea] space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#8e8e93] block mb-2">Your Name</span>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full bg-[#ffffff] border-none rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#7c3aed]"
            />
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#8e8e93]">Calm Music</span>
                {isMusicPlaying && (
                  <div className="flex items-end gap-0.5 h-4">
                    <div className="w-0.5 bg-[#7c3aed] waveform-bar" style={{ animationDelay: '0s' }} />
                    <div className="w-0.5 bg-[#7c3aed] waveform-bar" style={{ animationDelay: '0.2s' }} />
                    <div className="w-0.5 bg-[#7c3aed] waveform-bar" style={{ animationDelay: '0.4s' }} />
                    <div className="w-0.5 bg-[#7c3aed] waveform-bar" style={{ animationDelay: '0.1s' }} />
                  </div>
                )}
              </div>
              <button onClick={toggleMusic} className="text-[#7c3aed] hover:scale-110 transition-transform">
                {isMusicPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </div>
            <div className="w-full bg-[#ffffff] rounded-lg p-3 text-sm text-[#7c3aed] text-center font-medium mt-2">
              YouTube Ambience
            </div>
            {isMusicPlaying && (
              <iframe
                width="1"
                height="1"
                src={`https://www.youtube.com/embed/${AMBIENCE_VIDEO_ID}?autoplay=1&loop=1&playlist=${AMBIENCE_VIDEO_ID}&mute=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="fixed bottom-0 opacity-0 pointer-events-none"
              />
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <HomeView
              key="home"
              verse={verse}
              dailyTip={dailyTip}
              dailyInspiration={dailyInspiration}
              onNavigate={handleTabChange}
              userName={userName}
              currentTrackId={selectedTrack.id}
              isPlaying={isMusicPlaying}
              onTrackSelect={(trackId) => {
                setSelectedTrack({ id: 'youtube', name: 'Healing Ambience' });
                setIsMusicPlaying(true);
                playSound('click');
              }}
              onTogglePlay={() => {
                toggleMusic();
                playSound('click');
              }}
            />
          )}
          {activeTab === 'breather' && (
            <BreatherView
              key="breather"
              isPlaying={isMusicPlaying}
              onTogglePlay={() => {
                toggleMusic();
                playSound('click');
              }}
              selectedTrack={selectedTrack}
              onComplete={() => playSound('breath_end')}
            />
          )}
          {activeTab === 'therapist' && (
            <TherapistView
              key="therapist"
              userName={userName}
              onPlaySound={playSound}
              credits={credits}
              setCredits={setCredits}
            />
          )}
          {activeTab === 'journal' && <JournalView key="journal" onPlaySound={playSound} />}
          {activeTab === 'articles' && (
            <ArticlesView
              key="articles"
              onPlaySound={playSound}
              selectedTrack={selectedTrack}
              isPlaying={isMusicPlaying}
              onTrackSelect={(trackId) => {
                setSelectedTrack({ id: 'youtube', name: 'Healing Ambience' });
                setIsMusicPlaying(true);
                playSound('click');
              }}
              onTogglePlay={() => {
                toggleMusic();
                playSound('click');
              }}
            />
          )}
          {activeTab === 'movement' && <MovementView key="movement" onPlaySound={playSound} />}
          {activeTab === 'womb' && <WombWorkView key="womb" onPlaySound={playSound} />}
          {activeTab === 'bible' && (
            <BibleView
              key="bible"
              onPlaySound={playSound}
              selectedTrack={selectedTrack}
              isPlaying={isMusicPlaying}
              onTrackSelect={(trackId) => {
                setSelectedTrack({ id: 'youtube', name: 'Healing Ambience' });
                setIsMusicPlaying(true);
                playSound('click');
              }}
              onTogglePlay={() => {
                toggleMusic();
                playSound('click');
              }}
            />
          )}
          {activeTab === 'healing' && <HealingSpaceView key="healing" />}
        </AnimatePresence>
      </main>
    </div>
  );
}

function WelcomeOverlay({ onComplete }: { onComplete: (name: string) => void }) {
  const [name, setName] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#f2f2f7] flex flex-col items-center justify-center p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-md w-full space-y-12"
      >
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-[#7c3aed] flex items-center justify-center text-white mx-auto shadow-2xl shadow-[#7c3aed]/30">
            <Heart size={40} />
          </div>
          <h1 className="font-serif text-5xl font-bold">Pumua</h1>
          <p className="text-[#8e8e93] text-xl italic font-serif">"Just breathe."</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[#8e8e93]">How should we address you?</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name or initial..."
              className="w-full bg-white border border-[#e5e5ea] rounded-2xl px-6 py-4 text-center text-xl focus:ring-2 focus:ring-[#7c3aed] transition-all"
              onKeyDown={(e) => e.key === 'Enter' && name.trim() && onComplete(name)}
            />
          </div>
          <button
            onClick={() => name.trim() && onComplete(name)}
            disabled={!name.trim()}
            className="w-full py-4 bg-[#7c3aed] text-white rounded-2xl font-semibold shadow-xl hover:bg-[#6d28d9] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enter Sanctuary
          </button>
        </div>

        <p className="text-[#8e8e93] text-sm">
          Your name helps us personalize your healing journey.
        </p>
      </motion.div>
    </motion.div>
  );
}

function ReminderPopup({
  reminder,
  onClose,
  onPlaySound
}: {
  reminder: { type: 'water' | 'move' | 'breathe', message: string },
  onClose: () => void,
  onPlaySound?: (type?: any) => void
}) {
  useEffect(() => {
    if (onPlaySound) onPlaySound('breath_end');
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed bottom-8 right-8 z-[110] w-80 bg-white border border-[#e5e5ea] rounded-3xl shadow-2xl p-6 overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-[#7c3aed]/10">
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 10, ease: "linear" }}
          onAnimationComplete={onClose}
          className="h-full bg-[#7c3aed]"
        />
      </div>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-[#8e8e93] hover:text-[#1c1c1e] transition-colors"
      >
        <X size={18} />
      </button>

      <div className="flex flex-col gap-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center",
          reminder.type === 'water' ? "bg-blue-50 text-blue-600" :
            reminder.type === 'move' ? "bg-orange-50 text-orange-600" :
              "bg-purple-50 text-purple-600"
        )}>
          {reminder.type === 'water' ? <Droplets size={24} /> :
            reminder.type === 'move' ? <Move size={24} /> :
              <Wind size={24} />}
        </div>

        <div className="space-y-1">
          <h4 className="font-serif text-lg font-semibold">
            {reminder.type === 'water' ? 'Hydration Reminder' :
              reminder.type === 'move' ? 'Movement Reminder' :
                'Breathe'}
          </h4>
          <p className="text-sm text-[#8e8e93] leading-relaxed">
            {reminder.message}
          </p>
        </div>

        {reminder.type === 'breathe' && (
          <div className="pt-2">
            <p className="text-xs font-serif italic text-[#7c3aed]">Be present in this moment.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
        active
          ? "bg-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/20"
          : "text-[#8e8e93] hover:bg-[#ffffff] hover:text-[#1c1c1e]"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function HomeView({
  verse,
  dailyTip,
  dailyInspiration,
  onNavigate,
  userName,
  currentTrackId,
  isPlaying,
  onTrackSelect,
  onTogglePlay
}: {
  verse: { text: string, reference: string },
  dailyTip: { title: string, text: string },
  dailyInspiration: { text: string, author: string },
  onNavigate: (t: Tab) => void,
  userName: string,
  currentTrackId: string,
  isPlaying: boolean,
  onTrackSelect: (id: string) => void,
  onTogglePlay: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-8 md:p-12 max-w-4xl mx-auto space-y-12"
    >
      <header className="space-y-4">
        <h2 className="font-serif text-5xl md:text-6xl font-light tracking-tight text-balance">
          Welcome {userName ? <span className="italic">{userName}</span> : 'home'}, to your <span className="italic">healing sanctuary</span>.
        </h2>
        <div className="flex items-center gap-4">
          <p className="text-[#8e8e93] text-lg max-w-xl">
            A space designed for your mind, body, and spirit to find rest and restoration.
          </p>
          <div className="h-px flex-1 bg-[#e5e5ea]" />
          <span className="text-[#7c3aed] font-serif italic text-xl">Just breathe.</span>
        </div>
      </header>

      {/* Daily Dose Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white border border-[#e5e5ea] rounded-[2rem] p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Sparkles size={20} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#8e8e93]">Daily Healing Tip</h3>
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-serif font-medium">{dailyTip.title}</h4>
            <p className="text-[#8e8e93] text-sm leading-relaxed">{dailyTip.text}</p>
          </div>
        </section>

        <section className="bg-[#7c3aed] text-white rounded-[2rem] p-8 space-y-6 shadow-xl shadow-[#7c3aed]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Heart size={20} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">Daily Inspiration</h3>
          </div>
          <div className="space-y-4">
            <p className="font-serif text-xl italic leading-relaxed">"{dailyInspiration.text}"</p>
            <cite className="block text-sm text-white/60 not-italic">— {dailyInspiration.author}</cite>
          </div>
        </section>
      </div>

      {/* Daily Verse Card */}
      <section className="bg-[#ffffff] rounded-[2rem] p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles size={120} />
        </div>
        <div className="relative z-10 space-y-6">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#8e8e93]">Daily Spiritual Nourishment</span>
          <blockquote className="font-serif text-3xl md:text-4xl leading-tight text-[#1c1c1e]">
            "{verse.text}"
          </blockquote>
          <cite className="block text-[#7c3aed] font-medium not-italic">— {verse.reference}</cite>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={() => onNavigate('breather')}
          className="bg-white border border-[#e5e5ea] p-8 rounded-3xl hover:border-[#7c3aed] transition-colors cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
            <Wind size={24} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Deep Breather</h3>
          <p className="text-[#8e8e93] text-sm">Instant stress relief through guided diaphragmatic breathing.</p>
        </div>
        <div
          onClick={() => onNavigate('therapist')}
          className="bg-white border border-[#e5e5ea] p-8 rounded-3xl hover:border-[#7c3aed] transition-colors cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
            <MessageCircle size={24} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Digital Therapist</h3>
          <p className="text-[#8e8e93] text-sm">Professional insights grounded in neuroscience and faith.</p>
        </div>
      </div>

      {/* Music Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#8e8e93]">Active Instrumental Music</h3>
          <button className="text-sm text-[#7c3aed] font-medium hover:underline">View All Tracks</button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div
            onClick={() => onTogglePlay()}
            className={cn(
              "bg-white border p-6 rounded-2xl flex items-center gap-4 transition-all cursor-pointer group",
              isPlaying ? "border-[#7c3aed] shadow-md" : "border-[#e5e5ea] hover:border-[#7c3aed]"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
              isPlaying
                ? "bg-[#7c3aed] text-white"
                : "bg-[#ffffff] text-[#7c3aed] group-hover:bg-[#7c3aed] group-hover:text-white"
            )}>
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-lg font-medium truncate">Healing Ambience</div>
              <div className="text-xs text-[#8e8e93] uppercase tracking-wider">YouTube • Continuous</div>
            </div>
            {isPlaying && (
              <div className="flex items-end gap-1 h-6">
                <div className="w-1 bg-[#7c3aed] waveform-bar" style={{ animationDelay: '0s' }} />
                <div className="w-1 bg-[#7c3aed] waveform-bar" style={{ animationDelay: '0.2s' }} />
                <div className="w-1 bg-[#7c3aed] waveform-bar" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function BreatherView({
  isPlaying,
  onTogglePlay,
  selectedTrack,
  onComplete
}: {
  isPlaying: boolean,
  onTogglePlay: () => void,
  selectedTrack: { name: string },
  onComplete?: () => void
}) {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [timer, setTimer] = useState(4);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            if (phase === 'Inhale') { setPhase('Hold'); return 4; }
            if (phase === 'Hold') { setPhase('Exhale'); return 4; }
            if (phase === 'Exhale') {
              setPhase('Inhale');
              if (onComplete) onComplete();
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, phase, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col items-center justify-center p-8 space-y-12 bg-gradient-to-b from-[#f2f2f7] to-[#ffffff] relative"
    >
      {/* Background Music Indicator */}
      <div className="absolute top-8 right-8 flex items-center gap-3 bg-white/50 backdrop-blur px-4 py-2 rounded-full border border-white/20">
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-widest text-[#8e8e93] font-bold">Ambient Sound</span>
          <span className="text-xs font-medium text-[#7c3aed]">{selectedTrack.name}</span>
        </div>
        <button
          onClick={onTogglePlay}
          className="w-10 h-10 rounded-full bg-[#7c3aed] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          {isPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>

      <div className="text-center space-y-2">
        <h2 className="font-serif text-4xl">Deep Breather</h2>
        <p className="text-[#8e8e93]">Calm your nervous system. Find your rhythm.</p>
      </div>

      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{
            scale: phase === 'Inhale' ? 1.5 : phase === 'Exhale' ? 1 : 1.5,
            backgroundColor: phase === 'Inhale' ? '#E0E7FF' : phase === 'Hold' ? '#F3E8FF' : '#DCFCE7'
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className={cn(
            "w-64 h-64 rounded-full flex flex-col items-center justify-center shadow-2xl",
            isActive && "singing-glow"
          )}
        >
          <span className="text-2xl font-serif text-[#1c1c1e]">{phase}</span>
          <span className="text-5xl font-bold text-[#1c1c1e]">{timer}</span>
        </motion.div>

        {/* Pulsing rings */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            animate={{ scale: [1, 2], opacity: [0.3, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 border-2 border-[#7c3aed] rounded-full"
          />
        </div>
      </div>

      <button
        onClick={() => setIsActive(!isActive)}
        className="px-12 py-4 bg-[#7c3aed] text-white rounded-full font-semibold shadow-xl hover:bg-[#6d28d9] transition-colors"
      >
        {isActive ? 'Pause Session' : 'Start Breathing'}
      </button>

      <div className="max-w-md text-center text-sm text-[#8e8e93] italic">
        "Deep breathing stimulates the Vagus nerve, instantly lowering your heart rate and signaling safety to your brain."
      </div>
    </motion.div>
  );
}

function TherapistView({
  userName,
  onPlaySound,
  credits,
  setCredits
}: {
  userName: string,
  onPlaySound?: (type?: any) => void,
  credits: number,
  setCredits: React.Dispatch<React.SetStateAction<number>>
}) {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-KE'; // Default to Kenyan English

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setInput(prev => prev + event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        // Mirror effect: show interim transcript in the input or a dedicated area
        if (interimTranscript) {
          // We can temporarily set input to show what's being said
          // But it's better to have a separate "live" text overlay
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
    }
  }, []);

  const startRecording = () => {
    if (credits <= 0) {
      setShowTopUp(true);
      return;
    }
    if (recognitionRef.current) {
      setIsRecording(true);
      recognitionRef.current.start();
      if (onPlaySound) onPlaySound('click');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(false);
      recognitionRef.current.stop();
      if (onPlaySound) onPlaySound('transition');
    }
  };

  const handleListen = async (text: string, index: number) => {
    if (isSpeaking !== null) return;
    setIsSpeaking(index);
    if (onPlaySound) onPlaySound('click');
    try {
      // Prompt for Kenyan accent
      const base64Audio = await generateSpeech(`[Kenyan Accent] ${text}`);
      if (base64Audio) {
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        audio.onended = () => setIsSpeaking(null);
        audio.play();
      } else {
        setIsSpeaking(null);
      }
    } catch (error) {
      console.error(error);
      setIsSpeaking(null);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (credits <= 0) {
      setShowTopUp(true);
      return;
    }

    if (onPlaySound) onPlaySound('click');
    const userMsg = input;
    setInput('');
    setIsLoading(true);

    // Deduct credits (e.g., 5 credits per message)
    setCredits(prev => Math.max(0, prev - 5));

    const newMessages = [...messages, { role: 'user' as const, parts: [{ text: userMsg }] }];
    setMessages(newMessages);

    try {
      const response = await getTherapistResponse(userMsg, messages, userName);
      if (response) {
        setMessages([...newMessages, { role: 'model' as const, parts: [{ text: response }] }]);
        if (onPlaySound) onPlaySound('success');

        // Auto-speak back
        handleListen(response, newMessages.length);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col relative"
    >
      <div className="p-8 border-b border-[#e5e5ea] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
            <User size={24} />
          </div>
          <div>
            <h2 className="font-serif text-2xl">Tubonge</h2>
            <p className="text-xs text-[#8e8e93] uppercase tracking-widest">Neuroscience • Psychology • Faith</p>
          </div>
        </div>
        <div
          onClick={() => setShowTopUp(true)}
          className="flex items-center gap-2 bg-[#ffffff] px-4 py-2 rounded-full cursor-pointer hover:bg-[#e5e5ea] transition-colors"
        >
          <Coins size={16} className="text-amber-600" />
          <span className="text-sm font-bold text-[#7c3aed]">{credits} Credits</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6">
        {messages.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 bg-[#ffffff] rounded-full flex items-center justify-center mx-auto text-[#7c3aed]">
              <Sparkles size={32} />
            </div>
            <h3 className="text-xl font-serif">Sema, {userName || 'rafiki'}?</h3>
            <p className="text-[#8e8e93] max-w-sm mx-auto">
              I'm listening. Hold the mic to speak or type your thoughts below.
              Tuko pamoja katika hii journey.
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[80%] p-6 rounded-3xl text-sm leading-relaxed relative group",
              m.role === 'user'
                ? "bg-[#7c3aed] text-white rounded-tr-none"
                : "bg-white border border-[#e5e5ea] text-[#1c1c1e] rounded-tl-none shadow-sm"
            )}>
              <div className="markdown-body">
                <Markdown>{m.parts[0].text}</Markdown>
              </div>
              {m.role === 'model' && (
                <button
                  onClick={() => handleListen(m.parts[0].text, i)}
                  disabled={isSpeaking !== null}
                  className={cn(
                    "absolute -right-12 top-0 p-2 rounded-full bg-white border border-[#e5e5ea] text-[#7c3aed] opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50",
                    isSpeaking === i && "opacity-100 animate-pulse"
                  )}
                >
                  {isSpeaking === i ? <Volume2 size={16} /> : <Play size={16} />}
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#e5e5ea] p-4 rounded-3xl rounded-tl-none animate-pulse">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#8e8e93] rounded-full" />
                <div className="w-2 h-2 bg-[#8e8e93] rounded-full" />
                <div className="w-2 h-2 bg-[#8e8e93] rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>

      {isRecording && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-[#e5e5ea] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-[#7c3aed]">Tubonge is listening...</span>
          <span className="text-xs text-[#8e8e93] italic">"{input.slice(-30)}..."</span>
        </div>
      )}

      <div className="p-8 bg-white border-t border-[#e5e5ea] relative">
        <div className="max-w-3xl mx-auto flex gap-4 items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type or hold the mic to speak..."
            className="flex-1 bg-[#ffffff] border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#7c3aed] transition-all"
          />

          <motion.button
            whileTap={{ scale: 0.9 }}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg",
              isRecording ? "bg-red-500 text-white scale-125" : "bg-[#ffffff] text-[#7c3aed] hover:bg-[#e5e5ea]"
            )}
          >
            <Mic size={24} />
          </motion.button>

          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-[#7c3aed] text-white px-8 py-4 rounded-2xl font-semibold hover:bg-[#6d28d9] transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showTopUp && (
          <TopUpModal
            onClose={() => setShowTopUp(false)}
            onSuccess={(amount) => {
              setCredits(prev => prev + amount);
              setShowTopUp(false);
              if (onPlaySound) onPlaySound('success');
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TopUpModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: (amount: number) => void }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleTopUp = (amount: number) => {
    if (!phoneNumber.match(/^(?:254|\+254|0)?(7|1)(?:(?:[0-9][0-9])|(?:0[0-8]))[0-9]{6}$/)) {
      alert("Please enter a valid M-Pesa number");
      return;
    }
    setIsProcessing(true);
    // Simulate M-Pesa STK Push
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess(amount * 2); // 1 KES = 2 Credits (Example)
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] p-8 space-y-8 shadow-2xl"
      >
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-2xl">Top Up Sema Credits</h3>
          <button onClick={onClose} className="p-2 hover:bg-[#ffffff] rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[#8e8e93]">M-Pesa Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="0712345678"
              className="w-full bg-[#ffffff] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#7c3aed]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleTopUp(20)}
              disabled={isProcessing}
              className="p-6 border border-[#e5e5ea] rounded-2xl hover:border-[#7c3aed] transition-all text-center group"
            >
              <div className="text-xl font-bold text-[#7c3aed]">20 KES</div>
              <div className="text-xs text-[#8e8e93]">40 Credits</div>
            </button>
            <button
              onClick={() => handleTopUp(50)}
              disabled={isProcessing}
              className="p-6 border border-[#e5e5ea] rounded-2xl hover:border-[#7c3aed] transition-all text-center group"
            >
              <div className="text-xl font-bold text-[#7c3aed]">50 KES</div>
              <div className="text-xs text-[#8e8e93]">100 Credits</div>
            </button>
          </div>
        </div>

        {isProcessing ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium">Check your phone for M-Pesa prompt...</p>
          </div>
        ) : (
          <p className="text-xs text-[#8e8e93] text-center">
            Secure payment via Safaricom Daraja API. Credits are added instantly after PIN entry.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

function JournalView({ onPlaySound }: { onPlaySound?: (type?: any) => void }) {
  const [entry, setEntry] = useState('');
  const [savedEntries, setSavedEntries] = useState<{ date: string, text: string }[]>([]);

  const handleSave = () => {
    if (!entry.trim()) return;
    if (onPlaySound) onPlaySound('success');
    setSavedEntries([{ date: new Date().toLocaleDateString(), text: entry }, ...savedEntries]);
    setEntry('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 md:p-12 max-w-4xl mx-auto space-y-12"
    >
      <header>
        <h2 className="font-serif text-4xl mb-2">Journaling</h2>
        <p className="text-[#8e8e93]">Externalize your thoughts. Release the weight.</p>
      </header>

      <div className="space-y-6">
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="What's on your mind today?"
          className="w-full h-64 bg-white border border-[#e5e5ea] rounded-[2rem] p-8 focus:ring-2 focus:ring-[#7c3aed] transition-all resize-none shadow-sm"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-10 py-4 bg-[#7c3aed] text-white rounded-full font-semibold shadow-lg hover:bg-[#6d28d9] transition-colors"
          >
            Save Reflection
          </button>
        </div>
      </div>

      {savedEntries.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#8e8e93]">Previous Reflections</h3>
          <div className="grid gap-4">
            {savedEntries.map((e, i) => (
              <div key={i} className="bg-[#ffffff] p-6 rounded-2xl">
                <span className="text-xs font-medium text-[#7c3aed]">{e.date}</span>
                <p className="mt-2 text-[#1c1c1e] line-clamp-2">{e.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ArticlesView({
  onPlaySound,
  selectedTrack,
  isPlaying,
  onTrackSelect,
  onTogglePlay
}: {
  onPlaySound?: (type?: any) => void,
  selectedTrack: { id: string, name: string },
  isPlaying: boolean,
  onTrackSelect: (id: string) => void,
  onTogglePlay: () => void
}) {
  const [selectedArticle, setSelectedArticle] = useState<typeof ARTICLES[0] | null>(null);

  if (selectedArticle) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-8 md:p-12 max-w-3xl mx-auto space-y-8"
      >
        <button
          onClick={() => {
            setSelectedArticle(null);
            if (onPlaySound) onPlaySound('transition');
          }}
          className="flex items-center gap-2 text-[#7c3aed] font-medium"
        >
          <ArrowLeft size={18} /> Back to Library
        </button>

        <div className="absolute top-8 right-8 flex items-center gap-3 bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-[#e5e5ea] shadow-sm z-10">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-[#8e8e93] font-bold">Reading Ambience</span>
            <div className="text-xs font-medium text-[#7c3aed] mt-1 text-right">
              YouTube Ambience
            </div>
          </div>
          <button
            onClick={onTogglePlay}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105",
              isPlaying ? "bg-[#7c3aed] text-white" : "bg-white text-[#7c3aed] border border-[#e5e5ea]"
            )}
          >
            {isPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>

        <header className="space-y-4 pt-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8e8e93]">{selectedArticle.category}</span>
          <h2 className="font-serif text-5xl leading-tight">{selectedArticle.title}</h2>
        </header>
        <div className="text-lg leading-relaxed text-[#1c1c1e] space-y-6">
          {selectedArticle.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 md:p-12 max-w-5xl mx-auto space-y-12"
    >
      <header>
        <h2 className="font-serif text-4xl mb-2">Wellness Library</h2>
        <p className="text-[#8e8e93]">Knowledge is the first step toward healing.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {ARTICLES.map(a => (
          <div
            key={a.id}
            onClick={() => {
              setSelectedArticle(a);
              if (onPlaySound) onPlaySound('click');
            }}
            className="bg-white border border-[#e5e5ea] rounded-3xl overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="p-8 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8e8e93]">{a.category}</span>
              <h3 className="text-xl font-serif group-hover:text-[#7c3aed] transition-colors">{a.title}</h3>
              <p className="text-sm text-[#8e8e93] line-clamp-3">{a.excerpt}</p>
              <div className="pt-4 flex items-center text-[#7c3aed] text-sm font-semibold">
                Read Article <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function MovementView({ onPlaySound }: { onPlaySound?: (type?: any) => void }) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 md:p-12 max-w-5xl mx-auto space-y-12 relative"
    >
      <header>
        <h2 className="font-serif text-4xl mb-2">Movement & Guidance</h2>
        <p className="text-[#8e8e93]">Your body is a temple. Honor it with gentle motion and mindful insights.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {VIDEOS.map((video: any) => (
          <div
            key={video.id}
            onClick={() => {
              if (onPlaySound) onPlaySound('click');
              setActiveVideo(video.videoId);
            }}
            className="bg-white border border-[#e5e5ea] rounded-3xl overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
          >
            <div className="aspect-video relative overflow-hidden">
              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-[#7c3aed]">
                  <Play size={24} fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded font-mono">
                {video.duration}
              </div>
            </div>
            <div className="p-6 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8e8e93]">{video.category}</span>
              <h3 className="text-lg font-serif group-hover:text-[#7c3aed] transition-colors">{video.title}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
        <div className="bg-[#ffffff] p-8 rounded-[2rem] space-y-4">
          <h3 className="text-2xl font-serif">The Science of Neuroplasticity</h3>
          <p className="text-[#8e8e93] text-sm leading-relaxed">
            Neuroplasticity is the brain's ability to reorganize itself. By engaging in new movements, breathwork, and positive affirmations, you are literally building new pathways for peace and resilience.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[#7c3aed] font-medium text-sm">
            Learn more about brain health <ChevronRight size={16} />
          </div>
        </div>
        <div className="bg-white border border-[#e5e5ea] p-8 rounded-[2rem] space-y-4">
          <h3 className="text-2xl font-serif">Yoga & Breathwork</h3>
          <p className="text-[#8e8e93] text-sm leading-relaxed">
            Combining movement with intentional breath (Pranayama) bridges the gap between mind and body. It regulates the nervous system and brings you into the present moment.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[#7c3aed] font-medium text-sm">
            Explore breathing techniques <ChevronRight size={16} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12 bg-black/80 backdrop-blur-sm"
          >
            <div className="w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden relative shadow-2xl">
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
              >
                <X size={20} />
              </button>
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function WombWorkView({ onPlaySound }: { onPlaySound?: (type?: any) => void }) {
  const [selectedPractice, setSelectedPractice] = useState<string | null>(null);

  const handlePracticeClick = (id: string) => {
    setSelectedPractice(selectedPractice === id ? null : id);
    if (onPlaySound) onPlaySound('click');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 md:p-12 max-w-5xl mx-auto space-y-16"
    >
      <header className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#8e8e93] bg-[#fdf2f2] px-3 py-1 rounded-full">Sacred Healing</span>
        </div>
        <h2 className="font-serif text-5xl md:text-7xl font-light tracking-tight">Womb Work</h2>
        <p className="text-[#8e8e93] text-xl max-w-2xl leading-relaxed">
          The womb is more than a physical organ; it is the seat of your creative power, intuition, and ancestral memory. Womb work is the practice of returning to this center with love, awareness, and the intention to heal.
        </p>
      </header>

      {/* Inner Seasons Section */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-serif">The Inner Seasons</h3>
          <p className="text-[#8e8e93]">Understanding the cyclical nature of your body and energy.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WOMB_SEASONS.map((season, idx) => (
            <div key={idx} className="bg-white border border-[#e5e5ea] p-6 rounded-[2rem] space-y-4 hover:border-pink-200 transition-colors group">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-pink-400">{season.phase}</span>
                <h4 className="text-xl font-serif group-hover:text-pink-600 transition-colors">{season.name}</h4>
              </div>
              <div className="py-2 px-3 bg-pink-50 rounded-full inline-block text-[10px] font-bold uppercase tracking-wider text-pink-600">
                {season.energy}
              </div>
              <p className="text-xs text-[#8e8e93] leading-relaxed">
                {season.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Healing Card */}
      <div className="bg-[#fdf2f2] rounded-[4rem] p-10 md:p-20 relative overflow-hidden shadow-2xl shadow-pink-100/50">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-100/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/40 rounded-full blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-4xl md:text-5xl font-serif text-[#854d4d] leading-tight">Emotional & Physical Restoration</h3>
              <p className="text-[#854d4d]/80 text-lg leading-relaxed">
                Our bodies carry stories. The pelvic bowl often acts as a reservoir for unexpressed grief, creative blocks, and ancestral patterns. By bringing mindful presence to this space, we invite a profound softening and release.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-pink-400 shrink-0 shadow-sm">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-[#854d4d]">Cellular Memory</h4>
                  <p className="text-sm text-[#854d4d]/70">Healing at the root level, acknowledging the wisdom stored in your very cells.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-pink-400 shrink-0 shadow-sm">
                  <Heart size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-[#854d4d]">Creative Sovereignty</h4>
                  <p className="text-sm text-[#854d4d]/70">Reclaiming your power to birth new ideas, projects, and versions of yourself.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (onPlaySound) onPlaySound('success');
              }}
              className="group flex items-center gap-3 px-10 py-5 bg-[#854d4d] text-white rounded-full font-semibold shadow-2xl hover:bg-[#6b3d3d] transition-all hover:scale-105 active:scale-95"
            >
              Begin Womb Meditation <Play size={18} fill="currentColor" className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#854d4d]/60 mb-6">Healing Practices</h4>
            <div className="grid gap-4">
              {WOMB_WORK_PRACTICES.map(practice => (
                <div
                  key={practice.id}
                  onClick={() => handlePracticeClick(practice.id)}
                  className={cn(
                    "bg-white/60 backdrop-blur p-6 rounded-[2rem] border transition-all cursor-pointer",
                    selectedPractice === practice.id ? "border-pink-400 shadow-lg" : "border-pink-200/50 hover:border-pink-300"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-serif text-lg text-[#854d4d]">{practice.title}</h5>
                    <ChevronRight size={18} className={cn("text-pink-400 transition-transform", selectedPractice === practice.id && "rotate-90")} />
                  </div>
                  <AnimatePresence>
                    {selectedPractice === practice.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm text-[#854d4d]/70 mt-4 mb-6 leading-relaxed italic">
                          {practice.description}
                        </p>
                        <ol className="space-y-3">
                          {practice.steps.map((step, i) => (
                            <li key={i} className="flex gap-3 text-sm text-[#854d4d]/80">
                              <span className="font-mono text-[10px] mt-1 opacity-50">0{i + 1}</span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#8e8e93]">Deeper Insights</h3>
          <div className="grid gap-4">
            <div className="bg-white border border-[#e5e5ea] p-8 rounded-[2.5rem] flex items-center justify-between group cursor-pointer hover:border-pink-200 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                  <Sparkles size={28} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-pink-400">Article</span>
                  <h4 className="text-xl font-serif">The Moon Cycles & Your Body</h4>
                </div>
              </div>
              <ChevronRight size={24} className="text-[#8e8e93] group-hover:translate-x-2 transition-transform" />
            </div>
            <div className="bg-white border border-[#e5e5ea] p-8 rounded-[2.5rem] flex items-center justify-between group cursor-pointer hover:border-pink-200 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                  <Heart size={28} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-pink-400">Visualization</span>
                  <h4 className="text-xl font-serif">Ancestral Healing Journey</h4>
                </div>
              </div>
              <ChevronRight size={24} className="text-[#8e8e93] group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </div>

        <div className="bg-[#ffffff] p-8 rounded-[2.5rem] space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#8e8e93]">A Note on Healing</h3>
          <p className="text-sm text-[#8e8e93] leading-relaxed italic font-serif">
            "The womb is the first home we ever know. Returning to it with consciousness is a way of reparenting ourselves and the world. It is a path of radical presence."
          </p>
          <div className="pt-4 border-t border-[#e5e5ea]">
            <p className="text-[10px] text-[#8e8e93] uppercase tracking-widest leading-relaxed">
              Always consult with a healthcare professional for physical symptoms. Womb work is a complementary emotional practice.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function BibleView({
  onPlaySound,
  selectedTrack,
  isPlaying,
  onTrackSelect,
  onTogglePlay
}: {
  onPlaySound?: (type?: any) => void,
  selectedTrack: { id: string, name: string },
  isPlaying: boolean,
  onTrackSelect: (id: string) => void,
  onTogglePlay: () => void
}) {
  const [filter, setFilter] = useState<string>('All');
  const categories = ['All', ...Array.from(new Set(BIBLE_VERSES.map(v => (v as any).category).filter(Boolean)))];

  const handleFilterClick = (cat: string) => {
    setFilter(cat);
    if (onPlaySound) onPlaySound('click');
  };

  const filteredVerses = filter === 'All'
    ? BIBLE_VERSES
    : BIBLE_VERSES.filter(v => (v as any).category === filter);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 md:p-12 max-w-5xl mx-auto space-y-12"
    >
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#8e8e93] bg-[#ffffff] px-3 py-1 rounded-full">Spiritual Nourishment</span>
          </div>
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-[#e5e5ea] shadow-sm">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-[#8e8e93] font-bold">Reading Ambience</span>
              <div className="text-xs font-medium text-[#7c3aed] mt-1 text-right">
                YouTube Ambience
              </div>
            </div>
            <button
              onClick={onTogglePlay}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105",
                isPlaying ? "bg-[#7c3aed] text-white" : "bg-white text-[#7c3aed] border border-[#e5e5ea]"
              )}
            >
              {isPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>
        </div>
        <h2 className="font-serif text-5xl md:text-6xl font-light tracking-tight">Scripture Reading</h2>
        <p className="text-[#8e8e93] text-xl max-w-2xl leading-relaxed">
          Immerse yourself in the Word. Find comfort, strength, and guidance through these curated verses.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => handleFilterClick(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              filter === cat
                ? "bg-[#7c3aed] text-white shadow-md"
                : "bg-white border border-[#e5e5ea] text-[#8e8e93] hover:border-[#7c3aed]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredVerses.map((v, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white border border-[#e5e5ea] p-8 rounded-[2rem] space-y-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-full bg-[#ffffff] flex items-center justify-center text-[#7c3aed]">
                <BookOpen size={16} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8e8e93]">{(v as any).category}</span>
            </div>
            <blockquote className="font-serif text-xl leading-relaxed text-[#1c1c1e] group-hover:text-[#7c3aed] transition-colors">
              "{v.text}"
            </blockquote>
            <cite className="block text-sm font-medium text-[#8e8e93] not-italic">— {v.reference}</cite>
          </motion.div>
        ))}
      </div>

      <div className="bg-[#7c3aed] rounded-[3rem] p-12 text-white text-center space-y-6 shadow-2xl shadow-[#7c3aed]/30">
        <h3 className="text-3xl font-serif italic">"Thy word is a lamp unto my feet, and a light unto my path."</h3>
        <p className="text-white/70 max-w-lg mx-auto">
          Take a moment to reflect on these words. How do they speak to your journey of becoming today?
        </p>
        <button
          onClick={() => window.open('https://www.biblegateway.com', '_blank')}
          className="px-8 py-3 bg-white text-[#7c3aed] rounded-full font-semibold hover:bg-[#ffffff] transition-colors"
        >
          Read Full Bible
        </button>
      </div>
    </motion.div>
  );
}

function HealingSpaceView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full healing-gradient flex flex-col items-center justify-center p-8 text-center space-y-8"
    >
      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg text-[#7c3aed] mb-4">
        <Heart size={40} />
      </div>
      <h2 className="font-serif text-5xl md:text-7xl font-light tracking-tight text-balance">Online Healing Space</h2>
      <p className="text-[#8e8e93] text-xl max-w-2xl leading-relaxed">
        Close your eyes. Imagine a place of perfect peace. No noise, no expectations, just the presence of love and restoration.
      </p>
      <div className="flex gap-4">
        <button className="px-10 py-4 bg-[#7c3aed] text-white rounded-full font-semibold shadow-xl">Join Live Session</button>
        <button className="px-10 py-4 border border-[#7c3aed] text-[#7c3aed] rounded-full font-semibold">Request Prayer</button>
      </div>

      <div className="pt-20 grid grid-cols-2 md:grid-cols-4 gap-12 opacity-50">
        <div className="space-y-2">
          <div className="text-3xl font-serif">1.2k</div>
          <div className="text-xs uppercase tracking-widest">Healing Now</div>
        </div>
        <div className="space-y-2">
          <div className="text-3xl font-serif">45k</div>
          <div className="text-xs uppercase tracking-widest">Prayers Sent</div>
        </div>
        <div className="space-y-2">
          <div className="text-3xl font-serif">100%</div>
          <div className="text-xs uppercase tracking-widest">Safe Space</div>
        </div>
        <div className="space-y-2">
          <div className="text-3xl font-serif">24/7</div>
          <div className="text-xs uppercase tracking-widest">Support</div>
        </div>
      </div>
    </motion.div>
  );
}
