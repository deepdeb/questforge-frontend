import { useState, useEffect } from 'react';
import { Sword, Trophy, Zap, Target, Award, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playerAPI } from './lib/api';
import type { PlayerProgress } from './lib/api';
import Sidebar from './components/Sidebar';

const AVAILABLE_QUESTS = [
  { id: 1, title: "Daily Login", reward: 25, icon: Zap },
  { id: 2, title: "Complete a Task", reward: 35, icon: Target },
  { id: 3, title: "Write a Journal Entry", reward: 40, icon: Trophy },
];

function App() {
  const [progress, setProgress] = useState<PlayerProgress>({
    level: 1,
    xp: 0,
    quests_completed: 0,
    total_xp_earned: 0,
    xp_to_next: 100,
    username: "Adventurer",
  });

  const [achievements, setAchievements] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'achievements' | 'history'>('dashboard');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProgress();
    loadAchievements();
  }, []);

  const loadProgress = async () => {
    try {
      const data = await playerAPI.getProgress();
      setProgress(data);
    } catch (err) {
      console.error("Failed to load progress:", err);
    }
  };

  const loadAchievements = async () => {
    try {
      const res = await fetch('/api/achievements');
      if (res.ok) {
        const data = await res.json();
        setAchievements(data);
      }
    } catch (err) {
      console.error("Failed to load achievements:", err);
    }
  };

  const completeQuest = async (reward: number) => {
    setIsLoading(true);
    try {
      const result = await playerAPI.gainXP(reward);
      setProgress(result.progress);

      // Add to history
      setHistory(prev => [{
        id: Date.now(),
        quest: AVAILABLE_QUESTS.find(q => q.reward === reward)?.title || "Unknown Quest",
        xp: reward,
        timestamp: new Date().toISOString()
      }, ...prev]);

      // Check for level up
      if (result.progress.level > progress.level) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 2400);
      }

      // Refresh achievements in case any got unlocked
      loadAchievements();
    } catch (err) {
      console.error("Quest failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-72 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-linear-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center">
              <Sword className="w-7 h-7 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tighter">QuestForge</h1>
              <p className="text-emerald-400">Level {progress.level} • {progress.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-zinc-900 px-5 py-2.5 rounded-2xl">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="font-mono text-lg">{progress.quests_completed}</span>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between mb-2 text-sm">
            <span>Experience</span>
            <span className="font-mono">{progress.xp} / {progress.xp_to_next}</span>
          </div>
          <div className="h-4 bg-zinc-900 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-linear-to-r from-amber-400 via-yellow-400 to-amber-500"
              animate={{ width: `${(progress.xp / progress.xp_to_next) * 100}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-10 border-b border-zinc-800 mb-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Sword },
            { id: 'achievements', label: 'Achievements', icon: Award },
            { id: 'history', label: 'History', icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-4 text-lg font-medium transition-all relative ${
                activeTab === tab.id
                  ? 'text-amber-400'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded"
                />
              )}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-1">Available Quests</h2>
              <p className="text-zinc-500">Complete quests to gain XP and progress</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {AVAILABLE_QUESTS.map((quest) => {
                const Icon = quest.icon;
                return (
                  <motion.button
                    key={quest.id}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => completeQuest(quest.reward)}
                    disabled={isLoading}
                    className="group bg-zinc-900 hover:bg-linear-to-br hover:from-zinc-800 hover:to-amber-950 border border-zinc-800 hover:border-amber-500/30 p-6 rounded-3xl text-left transition-all duration-300 disabled:opacity-70"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-zinc-800 group-hover:bg-amber-500/10 rounded-2xl transition-colors">
                        <Icon className="w-7 h-7 text-amber-400" />
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-400 font-mono text-xl">+{quest.reward}</div>
                        <div className="text-xs text-zinc-500">XP</div>
                      </div>
                    </div>
                    <div className="font-semibold text-lg mb-1">{quest.title}</div>
                    <div className="text-sm text-zinc-400">Simple daily action</div>
                  </motion.button>
                );
              })}
            </div>
          </>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((ach) => (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-3xl border transition-all ${
                    ach.unlocked
                      ? 'border-amber-500 bg-amber-500/5'
                      : 'border-zinc-800 opacity-75'
                  }`}
                >
                  <div className="text-5xl mb-4">{ach.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{ach.name}</h3>
                  <p className="text-zinc-400 text-sm leading-snug">{ach.description}</p>
                  
                  {ach.unlocked ? (
                    <div className="mt-4 text-emerald-400 text-sm flex items-center gap-2">
                      ✓ Unlocked
                    </div>
                  ) : (
                    <div className="mt-4 text-xs text-zinc-500">
                      Requires Level {ach.required_level}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Quest History</h2>
            {history.length === 0 ? (
              <div className="text-center py-20 text-zinc-500">
                No quests completed yet. Start your journey!
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{entry.quest}</div>
                      <div className="text-xs text-zinc-500">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-emerald-400 font-mono">+{entry.xp} XP</div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Level Up Modal */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.7, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.7, y: 50 }}
              className="text-center"
            >
              <div className="text-8xl mb-6">✨</div>
              <div className="text-5xl font-bold mb-3 tracking-tight">LEVEL UP!</div>
              <p className="text-3xl text-amber-400">You are now Level {progress.level}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;