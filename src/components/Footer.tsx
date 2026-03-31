import { Car, Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

interface StoreSettings {
  phone: string;
  email: string;
  address: string;
  hoursWeek: string;
  hoursSaturday: string;
  hoursSunday: string;
  instagramUrl?: string;
  facebookUrl?: string;
}

export default function Footer() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    fetch("/api/store-settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => {
        // silencioso: se falhar, continua com conteúdo padrão
      });
  }, []);

  const phone = settings?.phone || "(11) 99999-9999";
  const email = settings?.email || "contato@feautos.com.br";
  const address =
    settings?.address || "Av. Principal, 1000 - Centro\nSão Paulo - SP";
  const hoursWeek = settings?.hoursWeek || "09h - 18h";
  const hoursSaturday = settings?.hoursSaturday || "09h - 14h";
  const hoursSunday = settings?.hoursSunday || "Fechado";
  const instagramUrl = settings?.instagramUrl || "#";
  const facebookUrl = settings?.facebookUrl || "#";

  return (
    <footer className="bg-black pt-20 pb-10 px-4 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
              <Car className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tighter">
              Fé <span className="text-orange-500">Autos</span>
            </span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            A fé que te move. Especialistas em veículos de alta qualidade e procedência garantida.
          </p>
          <div className="flex gap-4">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors"
            >
              <Instagram size={20} />
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors"
            >
              <Facebook size={20} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Links Rápidos</h4>
          <ul className="space-y-4">
            <li><a href="#estoque" className="text-gray-500 hover:text-orange-500 text-sm transition-colors">Estoque</a></li>
            <li><a href="#sobre" className="text-gray-500 hover:text-orange-500 text-sm transition-colors">Sobre Nós</a></li>
            <li><a href="#depoimentos" className="text-gray-500 hover:text-orange-500 text-sm transition-colors">Depoimentos</a></li>
            <li><a href="#contato" className="text-gray-500 hover:text-orange-500 text-sm transition-colors">Contato</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Atendimento</h4>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-gray-500 text-sm">
              <Phone size={16} className="text-orange-500" />
              {phone}
            </li>
            <li className="flex items-center gap-3 text-gray-500 text-sm">
              <Mail size={16} className="text-orange-500" />
              {email}
            </li>
            <li className="flex items-start gap-3 text-gray-500 text-sm">
              <MapPin size={16} className="text-orange-500 mt-1" />
              <span>
                {address.split("\n").map((line, idx) => (
                  <span key={idx} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">Horário</h4>
          <ul className="space-y-4">
            <li className="text-gray-500 text-sm flex justify-between">
              <span>Segunda a Sexta</span>
              <span className="text-white font-medium">{hoursWeek}</span>
            </li>
            <li className="text-gray-500 text-sm flex justify-between">
              <span>Sábado</span>
              <span className="text-white font-medium">{hoursSaturday}</span>
            </li>
            <li className="text-gray-500 text-sm flex justify-between">
              <span>Domingo</span>
              <span className="text-red-500 font-medium tracking-widest uppercase text-[10px] mt-1">
                {hoursSunday}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-10 border-t border-white/5 text-center">
        <p className="text-gray-600 text-[10px] uppercase tracking-[0.2em]">
          © 2026 Fé Autos. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
