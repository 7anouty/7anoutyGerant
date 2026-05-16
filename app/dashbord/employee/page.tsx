"use client";

import { useState, useEffect, useCallback } from "react";
import { CountingNumber } from "@/components/ui/counting-number";
import { getEmployes, creerEmploye, supprimerEmploye } from "@/lib/api";

// ── Types ────────────────────────────────────────────────────
type Poste = "Caissier" | "Responsable Rayon" | "Agent de Sécurité";

type Employe = {
  id: string;
  nom: string;
  prenom: string;
  username: string;
  email: string;
  telephone: string;
  poste: Poste;
};


const POSTE_VERS_API: Record<Poste, string> = {
  "Caissier":           "CAISSIER",
  "Responsable Rayon":  "RESPONSABLE_RAYON",
  "Agent de Sécurité":  "AGENT_DE_SECURITE",
};

const API_VERS_POSTE: Record<string, Poste> = {
  "CAISSIER":           "Caissier",
  "RESPONSABLE_RAYON":  "Responsable Rayon",
  "AGENT_DE_SECURITE":  "Agent de Sécurité",
};

const POSTES: Poste[] = ["Caissier", "Responsable Rayon", "Agent de Sécurité"];

const POSTE_CONFIG: Record<Poste, { bg: string; text: string }> = {
  "Caissier":           { bg: "bg-blue-50",  text: "text-blue-700"  },
  "Responsable Rayon":  { bg: "bg-amber-50", text: "text-amber-700" },
  "Agent de Sécurité":  { bg: "bg-red-50",   text: "text-red-700"   },
};

const FORM_VIDE = {
  nom: "", prenom: "", username: "", email: "",
  motDePasse: "", telephone: "", poste: "" as Poste | "",
};

// ── Helpers ──────────────────────────────────────────────────
function getInitiales(prenom: string, nom: string): string {
  return ((prenom?.[0] ?? "") + (nom?.[0] ?? "")).toUpperCase();
}


function apiToEmploye(d: any): Employe {
  const posteRaw = d.employe?.poste ?? d.poste ?? "";
  return {
    id:        d.idUtilisateur ?? d.id       ?? "",
    nom:       d.nom           ?? "",
    prenom:    d.prenom        ?? "",
    username:  d.username      ?? "",
    email:     d.email         ?? "",
    telephone: d.numTelephone  ?? d.telephone ?? "—",
    poste:     API_VERS_POSTE[posteRaw] ?? "Caissier",
  };
}

const PAR_PAGE = 10;

