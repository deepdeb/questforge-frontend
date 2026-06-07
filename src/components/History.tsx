import { motion } from 'framer-motion';

interface HistoryEntry {
  id: number;
  quest_title: string;
  xp_rewarded: number;
  completed_at: string;
}

interface HistoryProps {
  entries: HistoryEntry[];
}

export const History = ({ entries }: HistoryProps) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-500">
        Complete some quests to see them here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex justify-between items-center"
        >
          <div>
            <div className="font-medium">{entry.quest_title}</div>
            <div className="text-xs text-zinc-500 mt-1">
              {new Date(entry.completed_at).toLocaleString()}
            </div>
          </div>
          <div className="text-emerald-400 font-mono">+{entry.xp_rewarded} XP</div>
        </motion.div>
      ))}
    </div>
  );
};