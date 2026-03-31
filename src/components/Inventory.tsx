import { useState, useEffect } from "react";
import { Search, Filter, Car as CarIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from 'react-markdown';

interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  status: string;
  images: string[];
  description: string;
}

export default function Inventory() {
  const [cars, setCars] = useState<Car[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("Todas as marcas");
  const [filterFuel, setFilterFuel] = useState("Combustível");
  const [filterTransmission, setFilterTransmission] = useState("Câmbio");
  const [sortBy, setSortBy] = useState("Mais recentes");
  const [whatsPhone, setWhatsPhone] = useState<string | null>(null);

  // Gallery state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openGallery = (images: string[] = [], index = 0) => {
    setCurrentImages(images && images.length > 0 ? images : ["https://picsum.photos/seed/car/1200/800"]);
    setCurrentIndex(index);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    setCurrentImages([]);
    setCurrentIndex(0);
  };

  const prevImage = () => {
    setCurrentIndex((i) => (currentImages.length ? (i - 1 + currentImages.length) % currentImages.length : 0));
  };

  const nextImage = () => {
    setCurrentIndex((i) => (currentImages.length ? (i + 1) % currentImages.length : 0));
  };

  useEffect(() => {
    if (!isGalleryOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeGallery();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isGalleryOpen, currentImages]);

  useEffect(() => {
    fetch("/api/cars")
      .then((res) => res.json())
      .then((data) => setCars(data));
  }, []);

  useEffect(() => {
    fetch("/api/store-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.phone) {
          let digits = data.phone.replace(/\D/g, "");
          if (!digits.startsWith("55")) {
            digits = "55" + digits;
          }
          setWhatsPhone(digits);
        }
      })
      .catch(() => {
        setWhatsPhone("5511999999999");
      });
  }, []);

  const brands = ["Todas as marcas", ...Array.from(new Set(cars.map((c) => c.brand)))];
  const fuels = ["Combustível", ...Array.from(new Set(cars.map((c) => c.fuel)))];
  const transmissions = ["Câmbio", ...Array.from(new Set(cars.map((c) => c.transmission)))];

  const filteredCars = cars
    .filter((car) => {
      const matchesSearch =
        car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = filterBrand === "Todas as marcas" || car.brand === filterBrand;
      const matchesFuel = filterFuel === "Combustível" || car.fuel === filterFuel;
      const matchesTransmission = filterTransmission === "Câmbio" || car.transmission === filterTransmission;
      return matchesSearch && matchesBrand && matchesFuel && matchesTransmission;
    })
    .sort((a, b) => {
      if (sortBy === "Menor preço") return a.price - b.price;
      if (sortBy === "Maior preço") return b.price - a.price;
      return b.id - a.id; // Default to newest
    });

  return (
    <section id="estoque" className="py-24 px-4 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-1 h-8 bg-orange-500"></div>
        <h2 className="text-3xl font-bold">Nosso Estoque</h2>
        <span className="text-gray-500 font-medium">({filteredCars.length} veículos)</span>
      </div>

      {/* Filters */}
      <div className="bg-[#151515] p-4 rounded-2xl border border-white/5 mb-12 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Buscar marca ou modelo..."
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-orange-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
          value={filterBrand}
          onChange={(e) => setFilterBrand(e.target.value)}
        >
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <select
          className="bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
          value={filterFuel}
          onChange={(e) => setFilterFuel(e.target.value)}
        >
          {fuels.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <select
          className="bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option>Mais recentes</option>
          <option>Menor preço</option>
          <option>Maior preço</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredCars.length > 0 ? (
            filteredCars.map((car) => (
              <motion.div
                key={car.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group bg-[#151515] rounded-3xl overflow-hidden border border-white/5 hover:border-orange-500/30 transition-all hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
              >
                <div className="relative h-64 overflow-hidden cursor-pointer" onClick={() => openGallery(car.images, 0)}>
                  <img
                    src={car.images[0] || "https://picsum.photos/seed/car/800/600"}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {car.status === "sold" && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="bg-red-500 text-white px-6 py-2 rounded-full font-bold uppercase tracking-widest text-sm">
                        Vendido
                      </span>
                    </div>
                  )}
                  {car.status === "featured" && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wider">
                        Destaque
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold group-hover:text-orange-500 transition-colors">
                        {car.brand} {car.model}
                      </h3>
                      <p className="text-gray-500 text-sm font-medium">
                        {car.year} • {car.mileage.toLocaleString()} km
                      </p>
                    </div>
                    <p className="text-2xl font-black text-orange-500">
                      R$ {car.price.toLocaleString("pt-BR")}
                    </p>
                  </div>
                  {car.description && (
                    <div className="mb-4 text-gray-300 text-sm">
                      <ReactMarkdown>{car.description}</ReactMarkdown>
                    </div>
                  )}
                  <div className="flex gap-3 mt-6">
                    <div className="flex-1 bg-black/40 rounded-xl p-3 text-center">
                      <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Câmbio</p>
                      <p className="text-xs font-bold">{car.transmission}</p>
                    </div>
                    <div className="flex-1 bg-black/40 rounded-xl p-3 text-center">
                      <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Combustível</p>
                      <p className="text-xs font-bold">{car.fuel}</p>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${whatsPhone || "5511999999999"}?text=${encodeURIComponent(
                      `Olá, tenho interesse no ${car.brand} ${car.model} ${car.year}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 w-full bg-white/5 hover:bg-orange-500 hover:text-white text-gray-300 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    Tenho interesse
                  </a>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <CarIcon className="mx-auto text-gray-700 mb-4" size={64} />
              <p className="text-gray-500 text-xl font-medium">Nenhum carro encontrado</p>
            </div>
          )}
        </AnimatePresence>
      </div>
      {/* Gallery Modal */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-6"
            onClick={() => closeGallery()}
          >
            <div className="max-w-4xl w-full max-h-[90vh] overflow-hidden rounded-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="relative bg-black rounded-2xl">
                <img
                  src={currentImages[currentIndex] || "https://picsum.photos/seed/car/1200/800"}
                  alt={`Imagem ${currentIndex + 1}`}
                  className="w-full h-[60vh] object-contain bg-black"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => prevImage()}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full"
                >
                  ‹
                </button>
                <button
                  onClick={() => nextImage()}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full"
                >
                  ›
                </button>
                <button
                  onClick={() => closeGallery()}
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full"
                >
                  ✕
                </button>
                <div className="p-4 bg-[#0b0b0b] overflow-x-auto flex gap-3">
                  {currentImages.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`thumb-${i}`}
                      className={`w-24 h-16 object-cover rounded-lg cursor-pointer border ${i === currentIndex ? 'border-orange-500' : 'border-white/5'}`}
                      onClick={() => setCurrentIndex(i)}
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// Gallery state and helpers (placed after component to keep Inventory tidy)
