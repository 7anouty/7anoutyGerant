"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { getMonProfil, modifierCredentials } from "@/lib/api";

export default function ConfigurationPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profil chargé depuis l'API
  const [profil, setProfil] = useState<{ email: string; username: string } | null>(null);
  const [chargement, setChargement] = useState(true);

  const [newUsername, setNewUsername]         = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors]       = useState<string[]>([]);
  const [success, setSuccess]     = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);

  // ── Chargement du profil ─────────────────────────────────
  useEffect(() => {
    async function charger() {
      try {
        const data = await getMonProfil();
        setProfil({
          email:    data.email ?? data.mail ?? "",
          username: data.username ?? data.userName ?? "",
        });
      } catch (err) {
        console.error("Erreur chargement profil:", err);
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, []);

  // ── Enregistrer ──────────────────────────────────────────
  async function handleEnregistrer() {
    const errs: string[] = [];
    setSuccess(false);

    const wantsUsername = newUsername.trim() !== "";
    const wantsPassword = currentPassword !== "" || newPassword !== "" || confirmPassword !== "";

    if (!wantsUsername && !wantsPassword) {
      setErrors(["Aucune modification à enregistrer."]);
      return;
    }

    // Validations locales
    if (wantsUsername && newUsername.trim().length < 3)
      errs.push("Le nom d'utilisateur doit contenir au moins 3 caractères.");

    if (wantsPassword) {
      if (!currentPassword)
        errs.push("Veuillez saisir votre mot de passe actuel.");
      else if (newPassword.length < 8)
        errs.push("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      else if (newPassword !== confirmPassword)
        errs.push("Les mots de passe ne correspondent pas.");
    }

    if (errs.length > 0) { setErrors(errs); return; }

    setEnregistrement(true);
    try {
      // Construire le payload selon ce que l'utilisateur veut modifier
      const payload: Record<string, string> = {};
      if (wantsUsername)  payload.username        = newUsername.trim();
      if (wantsPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword     = newPassword;
      }

      await modifierCredentials(payload);

      // Mettre à jour l'affichage local
      if (wantsUsername && profil) {
        setProfil((prev) => prev ? { ...prev, username: newUsername.trim() } : prev);
      }

      setErrors([]);
      setSuccess(true);
      setNewUsername("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      // L'API retourne un message d'erreur (ex: mot de passe incorrect)
      setErrors([err.message ?? "Erreur lors de la mise à jour. Réessayez."]);
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <div className="p-6 flex flex-col gap-5 h-full">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-lg font-medium text-gray-900 uppercase tracking-wide">
            Configuration du compte
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Gérez vos informations d'accès et sécurisez votre compte administrateur.
          </p>
        </div>
        <button type="button" onClick={handleEnregistrer} disabled={enregistrement}
          className="px-4 py-2 text-sm text-white bg-[#064e3b] rounded-md hover:bg-[#065f46] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {enregistrement ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </div>

      {/* Succès */}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
          <CheckCircle size={15} className="flex-shrink-0" />
          Modifications enregistrées avec succès.
        </div>
      )}

      {/* Erreurs */}
      {errors.length > 0 && (
        <div className="flex flex-col gap-1 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
          {errors.map((e, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle size={13} className="flex-shrink-0" />
              {e}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1">

        {/* Left */}
        <div className="md:col-span-2 flex flex-col gap-5">

          {/* Identifiants */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#064e3b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h2 className="text-base font-medium text-gray-900 uppercase tracking-wide">
                Identifiants de connexion
              </h2>
            </div>

            {chargement ? (
              <div className="animate-pulse flex flex-col gap-3">
                <div className="h-10 bg-gray-100 rounded-md" />
                <div className="h-10 bg-gray-100 rounded-md" />
              </div>
            ) : (
              <div className="flex flex-col gap-5">

                {/* Email — lecture seule */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Adresse email <span className="normal-case font-normal text-gray-400">(non modifiable)</span>
                  </label>
                  <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-md bg-gray-50">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                    <span className="text-sm text-gray-400">{profil?.email ?? "—"}</span>
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Username actuel
                  </label>
                  <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-md bg-gray-50 mb-3">
                    <span className="text-sm text-gray-500 font-mono">{profil?.username ?? "—"}</span>
                  </div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Nouveau username
                  </label>
                  <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Entrer le nouveau username"
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-md text-gray-700 placeholder-gray-300 font-mono focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
                </div>
              </div>
            )}
          </div>

          {/* Mot de passe */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#064e3b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h2 className="text-base font-medium text-gray-900 uppercase tracking-wide">
                Sécurité du mot de passe
              </h2>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Mot de passe actuel</label>
                <div className="relative">
                  <input type={showCurrentPassword ? "text" : "password"} value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••••"
                    className="w-full px-4 py-3 pr-10 text-sm border border-gray-200 rounded-md text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                    {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nouveau mot de passe</label>
                  <div className="relative">
                    <input type={showNewPassword ? "text" : "password"} value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 8 caractères"
                      className="w-full px-4 py-3 pr-10 text-sm border border-gray-200 rounded-md text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                      {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Confirmer mot de passe</label>
                  <div className="relative">
                    <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Répétez le mot de passe"
                      className="w-full px-4 py-3 pr-10 text-sm border border-gray-200 rounded-md text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conseils */}
        <div className="flex flex-col">
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex-1">
            <div className="flex items-center gap-2 mb-6">
              <Shield size={30} className="text-[#064e3b]" />
              <h2 className="text-base font-medium text-gray-900 uppercase tracking-wide">
                Conseils de sécurité
              </h2>
            </div>
            <ul className="flex flex-col gap-5">
              {[
                "Utilisez un username unique et facile à retenir.",
                "Votre mot de passe doit contenir au moins 8 caractères.",
                "L'adresse email est gérée par votre administrateur système.",
                "Ne partagez jamais vos identifiants avec d'autres personnes.",
              ].map((conseil, i) => (
                <li key={i} className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-[#064e3b] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-500 leading-relaxed">{conseil}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}