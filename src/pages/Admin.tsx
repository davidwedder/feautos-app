import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit, LogOut, LayoutDashboard, Car as CarIcon, Image as ImageIcon, X, Settings as SettingsIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useDropzone, DropzoneOptions } from "react-dropzone";
import toast from "react-hot-toast";

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

export default function Admin() {
  const navigate = useNavigate();
  const [cars, setCars] = useState<Car[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  const fetchCars = useCallback(() => {
    fetch("/api/cars")
      .then((res) => res.json())
      .then((data) => {
        setCars(data);
      })
      .catch((err) => {
        console.error("Erro ao buscar carros:", err);
        toast.error("Erro ao carregar estoque");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const isAuth = localStorage.getItem("feautos_auth") === "1";
    if (!isAuth) {
      window.location.href = "/login";
      return;
    }

    setIsLoading(true);
    fetchCars();
  }, [fetchCars]);

  const handleLogout = async () => {
    // Tenta avisar o servidor, mas redireciona de qualquer jeito
    fetch("/api/auth/logout", { 
      method: "POST",
      headers: { 'Cache-Control': 'no-cache' }
    }).catch(() => {});
    
    // Limpa tudo no navegador e vai para a Home imediatamente
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este veículo?")) {
      const res = await fetch(`/api/cars/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Veículo excluído!");
        fetchCars();
      }
    }
  };

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center">
            <LayoutDashboard className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-gray-500">Gerencie seu estoque de veículos</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 w-full md:w-auto">
          <button
            onClick={() => {
              setEditingCar(null);
              setIsModalOpen(true);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all w-full sm:w-auto"
          >
            <Plus size={20} />
            Novo Veículo
          </button>
          <button
            onClick={handleLogout}
            className="bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-gray-400 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-white/5 w-full sm:w-auto"
          >
            <LogOut size={20} />
            Sair
          </button>
          <button
            onClick={() => setIsStoreModalOpen(true)}
            className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-white/5 w-full sm:w-auto"
          >
            <SettingsIcon size={20} />
            Dados da Loja
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading && cars.length === 0 && (
          <div className="py-10 text-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        )}
        {cars.map((car) => (
          <div
            key={car.id}
            className="bg-[#151515] p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center gap-6 group hover:border-orange-500/30 transition-all"
          >
            <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden bg-black">
              <img
                src={car.images[0] || "https://picsum.photos/seed/car/400/300"}
                alt={car.model}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold">
                {car.brand} {car.model}
              </h3>
              <p className="text-gray-500 text-sm">
                {car.year} • {car.mileage.toLocaleString()} km • {car.fuel} • {car.transmission}
              </p>
              <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-2">
                <span className={`text-[10px] uppercase font-black px-2 py-1 rounded ${
                  car.status === 'available' ? 'bg-green-500/10 text-green-500' :
                  car.status === 'featured' ? 'bg-orange-500/10 text-orange-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {car.status === 'available' ? 'Disponível' :
                   car.status === 'featured' ? 'Destaque' : 'Vendido'}
                </span>
              </div>
            </div>
            <div className="text-2xl font-black text-orange-500">
              R$ {car.price.toLocaleString("pt-BR")}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingCar(car);
                  setIsModalOpen(true);
                }}
                className="p-3 bg-white/5 hover:bg-orange-500 hover:text-white text-gray-400 rounded-xl transition-all"
              >
                <Edit size={20} />
              </button>
              <button
                onClick={() => handleDelete(car.id)}
                className="p-3 bg-white/5 hover:bg-red-500 hover:text-white text-gray-400 rounded-xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
        {cars.length === 0 && !isLoading && (
          <div className="py-20 text-center bg-[#151515] rounded-[3rem] border border-dashed border-white/10">
            <CarIcon className="mx-auto text-gray-800 mb-4" size={64} />
            <p className="text-gray-500 text-xl font-medium">Nenhum veículo cadastrado</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <CarModal
            car={editingCar}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {
              setIsModalOpen(false);
              fetchCars();
            }}
          />
        )}
        {isStoreModalOpen && (
          <StoreSettingsModal onClose={() => setIsStoreModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function StoreSettingsModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    phone: "",
    email: "",
    address: "",
    hoursWeek: "",
    hoursSaturday: "",
    hoursSunday: "",
    instagramUrl: "",
    facebookUrl: "",
    heroImageUrl: "",
    aboutImageUrl: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newHeroImage, setNewHeroImage] = useState<string | null>(null);
  const [newAboutImage, setNewAboutImage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/store-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data) setForm(data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        new_hero_image: newHeroImage,
        new_about_image: newAboutImage,
      };

      const res = await fetch("/api/store-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Dados da loja atualizados!");
        onClose();
      } else {
        toast.error(data.error || "Erro ao salvar dados da loja");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro na conexão. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-[#151515] w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border border-white/10 shadow-2xl"
      >
        <div className="sticky top-0 bg-[#151515] p-6 sm:p-8 border-b border-white/5 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold">Dados da Loja</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {isLoading ? (
            <div className="py-10 text-center">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Telefone
                  </label>
                  <input
                    name="phone"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    E-mail
                  </label>
                  <input
                    name="email"
                    type="email"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Endereço
                </label>
                <textarea
                  name="address"
                  rows={3}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Segunda a Sexta
                  </label>
                  <input
                    name="hoursWeek"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500"
                    value={form.hoursWeek}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Sábado
                  </label>
                  <input
                    name="hoursSaturday"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500"
                    value={form.hoursSaturday}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Domingo
                  </label>
                  <input
                    name="hoursSunday"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500"
                    value={form.hoursSunday}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Instagram (URL)
                  </label>
                  <input
                    name="instagramUrl"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500"
                    value={form.instagramUrl}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Facebook (URL)
                  </label>
                  <input
                    name="facebookUrl"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500"
                    value={form.facebookUrl}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Imagem HERO */}
              <div className="space-y-4 border-t border-white/10 pt-6 mt-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Imagem HERO (capa inicial)
                </p>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    URL da imagem do HERO
                  </label>
                  <input
                    name="heroImageUrl"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500"
                    value={form.heroImageUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Ou enviar nova imagem do HERO (upload)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full text-sm text-gray-400"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) {
                        setNewHeroImage(null);
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        setNewHeroImage(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  {newHeroImage && (
                    <p className="text-xs text-gray-500">
                      Uma nova imagem será enviada e usada como fundo do HERO.
                    </p>
                  )}
                </div>
              </div>

              {/* Imagem Sobre Nós */}
              <div className="space-y-4 border-t border-white/10 pt-6">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Imagem da seção &quot;Sobre Nós&quot;
                </p>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    URL da imagem de &quot;Sobre Nós&quot;
                  </label>
                  <input
                    name="aboutImageUrl"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500"
                    value={form.aboutImageUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Ou enviar nova imagem de &quot;Sobre Nós&quot; (upload)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full text-sm text-gray-400"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) {
                        setNewAboutImage(null);
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        setNewAboutImage(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  {newAboutImage && (
                    <p className="text-xs text-gray-500">
                      Uma nova imagem será enviada e usada na seção &quot;Sobre Nós&quot;.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-2xl font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-2xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Salvar"
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </motion.div>
    </div>
  );
}

function CarModal({ car, onClose, onSuccess }: { car: Car | null; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    brand: car?.brand || "",
    model: car?.model || "",
    year: car?.year || new Date().getFullYear(),
    price: car?.price || 0,
    mileage: car?.mileage || 0,
    fuel: car?.fuel || "Flex",
    transmission: car?.transmission || "Automático",
    status: car?.status || "available",
    description: car?.description || "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(car?.images || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  } as any);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Iniciando envio via FormData (multipart)...");
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("brand", String(formData.brand));
      fd.append("model", String(formData.model));
      fd.append("year", String(formData.year));
      fd.append("price", String(formData.price));
      fd.append("mileage", String(formData.mileage));
      fd.append("fuel", String(formData.fuel));
      fd.append("transmission", String(formData.transmission));
      fd.append("status", String(formData.status));
      fd.append("description", String(formData.description || ""));
      fd.append("existingImages", JSON.stringify(existingImages || []));

      files.forEach((file) => {
        fd.append("images", file);
      });

      const url = car ? `/api/cars/${car.id}` : "/api/cars";
      const method = car ? "PUT" : "POST";

      console.log(`Enviando dados para ${url}...`);
      
      const res = await fetch(url, { 
        method, 
        body: fd
      });
      
      console.log("Status da resposta:", res.status);
      const result = await res.json();

      if (res.ok) {
        toast.success(car ? "Veículo atualizado!" : "Veículo cadastrado!");
        onSuccess();
      } else {
        toast.error(result.error || "Erro ao salvar veículo");
      }
    } catch (error: any) {
      console.error("Erro crítico:", error);
      toast.error("Erro na conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeExistingImage = (img: string) => {
    setExistingImages(existingImages.filter((i) => i !== img));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-[#151515] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border border-white/10 shadow-2xl"
      >
        <div className="sticky top-0 bg-[#151515] p-6 sm:p-8 border-b border-white/5 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold">{car ? "Editar Veículo" : "Novo Veículo"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Marca <span className="text-orange-500">*</span></label>
              <input
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Modelo <span className="text-orange-500">*</span></label>
              <input
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Ano <span className="text-orange-500">*</span></label>
              <input
                required
                type="number"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Preço (R$) <span className="text-orange-500">*</span></label>
              <input
                required
                type="text"
                placeholder="Ex: 50.000,00"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value as any })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Quilometragem <span className="text-orange-500">*</span></label>
              <input
                required
                type="text"
                placeholder="Ex: 10.500"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value as any })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Combustível</label>
              <select
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500"
                value={formData.fuel}
                onChange={(e) => setFormData({ ...formData, fuel: e.target.value })}
              >
                <option>Flex</option>
                <option>Gasolina</option>
                <option>Diesel</option>
                <option>Híbrido</option>
                <option>Elétrico</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Câmbio</label>
              <select
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500"
                value={formData.transmission}
                onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
              >
                <option>Automático</option>
                <option>Manual</option>
                <option>CVT</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Status</label>
              <select
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="available">Disponível</option>
                <option value="featured">Destaque</option>
                <option value="sold">Vendido</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Descrição</label>
            <textarea
              rows={4}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Fotos</label>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                {existingImages.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img)}
                      className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-[2rem] p-10 text-center cursor-pointer transition-all ${
                isDragActive ? "border-orange-500 bg-orange-500/5" : "border-white/10 hover:border-white/20"
              }`}
            >
              <input {...getInputProps()} />
              <ImageIcon className="mx-auto text-gray-600 mb-4" size={48} />
              <p className="text-gray-400">Arraste fotos aqui ou clique para selecionar</p>
              <p className="text-xs text-gray-600 mt-2">Formatos aceitos: JPG, PNG, WEBP</p>
            </div>

            {/* New Files Preview */}
            {files.length > 0 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                {files.map((file, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden group border border-white/10">
                    <img 
                      src={URL.createObjectURL(file)} 
                      className="w-full h-full object-cover" 
                      onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                    />
                    <button
                      type="button"
                      onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Salvar Veículo"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
