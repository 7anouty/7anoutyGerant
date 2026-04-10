"use client";

import { useState } from "react";
import { Eye, EyeOff, Shield, AlertCircle, CheckCircle } from "lucide-react";

const COMPTE_INITIAL = {
  email: "y.amrani@7anouty.ma",
  password: "motdepasse123",
};

export default function ConfigurationPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [compte, setCompte] = useState(COMPTE_INITIAL);

  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  function handleEnregistrer() {
    const errs: string[] = [];
    setSuccess(false);

    const wantsEmail = newEmail.trim() !== "" || confirmEmail.trim() !== "";
    const wantsPassword = currentPassword !== "" || newPassword !== "" || confirmPassword !== "";

    if (!wantsEmail && !wantsPassword) {
      setErrors(["Aucune modification à enregistrer."]);
      return;
    }

    if (wantsEmail) {
      if (!newEmail.includes("@")) errs.push("L'email est invalide.");
      else if (newEmail !== confirmEmail) errs.push("Les emails ne correspondent pas.");
    }

    if (wantsPassword) {
      if (currentPassword !== compte.password)
        errs.push("Le mot de passe actuel est incorrect.");
      if (!newPassword) errs.push("Veuillez entrer un nouveau mot de passe.");
      else if (newPassword.length < 8) errs.push("Le mot de passe doit contenir au moins 8 caractères.");
      else if (newPassword !== confirmPassword) errs.push("Les mots de passe ne correspondent pas.");
    }

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    setCompte((prev) => {
  let updatedEmail = prev.email;
  let updatedPassword = prev.password;

  if (wantsEmail) {
    updatedEmail = newEmail;
  }

  if (wantsPassword) {
    updatedPassword = newPassword;
  }

  return {
    email: updatedEmail,
    password: updatedPassword,
  };
  });

    setErrors([]);
    setSuccess(true);
    setNewEmail("");
    setConfirmEmail("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
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
        <button type="button" onClick={handleEnregistrer} className="px-4 py-2 text-sm text-white bg-[#064e3b] rounded-md hover:bg-[#065f46] transition-colors">
          Enregistrer les modifications
        </button>
      </div>

      {/* ki tmchi */}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
          <CheckCircle size={15} className="flex-shrink-0" />
          Modifications enregistrées avec succès.
        </div>
      )}

      {/* kayn erreur */}
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
        <div className="md:col-span-2 flex flex-col gap-5 flex-1">

          {/* email */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#064e3b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <h2 className="text-base font-medium text-gray-900 uppercase tracking-wide">
                Identifiants de connexion
              </h2>
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-sm text-gray-400 uppercase tracking-wide mb-2">Email actuel</label>
                <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-500">{compte.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 uppercase tracking-wide mb-2">Nouvel email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Entrer le nouvel email"
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-md text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 uppercase tracking-wide mb-2">Confirmer nouvel email</label>
                  <input
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    placeholder="Confirmer le nouvel email"
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-md text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mdp*/}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex-1">
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

            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-sm text-gray-400 uppercase tracking-wide mb-2">Mot de passe actuel</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full px-4 py-3 pr-10 text-sm border border-gray-200 rounded-md text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]"
                  />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                    {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 uppercase tracking-wide mb-2">Nouveau mot de passe</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 caractères"
                      className="w-full px-4 py-3 pr-10 text-sm border border-gray-200 rounded-md text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]"
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                      {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 uppercase tracking-wide mb-2">Confirmer mot de passe</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Répétez le mot de passe"
                      className="w-full px-4 py-3 pr-10 text-sm border border-gray-200 rounded-md text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* advice */}
        <div className="flex flex-col flex-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex-1">
            <div className="flex items-center gap-2 mb-6">
              <Shield size={30} className="text-[#064e3b]" />
              <h2 className="text-base font-medium text-gray-900 uppercase tracking-wide">
                Conseils de sécurité
              </h2>
            </div>
            <ul className="flex flex-col gap-5">
              {[
                "Utilisez un mot de passe unique que vous n'utilisez pour aucun autre compte en ligne.",
                "Votre mot de passe doit contenir au moins 8 caractères.",
                "Le changement d'email nécessite une nouvelle connexion lors de votre prochaine session.",
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