import Hero from "../components/Hero";
import Inventory from "../components/Inventory";
import { motion } from "motion/react";
import { Shield, Star, Award, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

interface StoreSettings {
  phone?: string;
  aboutImageUrl?: string;
}

export default function Home() {
  const [aboutImage, setAboutImage] = useState<string | null>(null);
  const [whatsPhone, setWhatsPhone] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/store-settings")
      .then((res) => res.json())
      .then((data: StoreSettings) => {
        if (data?.aboutImageUrl) {
          setAboutImage(data.aboutImageUrl);
        }
        if (data?.phone) {
          let digits = data.phone.replace(/\D/g, "");
          if (!digits.startsWith("55")) digits = "55" + digits;
          setWhatsPhone(digits);
        }
      })
      .catch(() => {
        // mantém imagem padrão
      });
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-0"
    >
      <Hero />
      
      {/* Features */}
      <section className="py-24 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center group">
            <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-500 transition-all duration-500">
              <Shield className="text-orange-500 group-hover:text-white transition-colors" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-4">Garantia e Procedência</h3>
            <p className="text-gray-500 leading-relaxed">Todos os nossos veículos passam por uma rigorosa perícia cautelar para sua total segurança.</p>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-500 transition-all duration-500">
              <Star className="text-orange-500 group-hover:text-white transition-colors" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-4">Atendimento Premium</h3>
            <p className="text-gray-500 leading-relaxed">Uma experiência de compra personalizada, focada em realizar o seu sonho com transparência.</p>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-500 transition-all duration-500">
              <Award className="text-orange-500 group-hover:text-white transition-colors" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-4">Melhores Taxas</h3>
            <p className="text-gray-500 leading-relaxed">Parcerias com os principais bancos para garantir as melhores condições de financiamento do mercado.</p>
          </div>
        </div>
      </section>

      <Inventory />

      {/* About Section */}
      <section id="sobre" className="py-24 bg-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl"></div>
            <img
              src={
                aboutImage ||
                "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000"
              }
              alt="Showroom Fé Autos"
              className="rounded-3xl shadow-2xl relative z-10"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-6 -right-6 bg-orange-500 p-8 rounded-2xl z-20 hidden md:block">
              <p className="text-4xl font-black text-white leading-none">15+</p>
              <p className="text-xs font-bold uppercase tracking-widest text-white/80 mt-2">Anos de História</p>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-1 h-8 bg-orange-500"></div>
              <h2 className="text-3xl font-bold">Nossa História</h2>
            </div>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              A Fé Autos nasceu de um sonho e da convicção de que a compra de um veículo deve ser um momento de alegria e confiança. Com mais de 15 anos de mercado, nos tornamos referência em qualidade e atendimento em nossa região.
            </p>
            <p className="text-gray-400 text-lg leading-relaxed mb-10">
              Nossa missão é simples: oferecer os melhores veículos com a transparência que você merece. Aqui, cada cliente é único e cada negócio é tratado com a máxima seriedade.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-3xl font-bold text-white mb-2">2k+</p>
                <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">Carros Vendidos</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white mb-2">98%</p>
                <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">Clientes Satisfeitos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="py-24 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">O que dizem nossos clientes</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">A satisfação de quem já realizou o sonho do carro novo com a Fé Autos.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Ricardo Silva", text: "Excelente atendimento! O carro estava impecável, exatamente como nas fotos. Recomendo muito a Fé Autos.", role: "Cliente Satisfeito" },
              { name: "Mariana Costa", text: "Processo de financiamento muito rápido e transparente. Equipe nota 10, me senti muito segura na compra.", role: "Cliente Satisfeita" },
              { name: "João Pedro", text: "Melhor preço da região e carros de procedência. Já é o segundo carro que compro com eles.", role: "Cliente Fiel" }
            ].map((t, i) => (
              <div key={i} className="bg-black p-8 rounded-3xl border border-white/5 relative">
                <MessageSquare className="text-orange-500/20 absolute top-8 right-8" size={40} />
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-orange-500 fill-orange-500" />)}
                </div>
                <p className="text-gray-400 italic mb-8 leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="font-bold text-white">{t.name}</p>
                  <p className="text-xs text-orange-500 uppercase tracking-widest font-bold mt-1">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 relative z-10">Pronto para acelerar seu sonho?</h2>
            <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto relative z-10">Fale agora com um de nossos consultores e receba uma oferta personalizada.</p>
            <a
              href={`https://wa.me/${whatsPhone || "5511999999999"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white text-orange-600 px-12 py-5 rounded-full font-black text-lg hover:scale-105 transition-transform relative z-10 shadow-xl"
            >
              Chamar no WhatsApp
            </a>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
