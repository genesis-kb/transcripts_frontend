import { CategorySidebar } from "@/components/CategorySidebar";
import { categories } from "@/data/mockData";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Categories = () => {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono mb-6">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="text-primary">Categories</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <CategorySidebar />

        <div className="flex-1 min-w-0">
          <h1 className="font-display text-3xl font-bold mb-2">Categories</h1>
          <p className="text-muted-foreground mb-8">Explore the main areas of focus within the Bitcoin technical ecosystem.</p>

          <div className="space-y-10">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                id={cat.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="border-b border-border pb-2 mb-4">
                  <h2 className="font-display text-xl font-semibold">{cat.name}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cat.subcategories.map((sub) => (
                    <div
                      key={sub.name}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
                    >
                      <span className="text-sm font-medium">{sub.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">{String(sub.count).padStart(2, "0")}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right sidebar - category quick nav */}
        <aside className="hidden xl:block w-48 shrink-0">
          <div className="sticky top-20">
            <h4 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">Quick Nav</h4>
            <div className="flex flex-col gap-1">
              {categories.map((cat) => (
                <a
                  key={cat.slug}
                  href={`#${cat.slug}`}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors py-0.5 truncate"
                >
                  {cat.name}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Categories;
