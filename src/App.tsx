import { useState, useEffect } from 'react';
import { Sword, Trophy, Zap, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playerAPI } from './lib/api';
import type { PlayerProgress } from './lib/api';

const AVAILABLE_QUESTS = [
  { id: 1, title: "Daily Login", reward: 25, icon: Zap },
  { id: 2, title: "Complete a Task", reward: 35, icon: Target },
  { id: 3, title: "Write a Journal Entry", reward: 40, icon: Trophy },
];

function App() {
  const [progress, setProgress] = useState<PlayerProgress>({
    level: 1, xp: 0, quests_completed: 0, total_xp_earned: 0, xp_to_next: 100
  });
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const data = await playerAPI.getProgress();
      setProgress(data);
    } catch (err) {
      console.error("Failed to load progress");
    }
  };

  const completeQuest = async (reward: number) => {
    try {
      const result = await playerAPI.gainXP(reward);
      setProgress(result.progress);   // This should now work reliably

      if (result.progress.level > progress.level) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 2200);
      }
    } catch (err) {
      console.error("Quest failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto p-6">
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

        {/* XP Bar */}
        <div className="mb-10">
          <div className="flex justify-between mb-2 text-sm">
            <span>Experience</span>
            <span className="font-mono">{progress.xp} / {progress.xp_to_next}</span>
          </div>
          <div className="h-4 bg-zinc-900 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-linear-to-r from-amber-400 via-yellow-400 to-amber-500"
              animate={{ width: `${(progress.xp / progress.xp_to_next) * 100}%` }}
              transition={{ duration: 0.7 }}
            />
          </div>
        </div>

        {/* Quests */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Available Quests</h2>
          <span className="text-zinc-500 text-sm">Complete to gain XP</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {AVAILABLE_QUESTS.map((quest) => {
            const Icon = quest.icon;
            return (
              <motion.button
                key={quest.id}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => completeQuest(quest.reward)}
                className="group bg-zinc-900 hover:bg-linear-to-br hover:from-zinc-800 hover:to-amber-950 border border-zinc-800 hover:border-amber-500/30 p-6 rounded-3xl text-left transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-zinc-800 group-hover:bg-amber-500/10 rounded-2xl transition-colors">
                    <Icon className="w-7 h-7 text-amber-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-mono">+{quest.reward}</div>
                    <div className="text-xs text-zinc-500">XP</div>
                  </div>
                </div>
                <div className="font-semibold text-lg mb-1">{quest.title}</div>
                <div className="text-sm text-zinc-400">Simple daily action</div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.6, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              className="text-center"
            >
              <div className="text-8xl mb-6">✨</div>
              <div className="text-5xl font-bold mb-3">LEVEL UP!</div>
              <p className="text-3xl text-amber-400">You reached Level {progress.level}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;