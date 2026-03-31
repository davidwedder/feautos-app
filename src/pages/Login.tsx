import { useState, useEffect } from "react";
import { LogIn, Mail } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Check if already logged in (flag simples no navegador)
    const isAuth = localStorage.getItem("feautos_auth") === "1";
    if (isAuth) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        // Marca autenticação local no navegador
        localStorage.setItem("feautos_auth", "1");
        toast.success("Login realizado com sucesso!");
        navigate("/admin");
      } else {
        toast.error(data.error || "Falha ao entrar. Verifique suas credenciais.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro na conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#151515] p-6 rounded-3xl border border-white/5 max-w-sm w-full text-center shadow-2xl"
      >
        <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
          <LogIn className="text-white" size={28} />
        </div>
        <h1 className="text-2xl font-bold mb-3">Área Administrativa</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Faça login com o usuário administrador para gerenciar o estoque.
        </p>

        <form onSubmit={handleLogin} className="space-y-3 text-left">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black py-3 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-all disabled:opacity-50 text-sm"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Mail size={20} />
                Entrar
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-[10px] text-gray-600 uppercase tracking-widest font-bold text-center">
          Apenas administradores autorizados
        </p>
      </motion.div>
    </div>
  );
}
