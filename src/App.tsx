import { useState, useEffect } from 'react';
import { Sword, Trophy, Award, Clock, Lock, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playerAPI } from './lib/api';
import type { PlayerProgress } from './lib/api';
import Sidebar from './components/Sidebar';

function App() {
  const [progress, setProgress] = useState<PlayerProgress>({
    level: 1,
    xp: 0,
    quests_completed: 0,
    total_xp_earned: 0,
    xp_to_next: 100,
    username: "Adventurer",
    gold: 50
  });

  const [quests, setQuests] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'achievements' | 'history' | 'shop' | 'inventory'>('dashboard');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [recentUnlocks, setRecentUnlocks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [progressData, questsData, achievementsData, shopData] = await Promise.all([
        playerAPI.getProgress(),
        fetch('/api/quests').then(r => r.json()),
        fetch('/api/achievements').then(r => r.json()),
        fetch('/api/shop').then(r => r.json()),
      ]);

      setProgress(progressData);
      setQuests(questsData);
      setAchievements(achievementsData);
      setShopItems(shopData);

      // Parse inventory from progressData
      if (progressData.inventory) {
        try {
          const parsedInventory = JSON.parse(progressData.inventory);
          setInventory(parsedInventory);
          console.log("Inventory loaded:", parsedInventory);
        } catch (err) {
          console.error("Failed to parse inventory:", err);
          setInventory([]);
        }
      } else {
        setInventory([]);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  };

  const completeQuest = async (quest: any) => {
    if (progress.level < quest.required_level) return;

    setIsLoading(true);
    try {
      const result = await playerAPI.gainXP(quest.xp_reward);

      setProgress(result.progress);

      // Add to history
      setHistory(prev => [{
        id: Date.now(),
        quest: quest.title,
        xp: quest.xp_reward,
        timestamp: new Date().toISOString()
      }, ...prev]);

      // Level up check
      if (result.progress.level > progress.level) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 2400);
      }

      // Refresh data
      loadAllData();
      setTimeout(() => {
        fetch('/api/achievements')
          .then(r => r.json())
          .then(checkForNewUnlocks);
      }, 800);
    } catch (err) {
      console.error("Failed to complete quest:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseItem = async (item: any) => {
    try {
      const res = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: item.id })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Purchase failed");
        return;
      }

      // Update local state
      setProgress(prev => ({ ...prev, gold: data.new_gold }));
      alert(data.message);

      // Refresh shop and player data
      loadAllData();

      // Force inventory refresh from the updated player data
      const updatedProgress = await playerAPI.getProgress();
      if (updatedProgress.inventory) {
        try {
          setInventory(JSON.parse(updatedProgress.inventory));
        } catch {
          setInventory([]);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to process purchase");
    }
  };

  const checkForNewUnlocks = (newAchievements: any[]) => {
    const newlyUnlocked = newAchievements.filter(a => a.unlocked);
    // Simple alert for now - can be improved later
    newlyUnlocked.forEach(ach => {
      if (!recentUnlocks.some(r => r.id === ach.id)) {
        alert(`🎉 Achievement Unlocked: ${ach.name}`);
      }
    });
    setRecentUnlocks(newlyUnlocked);
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      {/* Main Content Area */}
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
              <span className="font-mono">{progress.quests_completed}</span>
            </div>
            <div className="flex items-center gap-2 bg-amber-500/10 text-amber-400 px-5 py-2.5 rounded-2xl font-medium">
              💰 <span className="font-mono text-lg">{progress.gold}</span>
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

        {/* Tabs */}
        <div className="flex gap-10 border-b border-zinc-800 mb-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Sword },
            { id: 'shop', label: 'Shop', icon: ShoppingBag },
            { id: 'inventory', label: 'Inventory', icon: Trophy },
            { id: 'achievements', label: 'Achievements', icon: Award },
            { id: 'history', label: 'History', icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-4 text-lg font-medium transition-all relative ${activeTab === tab.id ? 'text-amber-400' : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="underline" className="absolute -bottom-px left-0 right-0 h-0.5 bg-amber-400" />
              )}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Available Quests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quests.map((quest) => {
                const isUnlocked = progress.level >= quest.required_level;
                return (
                  <motion.button
                    key={quest.id}
                    whileHover={isUnlocked ? { scale: 1.02, y: -2 } : {}}
                    whileTap={isUnlocked ? { scale: 0.98 } : {}}
                    onClick={() => isUnlocked && completeQuest(quest)}
                    disabled={!isUnlocked || isLoading}
                    className={`p-6 rounded-3xl border text-left transition-all ${isUnlocked
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
              })}
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((ach) => (
                <motion.div
                  key={ach.id}
                  className={`p-6 rounded-3xl border ${ach.unlocked ? 'border-amber-500 bg-amber-500/5' : 'border-zinc-800'}`}
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
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Quest History</h2>
            {history.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">Complete some quests to see them here.</div>
            ) : (
              <div className="space-y-3">
                {history.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{entry.quest}</div>
                      <div className="text-xs text-zinc-500 mt-1">
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-emerald-400 font-mono">+{entry.xp} XP</div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Shop Tab */}
        {activeTab === 'shop' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Shop</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shopItems.map((item) => (
                <motion.div
                  key={item.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-amber-500/50 transition-all"
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-semibold">{item.name}</h3>
                  <p className="text-zinc-400 text-sm mt-2">{item.description}</p>
                  <div className="mt-6 flex justify-between items-center">
                    <span className="text-amber-400 font-mono text-xl">💰 {item.price}</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => purchaseItem(item)}
                      className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-2xl"
                    >
                      Buy
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Inventory</h2>
            {inventory.length === 0 ? (
              <div className="text-center py-20 text-zinc-500">
                Your inventory is empty. Visit the Shop to buy items!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {inventory.map((item: any, index: number) => (
                  <motion.div
                    key={index}
                    className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6"
                  >
                    <div className="text-5xl mb-4">{item.icon}</div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-xs text-zinc-500 mt-2">
                      Purchased {new Date(item.purchased_at).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Level Up Celebration */}
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
              <div className="text-5xl font-bold">LEVEL UP!</div>
              <p className="text-3xl text-amber-400 mt-3">You reached Level {progress.level}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;