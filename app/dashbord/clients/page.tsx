"use client";

import { useState, useEffect, useCallback } from "react";
import { CountingNumber } from "@/components/ui/counting-number";
import { getClients, type ClientAPI } from "@/lib/api";

// ── Types ────────────────────────────────────────────────────
type Client = {
  id: string;
  nom: string;
  prenom: string;
  username: string;
  email: string;
  telephone: string;
  dateCreation: string;
};

// ── Helpers ──────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" });
}

function getInitiales(prenom: string, nom: string): string {
  return ((prenom?.[0] ?? "") + (nom?.[0] ?? "")).toUpperCase();
}


function apiToClient(d: any): Client {
  return {
    id:           d.idUtilisateur ?? d.id          ?? "",
    nom:          d.nom          ?? "",
    prenom:       d.prenom       ?? "",
    username:     d.username     ?? "",
    email:        d.email        ?? "",
    telephone:    d.numTelephone  ?? d.telephone   ?? "—",
    dateCreation: d.createdAt     ?? d.dateCreation ?? "",
  };
}

const PAR_PAGE = 10;
const today    = new Date();
const _30_JOURS = new Date(today);
_30_JOURS.setDate(_30_JOURS.getDate() - 30);

// ── Page ─────────────────────────────────────────────────────
export default function ClientsPage() {
  const [clients, setClients]       = useState<Client[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur]         = useState<string | null>(null);
  const [page, setPage]             = useState(1);
  const [recherche, setRecherche]   = useState("");

  // Chargement depuis l'API
  const chargerClients = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const data = await getClients();
      setClients(data.map(apiToClient));
    } catch (err) {
      console.error("Erreur chargement clients:", err);
      setErreur("Impossible de charger les clients. Vérifiez la connexion à l'API.");
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { chargerClients(); }, [chargerClients]);

  // Stats
  const totalClients    = clients.length;
  const nouveauxClients = clients.filter(
    (c) => c.dateCreation && new Date(c.dateCreation) >= _30_JOURS
  ).length;

  // Filtres
  const clientsFiltres = clients.filter((c) => {
  const q = recherche.toLowerCase().trim();
  if (!q) return true;
  const nomComplet = `${c.prenom} ${c.nom}`.toLowerCase();
  const nomInverse = `${c.nom} ${c.prenom}`.toLowerCase(); 
  return (
    nomComplet.includes(q) ||
    nomInverse.includes(q) ||
    c.id.toLowerCase().includes(q) ||
    c.username.toLowerCase().includes(q) 
  );
});
  const totalPages  = Math.max(1, Math.ceil(clientsFiltres.length / PAR_PAGE));
  const clientsPage = clientsFiltres.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

  function handleRecherche(val: string) { setRecherche(val); setPage(1); }

  return (
    <div className="p-5 flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-medium text-gray-900 uppercase tracking-wide">Répertoire Clients</h1>
          <p className="text-sm text-gray-400 mt-0.5">Gérez votre base de données clients en temps réel.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-[#064e3b] text-white p-4 rounded-xl">
          <p className="text-xs text-white/70 mb-1">Total clients</p>
          <h3 className="text-xl font-medium flex items-baseline gap-1">
            <CountingNumber number={totalClients} />
            <span className="text-sm font-normal text-white/70">Clients</span>
          </h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Nouveaux clients</p>
          <h3 className="text-xl font-medium text-gray-900 flex items-baseline gap-1">
            <CountingNumber number={nouveauxClients} />
            <span className="text-sm font-normal text-gray-400">inscrits ces 30 derniers jours</span>
          </h3>
        </div>
      </div>

      {/* Chargement */}
      {chargement && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm animate-pulse">
          Chargement des clients depuis l'API...
        </div>
      )}

      {/* Erreur */}
      {erreur && !chargement && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm text-red-600">{erreur}</span>
          <button onClick={chargerClients}
            className="text-xs text-red-600 border border-red-300 rounded-lg px-3 py-1.5 hover:bg-red-100 transition-colors">
            Réessayer
          </button>
        </div>
      )}

      {/* Table */}
      {!chargement && !erreur && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

          {/* Barre de recherche */}
          <div className="flex items-center px-4 py-3 border-b border-gray-100">
            <div className="relative flex-1 max-w-xs">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-black" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={recherche}
                onChange={(e) => handleRecherche(e.target.value)}
                placeholder="Rechercher par nom, ID ou username..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md text-black placeholder-black focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Client</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">ID Client</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Username</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Email</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Téléphone</th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Date de création</th>
                </tr>
              </thead>
              <tbody>
                {clientsPage.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Aucun client trouvé</td>
                  </tr>
                ) : (
                  clientsPage.map((client) => (
                    <tr key={client.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-[10px] font-medium text-[#064e3b] flex-shrink-0">
                            {getInitiales(client.prenom, client.nom)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-900 text-xs font-medium">{client.prenom} {client.nom}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-black text-xs">{client.id}</td>
                      <td className="px-4 py-3 text-black font-mono text-xs">{client.username}</td>
                      <td className="px-4 py-3 text-black text-xs">{client.email}</td>
                      <td className="px-4 py-3 text-black text-xs">{client.telephone}</td>
                      <td className="px-4 py-3 text-black text-xs">{formatDate(client.dateCreation)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              {`${(page - 1) * PAR_PAGE + 1}–${Math.min(page * PAR_PAGE, clientsFiltres.length)} sur ${clientsFiltres.length} clients`}
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
    </div>
  );
}