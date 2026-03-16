import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import Topics from "./pages/Topics";
import Speakers from "./pages/Speakers";
import Types from "./pages/Types";
import Sources from "./pages/Sources";
import TranscriptDetail from "./pages/TranscriptDetail";
import ConferenceArchive from "./pages/ConferenceArchive";
import Library from "./pages/Library";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/topics" element={<Topics />} />
            <Route path="/speakers" element={<Speakers />} />
            <Route path="/types" element={<Types />} />
            <Route path="/sources" element={<Sources />} />
            <Route path="/transcript/:id" element={<TranscriptDetail />} />
            <Route path="/conferences" element={<ConferenceArchive />} />
            <Route path="/library" element={<Library />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
