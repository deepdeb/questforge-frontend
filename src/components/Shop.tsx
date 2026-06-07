import { motion } from 'framer-motion';

interface ShopItem {
  id: number;
  name: string;
  description: string;
  price: number;
  icon: string;
  effect: string;
}

interface ShopProps {
  items: ShopItem[];
  onPurchase: (item: ShopItem) => void;
}

export const Shop = ({ items, onPurchase }: ShopProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
              onClick={() => onPurchase(item)}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-2xl"
            >
              Buy
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};