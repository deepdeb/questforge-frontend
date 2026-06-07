import { motion } from 'framer-motion';

interface InventoryItem {
  item_id: number;
  name: string;
  icon: string;
  purchased_at: string;
}

interface InventoryProps {
  items: InventoryItem[];
}

export const Inventory = ({ items }: InventoryProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500">
        Your inventory is empty. Visit the Shop to buy items!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
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
  );
};