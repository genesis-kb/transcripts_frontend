import { CategorySidebar } from "@/components/CategorySidebar";
import { types } from "@/data/mockData";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Radio, Podcast, Users, Phone, Video, Layers } from "lucide-react";

const typeIcons: Record<string, any> = {
  conference: Video,
  podcast: Podcast,
  workshop: Layers,
  meetup: Users,
  call: Phone,
  various: Radio,
};

const Types = () => {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono mb-6">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="text-primary">Types</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <CategorySidebar />

        <div className="flex-1 min-w-0">
          <h1 className="font-display text-3xl font-bold mb-2">Types</h1>
          <p className="text-muted-foreground mb-8">Browse transcripts by content type.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {types.map((type, i) => {
              const Icon = typeIcons[type.slug] || Radio;
              return (
                <motion.div
                  key={type.slug}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-all text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="font-display font-semibold text-lg mb-1">{type.name}</div>
                  <div className="font-mono text-sm text-muted-foreground">{type.count} transcripts</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Types;
