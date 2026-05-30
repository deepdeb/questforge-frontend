import { Sword, Trophy, Target, Award, User } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Sword, label: 'Dashboard', active: true },
  { icon: Target, label: 'Quests' },
  { icon: Award, label: 'Achievements' },
  { icon: Trophy, label: 'History' },
  { icon: User, label: 'Profile' },
];

export default function Sidebar() {
  return (
    <motion.div
      initial={{ x: -80 }}
      animate={{ x: 0 }}
      className="w-72 bg-zinc-900 border-r border-zinc-800 h-screen fixed flex flex-col"
    >
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center">
            <Sword className="w-6 h-6 text-black" />
          </div>
          <div className="text-2xl font-bold tracking-tighter">QuestForge</div>
        </div>
      </div>

      <div className="flex-1 p-4">
        {navItems.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ x: 8 }}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-1 cursor-pointer transition-colors ${item.active ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-zinc-800 text-zinc-400'}`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="p-4 border-t border-zinc-800 text-xs text-zinc-500">
        Level up. Unlock. Repeat.
      </div>
    </motion.div>
  );
}