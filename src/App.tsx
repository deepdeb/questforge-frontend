// src/App.tsx
import { useState, useEffect } from 'react';
import { Sword, Trophy, Award, Clock, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { historyAPI, playerAPI } from './lib/api';
import type { PlayerProgress } from './lib/api';
import Sidebar from './components/Sidebar';
import { useToast } from './context/ToastContext';
import { QuestCard } from './components/QuestCard';
import { Achievements } from './components/Achievements';
import { History } from './components/History';
import { Shop } from './components/Shop';
import { Inventory } from './components/Inventory';

function App() {
  const { showToast } = useToast();
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [progressData, questsData, achievementsData, shopData, historyData] = await Promise.all([
        playerAPI.getProgress(),
        fetch('/api/quests').then(r => r.json()),
        fetch('/api/achievements').then(r => r.json()),
        fetch('/api/shop').then(r => r.json()),
        historyAPI.getHistory(),
      ]);

      setProgress(progressData);
      setQuests(questsData);
      setAchievements(achievementsData);
      setShopItems(shopData);
      setHistory(historyData);

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
      showToast("Failed to load game data", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const completeQuest = async (quest: any, chosenChoice?: any) => {
  if (progress.level < quest.required_level) return;

  setIsLoading(true);
  try {
    const xpToGain = chosenChoice ? chosenChoice.xp_reward : quest.xp_reward;
    const goldToGain = chosenChoice ? chosenChoice.gold_reward || 0 : 0;

    const result = await playerAPI.gainXP(xpToGain, quest.title, goldToGain);

    setProgress(result.progress);

    const updatedHistory = await historyAPI.getHistory();
    setHistory(updatedHistory);

    if (result.progress.level > progress.level) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 2400);
    }

    // Refresh achievements
    setTimeout(() => {
      fetch('/api/achievements')
        .then(r => r.json())
        .then(checkForNewUnlocks);
    }, 800);

    showToast(
      chosenChoice 
        ? `Choice made: ${chosenChoice.text}` 
        : `Quest completed: ${quest.title}`,
      'success'
    );
  } catch (err) {
    console.error("Failed to complete quest:", err);
    showToast("Failed to complete quest", 'error');
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
        showToast(data.detail || "Purchase failed", 'error');
        return;
      }

      // Update local state
      setProgress(prev => ({ ...prev, gold: data.new_gold }));
      showToast(data.message, 'success');

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
      showToast("Failed to process purchase", 'error');
    }
  };

  const checkForNewUnlocks = (newAchievements: any[]) => {
    const newlyUnlocked = newAchievements.filter(a => a.unlocked);
    newlyUnlocked.forEach(ach => {
      if (!recentUnlocks.some(r => r.id === ach.id)) {
        showToast(`Achievement Unlocked: ${ach.name}`, 'achievement');
      }
    });
    setRecentUnlocks(newlyUnlocked);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-zinc-950 text-white items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl font-medium">Entering the realm...</p>
          <p className="text-zinc-500 mt-2">Forging your adventure</p>
        </div>
      </div>
    );
  }

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
              {quests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  isUnlocked={progress.level >= quest.required_level}
                  onComplete={completeQuest}
                  isLoading={isLoading}
                />
              ))}
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Achievements</h2>
            <Achievements achievements={achievements} />
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Quest History</h2>
            <History entries={history} />
          </div>
        )}

        {/* Shop Tab */}
        {activeTab === 'shop' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Shop</h2>
            <Shop items={shopItems} onPurchase={purchaseItem} />
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Inventory</h2>
            <Inventory items={inventory} />
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