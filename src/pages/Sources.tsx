import { CategorySidebar } from "@/components/CategorySidebar";
import { conferences } from "@/data/mockData";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, FileText } from "lucide-react";

const Sources = () => {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono mb-6">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span className="text-primary">Sources</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <CategorySidebar />

        <div className="flex-1 min-w-0">
          <h1 className="font-display text-3xl font-bold mb-2">Sources</h1>
          <p className="text-muted-foreground mb-8">Original sources of transcribed content — conferences, podcasts, meetups, and more.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {conferences.map((conf, i) => (
              <motion.div
                key={conf.slug}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-all"
              >
                <div className="font-display font-semibold text-lg mb-1">{conf.name}</div>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{conf.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {conf.location}</span>
                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {conf.sessions} sessions</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sources;
