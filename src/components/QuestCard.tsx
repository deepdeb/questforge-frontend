import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

interface QuestCardProps {
  quest: {
    id: number;
    title: string;
    description: string;
    xp_reward: number;
    required_level: number;
  };
  isUnlocked: boolean;
  onComplete: () => void;
  isLoading: boolean;
}

export const QuestCard = ({ quest, isUnlocked, onComplete, isLoading }: QuestCardProps) => {
  return (
    <motion.button
      whileHover={isUnlocked ? { scale: 1.02, y: -2 } : {}}
      whileTap={isUnlocked ? { scale: 0.98 } : {}}
      onClick={onComplete}
      disabled={!isUnlocked || isLoading}
      className={`p-6 rounded-3xl border text-left transition-all ${
        isUnlocked
          ? 'border-amber-500/30 hover:border-amber-500 bg-zinc-900 hover:bg-zinc-800'
          : 'border-zinc-800 opacity-60 cursor-not-allowed'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="font-semibold text-lg">{quest.title}</div>
          <p className="text-sm text-zinc-400 mt-1 pr-4">{quest.description}</p>
        </div>
        {!isUnlocked && <Lock className="w-5 h-5 text-zinc-500 mt-1" />}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-emerald-400 font-mono text-xl">+{quest.xp_reward} XP</span>
        {quest.required_level > 1 && (
          <span className="text-xs px-3 py-1 bg-zinc-800 text-zinc-400 rounded-full">
            Level {quest.required_level}+
          </span>
        )}
      </div>
    </motion.button>
  );
};