// ── Page ─────────────────────────────────────────────────────
export default function EmployePage() {
  const [employes, setEmployes]           = useState<Employe[]>([]);
  const [chargement, setChargement]       = useState(true);
  const [erreur, setErreur]               = useState<string | null>(null);
  const [page, setPage]                   = useState(1);
  const [recherche, setRecherche]         = useState("");
  const [modalOuvert, setModalOuvert]     = useState(false);
  const [form, setForm]                   = useState(FORM_VIDE);
  const [showPassword, setShowPassword]   = useState(false);
  const [enregistrement, setEnregistrement] = useState(false);

  // Chargement
  const chargerEmployes = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const data = await getEmployes();
      setEmployes(data.map(apiToEmploye));
    } catch (err) {
      console.error("Erreur chargement employés:", err);
      setErreur("Impossible de charger les employés. Vérifiez la connexion à l'API.");
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { chargerEmployes(); }, [chargerEmployes]);

  // Stats
  const totalEmployes = employes.length;

  // Filtres
  const employesFiltres = employes.filter((e) => {
    const q = recherche.toLowerCase().trim();
    if (!q) return true;
    return (
      e.nom.toLowerCase().includes(q) ||
      e.prenom.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q) ||
      e.username.toLowerCase().includes(q)
    );
  });

  const totalPages   = Math.max(1, Math.ceil(employesFiltres.length / PAR_PAGE));
  const employesPage = employesFiltres.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

  function handleRecherche(val: string) { setRecherche(val); setPage(1); }

  function ouvrirModal() { setForm(FORM_VIDE); setShowPassword(false); setModalOuvert(true); }
  function fermerModal()  { setModalOuvert(false); setForm(FORM_VIDE); }

  const formValide =
    form.nom.trim() !== "" && form.prenom.trim() !== "" &&
    form.username.trim() !== "" && form.email.trim() !== "" &&
    form.motDePasse.trim() !== "" && form.telephone.trim() !== "" &&
    form.poste !== "";

  // Ajouter un employé
  async function handleEnregistrer() {
    if (!formValide || enregistrement) return;
    setEnregistrement(true);
    try {
      const nouveau = await creerEmploye({
        prenom:       form.prenom,
        nom:          form.nom,
        email:        form.email,
        username:     form.username,
        password:     form.motDePasse,
        numTelephone: form.telephone,
        poste:        POSTE_VERS_API[form.poste as Poste],
      });
      setEmployes((prev) => [apiToEmploye(nouveau), ...prev]);
      setPage(1);
      fermerModal();
    } catch (err) {
      console.error("Erreur création employé:", err);
      alert("Erreur lors de la création. Vérifiez la console.");
    } finally {
      setEnregistrement(false);
    }
  }

  // Supprimer un employé
  async function handleSupprimer(id: string) {
    if (!confirm("Supprimer cet employé définitivement ?")) return;
    try {
      await supprimerEmploye(id);
      setEmployes((prev) => {
        const updated  = prev.filter((e) => e.id !== id);
        const newTotal = Math.max(1, Math.ceil(updated.length / PAR_PAGE));
        if (page > newTotal) setPage(newTotal);
        return updated;
      });
    } catch (err) {
      console.error("Erreur suppression:", err);
      alert("Erreur lors de la suppression.");
    }
  }

  return (
    <div className="p-5 flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-medium text-gray-900 uppercase tracking-wide">Gestion des Employés</h1>
          <p className="text-sm text-gray-400 mt-0.5">Gérez le personnel de votre magasin en temps réel.</p>
        </div>
        <button type="button" onClick={ouvrirModal}
          className="flex items-center gap-2 bg-[#064e3b] text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-[#065f46] transition-colors flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Ajouter un Employé
        </button>
      </div>

     {/* Stats */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
  <div className="bg-[#064e3b] text-white p-4 rounded-xl">
    <p className="text-xs text-white/70 mb-1">Total employés</p>
    <h3 className="text-xl font-medium flex items-baseline gap-1">
      <CountingNumber number={totalEmployes} />
      <span className="text-sm font-normal text-white/70">Employés</span>
    </h3>
  </div>
  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
    <p className="text-xs text-blue-700 mb-1">Caissiers</p>
    <h3 className="text-xl font-medium text-blue-700 flex items-baseline gap-1">
      <CountingNumber number={employes.filter((e) => e.poste === "Caissier").length} />
      <span className="text-sm font-normal text-blue-400">en poste</span>
    </h3>
  </div>
  <div className="bg-red-50 p-4 rounded-xl border border-red-200">
    <p className="text-xs text-red-700 mb-1">Agents de Sécurité</p>
    <h3 className="text-xl font-medium text-red-700 flex items-baseline gap-1">
      <CountingNumber number={employes.filter((e) => e.poste === "Agent de Sécurité").length} />
      <span className="text-sm font-normal text-red-400">en poste</span>
    </h3>
  </div>
  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
    <p className="text-xs text-amber-700 mb-1">Responsables Rayon</p>
    <h3 className="text-xl font-medium text-amber-700 flex items-baseline gap-1">
      <CountingNumber number={employes.filter((e) => e.poste === "Responsable Rayon").length} />
      <span className="text-sm font-normal text-amber-400">en poste</span>
    </h3>
  </div>
</div>

      {/* Chargement */}
      {chargement && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm animate-pulse">
          Chargement des employés depuis l'API...
        </div>
      )}

      {/* Erreur */}
      {erreur && !chargement && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm text-red-600">{erreur}</span>
          <button onClick={chargerEmployes}
            className="text-xs text-red-600 border border-red-300 rounded-lg px-3 py-1.5 hover:bg-red-100 transition-colors">
            Réessayer
          </button>
        </div>
      )}

      {/* Table */}
      {!chargement && !erreur && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

          <div className="flex items-center px-4 py-3 border-b border-gray-100">
            <div className="relative flex-1 max-w-xs">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-black" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input type="text" value={recherche} onChange={(e) => handleRecherche(e.target.value)}
                placeholder="Rechercher par nom, ID ou username..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md text-black placeholder-black focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Employé","ID","Username","Email","Téléphone","Poste","Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employesPage.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400 text-sm">Aucun employé trouvé</td></tr>
                ) : (
                  employesPage.map((emp) => {
                    const posteStyle = POSTE_CONFIG[emp.poste];
                    return (
                      <tr key={emp.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-[10px] font-medium text-[#064e3b] flex-shrink-0">
                              {getInitiales(emp.prenom, emp.nom)}
                            </div>
                            <span className="text-gray-900 text-xs font-medium">{emp.prenom} {emp.nom}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-black text-xs">{emp.id}</td>
                        <td className="px-4 py-3 text-black font-mono text-xs">{emp.username}</td>
                        <td className="px-4 py-3 text-black text-xs">{emp.email}</td>
                        <td className="px-4 py-3 text-black text-xs">{emp.telephone}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${posteStyle.bg} ${posteStyle.text}`}>
                            {emp.poste}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button type="button" onClick={() => handleSupprimer(emp.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors" title="Supprimer">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              {`${(page - 1) * PAR_PAGE + 1}–${Math.min(page * PAR_PAGE, employesFiltres.length)} sur ${employesFiltres.length} employés`}
            </span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-2 py-1 text-xs border border-black rounded-md text-black hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">←</button>
              <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-2 py-1 text-xs border border-black rounded-md text-black hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">→</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL ===== */}
      {modalOuvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 pb-4 sticky top-0 bg-white z-10 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Ajouter un Nouvel Employé</h2>
              <p className="text-xs text-gray-400 mt-0.5">Remplissez les informations du nouvel employé.</p>
            </div>

            <div className="px-6 py-5 flex flex-col gap-5">

              {/* Nom + Prénom */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Nom</label>
                  <input type="text" value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                    placeholder="Ex: Bensalem"
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Prénom</label>
                  <input type="text" value={form.prenom} onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
                    placeholder="Ex: Mourad"
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
                </div>
              </div>

              {/* Username + Email */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Username</label>
                  <input type="text" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    placeholder="Ex: m.bensalem"
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 font-mono focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="Ex: m.bensalem@magasin.dz"
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
                </div>
              </div>

              {/* Mot de passe + Téléphone */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Mot de passe</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={form.motDePasse}
                      onChange={(e) => setForm((f) => ({ ...f, motDePasse: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 pr-8 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
                    <button type="button" onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Téléphone</label>
                  <input type="tel" value={form.telephone} onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
                    placeholder="Ex: 0550112233"
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
                </div>
              </div>

              {/* Poste */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Poste</label>
                <div className="grid grid-cols-3 gap-2">
                  {POSTES.map((p) => {
                    const selected = form.poste === p;
                    const style    = POSTE_CONFIG[p];
                    return (
                      <button key={p} type="button" onClick={() => setForm((f) => ({ ...f, poste: p }))}
                        className={`text-[10px] font-semibold py-2 px-2 rounded-lg border transition-all text-center ${
                          selected
                            ? `${style.bg} ${style.text} border-current`
                            : "bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300"
                        }`}>
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button type="button" onClick={fermerModal}
                  className="text-xs font-medium text-gray-700 border border-gray-200 rounded-lg py-2.5 hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button type="button" onClick={handleEnregistrer} disabled={!formValide || enregistrement}
                  className="text-xs font-medium text-white bg-[#064e3b] rounded-lg py-2.5 hover:bg-[#065f46] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  {enregistrement ? "Enregistrement..." : "Enregistrer l'Employé"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}