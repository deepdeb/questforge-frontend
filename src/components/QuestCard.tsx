// src/components/QuestCard.tsx
import { motion } from 'framer-motion';
import { Lock, X } from 'lucide-react';
import { useState } from 'react';

interface QuestChoice {
  id: string;
  text: string;
  xp_reward: number;
  gold_reward: number;
  description?: string;
}

interface QuestCardProps {
  quest: {
    id: number;
    title: string;
    description: string;
    xp_reward: number;
    required_level: number;
    quest_type: string;
    choices?: QuestChoice[];
    story_context?: string;
  };
  isUnlocked: boolean;
  onComplete: (quest: any, chosenChoice?: QuestChoice) => void;
  isLoading: boolean;
}

export const QuestCard = ({ quest, isUnlocked, onComplete, isLoading }: QuestCardProps) => {
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    if (!isUnlocked) return;
    
    if (quest.quest_type === "choice" && quest.choices?.length) {
      setShowModal(true);
    } else {
      onComplete(quest);
    }
  };

  const selectChoice = (choice: QuestChoice) => {
    onComplete(quest, choice);
    setShowModal(false);
  };

  const displayReward = quest.quest_type === "choice" 
    ? "Choice-based Rewards" 
    : `+${quest.xp_reward} XP`;

  return (
    <>
      <motion.div
        className={`p-6 rounded-3xl border text-left transition-all bg-zinc-900 flex flex-col h-full min-h-[260px] ${
          isUnlocked ? 'border-amber-500/30 hover:border-amber-500' : 'border-zinc-800 opacity-60'
        }`}
        whileHover={isUnlocked ? { scale: 1.01 } : {}}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="font-semibold text-lg">{quest.title}</div>
            <p className="text-sm text-zinc-400 mt-1 pr-2">{quest.description}</p>
            {quest.story_context && (
              <p className="text-xs text-amber-400/70 mt-2 italic">{quest.story_context}</p>
            )}
          </div>
          {!isUnlocked && <Lock className="w-5 h-5 text-zinc-500 mt-1 flex-shrink-0" />}
        </div>

        <div className="mt-auto mb-6">
          <span className="text-emerald-400 font-mono text-xl block">
            {displayReward}
          </span>
          {quest.required_level > 1 && (
            <span className="text-xs px-3 py-1 bg-zinc-800 text-zinc-400 rounded-full inline-block mt-2">
              Level {quest.required_level}+
            </span>
          )}
        </div>

        <motion.button
          whileHover={isUnlocked ? { scale: 1.02 } : {}}
          whileTap={isUnlocked ? { scale: 0.98 } : {}}
          onClick={handleClick}
          disabled={!isUnlocked || isLoading}
          className={`w-full py-3 rounded-2xl font-medium transition-all mt-auto ${
            isUnlocked 
              ? 'bg-amber-500 hover:bg-amber-600 text-black' 
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
        >
          {quest.quest_type === "choice" ? "Make a Choice" : "Complete Quest"}
        </motion.button>
      </motion.div>

      {/* Choice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-zinc-900 border border-amber-500/50 rounded-3xl w-full max-w-md p-8 relative"
          >
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <h3 className="text-2xl font-bold mb-2">{quest.title}</h3>
            <p className="text-zinc-400 mb-6">{quest.description}</p>

            <p className="text-amber-400 mb-4">How do you approach this?</p>

            <div className="space-y-4">
              {quest.choices?.map((choice, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectChoice(choice)}
                  className="w-full p-5 text-left border border-zinc-700 hover:border-amber-500 rounded-2xl transition-all hover:bg-zinc-800/50"
                >
                  <div className="font-semibold text-lg">{choice.text}</div>
                  {choice.description && (
                    <p className="text-sm text-zinc-500 mt-1.5">{choice.description}</p>
                  )}
                  <div className="text-emerald-400 font-medium mt-3">
                    +{choice.xp_reward} XP {choice.gold_reward > 0 && `• +${choice.gold_reward} Gold`}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};