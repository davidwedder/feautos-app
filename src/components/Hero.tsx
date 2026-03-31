import { motion } from "motion/react";
import { Search, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

interface StoreSettings {
  heroImageUrl?: string;
}

export default function Hero() {
  const [heroImage, setHeroImage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/store-settings")
      .then((res) => res.json())
      .then((data: StoreSettings) => {
        if (data?.heroImageUrl) {
          setHeroImage(data.heroImageUrl);
        }
      })
      .catch(() => {
        // mantém imagem padrão
      });
  }, []);
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={
            heroImage ||
            "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1920"
          }
          alt="Showroom Fé Autos"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0a0a0a]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter mb-4">
            Fé <span className="text-orange-500">Autos</span>
          </h1>
          <div className="h-1 w-32 bg-orange-500 mx-auto mb-6"></div>
          <p className="text-xl md:text-2xl text-gray-300 font-light tracking-[0.3em] uppercase mb-12">
            A fé que te move
          </p>

          <motion.a
            href="#estoque"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all"
          >
            <Search size={20} />
            Ver Estoque
          </motion.a>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
      >
        <ChevronDown size={32} />
      </motion.div>
    </section>
  );
}
