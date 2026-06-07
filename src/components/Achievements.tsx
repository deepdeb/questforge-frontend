import { motion } from 'framer-motion';

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  required_level: number;
}

interface AchievementsProps {
  achievements: Achievement[];
}

export const Achievements = ({ achievements }: AchievementsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {achievements.map((ach) => (
        <motion.div
          key={ach.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-6 rounded-3xl border ${
            ach.unlocked ? 'border-amber-500 bg-amber-500/5' : 'border-zinc-800'
          }`}
        >
          <div className="text-5xl mb-4">{ach.icon}</div>
          <h3 className="font-semibold text-xl">{ach.name}</h3>
          <p className="text-zinc-400 mt-2">{ach.description}</p>
          {ach.unlocked ? (
            <div className="text-emerald-400 mt-4 text-sm">✓ Unlocked</div>
          ) : (
            <div className="text-xs text-zinc-500 mt-4">Unlocks at Level {ach.required_level}</div>
          )}
        </motion.div>
      ))}
    </div>
  );
};