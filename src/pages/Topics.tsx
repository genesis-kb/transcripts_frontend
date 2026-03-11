import { CategorySidebar } from "@/components/CategorySidebar";
import { categories } from "@/data/mockData";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Derive topics from categories
const topics = categories.flatMap((cat) =>
  cat.subcategories.map((sub) => ({ name: sub.name, count: sub.count, category: cat.name }))
).sort((a, b) => b.count - a.count);

const Topics = () => {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono mb-6">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="text-primary">Topics</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <CategorySidebar />

        <div className="flex-1 min-w-0">
          <h1 className="font-display text-3xl font-bold mb-2">Topics</h1>
          <p className="text-muted-foreground mb-8">Browse specific technical topics across all categories.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topics.map((topic, i) => (
              <motion.div
                key={`${topic.name}-${topic.category}`}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.02 }}
                className="p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
              >
                <div className="font-medium text-sm mb-1">{topic.name}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{topic.category}</span>
                  <span className="font-mono text-xs text-muted-foreground">{topic.count}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topics;
