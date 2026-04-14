"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const supabase = createClient();

    if (mode === "login") {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      router.push("/");
      router.refresh();
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      setSuccess("Compte créé ! Vérifiez votre email pour confirmer votre inscription.");
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-brand-beige-dark rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange bg-white transition-all";

  return (
    <div className="min-h-screen bg-brand-beige flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-orange flex items-center justify-center mb-4 shadow-soft">
            <svg width="40" height="40" viewBox="0 0 36 36" fill="none">
              <path d="M9 13c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V13z" fill="white" opacity="0.9"/>
              <rect x="12" y="16" width="8" height="1.5" rx="0.75" fill="#FF8C42"/>
              <rect x="12" y="19" width="5" height="1.5" rx="0.75" fill="#FF8C42" opacity="0.6"/>
              <path d="M11 13 L8 9 L13 11z" fill="white"/>
              <path d="M25 13 L28 9 L23 11z" fill="white"/>
              <circle cx="15.5" cy="14" r="1" fill="#FF8C42"/>
              <circle cx="20.5" cy="14" r="1" fill="#FF8C42"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Facture Cat 🐱</h1>
          <p className="text-brand-gray-soft text-sm mt-1">Comptabilité intelligente</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card border border-brand-beige-dark p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            {mode === "login" ? "Connexion" : "Créer un compte"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-brand-gray-soft mb-1.5 block">Email</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.fr" className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-brand-gray-soft mb-1.5 block">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" className={inputClass + " pr-11"}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-soft hover:text-gray-700">
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-sm text-red-600">
                <AlertCircle size={14} />{error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 rounded-xl text-sm text-green-700">{success}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-brand-orange text-white py-3 rounded-xl font-medium text-sm hover:bg-brand-orange-light disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 size={15} className="animate-spin"/> Chargement…</> : (mode === "login" ? "Se connecter" : "Créer mon compte")}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button onClick={() => { setMode(m => m === "login" ? "signup" : "login"); setError(""); setSuccess(""); }}
              className="text-sm text-brand-orange hover:underline">
              {mode === "login" ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-brand-gray-soft mt-6">🔒 Données sécurisées par Supabase</p>
      </div>
    </div>
  );
}
