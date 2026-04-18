"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

const COMPTE_INITIAL = {
  email: "ramimiriri@gmail.com",
  password: "motdepasse123",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    if (email === COMPTE_INITIAL.email && password === COMPTE_INITIAL.password) {
      router.push("/dashbord/tableau");
    } else {
      setError("E-mail ou mot de passe incorrect.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#064e3b] flex flex-col items-center justify-center px-4">

      {/* Logo + nom au-dessus du titre */}
      <div className="flex items-center gap-0 mb-8">
        <Image
          src="/logoo.png"
          alt="7anouty"
          width={300}
          height={300}
          className="object-contain"
        />
      
      </div>

      {/* Titre + sous-titre */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Ravi de vous revoir</h1>
        <p className="text-white/55 text-sm max-w-xs leading-relaxed">
          Accédez à votre tableau de bord de gestion<br />
          commerciale en toute sécurité
        </p>
      </div>

      {/* White card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              E-mail 
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="votre@boutique.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#064e3b] focus:ring-2 focus:ring-[#064e3b]/10 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Mot de passe
              </label>
              <button type="button" className="text-xs text-[#064e3b] hover:underline font-medium">
                Oublié ?
              </button>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#064e3b] focus:ring-2 focus:ring-[#064e3b]/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 text-xs">
              <AlertCircle size={13} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full bg-[#064e3b] hover:bg-[#065f46] text-white font-semibold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Se connecter
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] text-gray-400 leading-relaxed">
          En continuant, vous confirmez avoir accepté nos{" "}
          <span className="text-[#064e3b] font-medium cursor-pointer hover:underline">
            conditions d&apos;utilisation
          </span>
        </p>
      </div>


      <p className="mt-4 text-[11px] text-white/25">
        © 2026 7anouty Technologies. Tous droits réservés.
      </p>
    </main>
  );
}