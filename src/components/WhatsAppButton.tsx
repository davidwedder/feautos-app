import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface StoreSettings {
  phone: string;
}

export default function WhatsAppButton() {
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/store-settings")
      .then((res) => res.json())
      .then((data: StoreSettings) => {
        if (data?.phone) setPhone(data.phone);
      })
      .catch(() => {
        // em caso de erro, mantém o número padrão
      });
  }, []);

  const buildWhatsAppLink = () => {
    const fallback = "5511999999999";
    if (!phone) return `https://wa.me/${fallback}`;

    // Remove tudo que não for dígito
    let digits = phone.replace(/\D/g, "");
    // Garante código do Brasil (55) na frente se não tiver
    if (!digits.startsWith("55")) {
      digits = "55" + digits;
    }
    return `https://wa.me/${digits}`;
  };

  return (
    <motion.a
      href={buildWhatsAppLink()}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-50 bg-[#25D366] text-white p-3 sm:p-4 rounded-full shadow-[0_10px_30px_rgba(37,211,102,0.4)] flex items-center justify-center"
    >
      <MessageCircle size={32} fill="currentColor" />
    </motion.a>
  );
}
