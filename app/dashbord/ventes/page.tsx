"use client";

import { useState, useEffect, useCallback } from "react";
import { CountingNumber } from "@/components/ui/counting-number";
import { getRecus } from "@/lib/api";

// ── Types ────────────────────────────────────────────────────
type AchatItem = {
  nom: string;
  quantite: number;
  prix: number;
  image?: string | null;
  type: "produit" | "offre";
};

type Vente = {
  id: string;
  numRecu: string;
  client: string;
  amount: number;
  date: string;
  achats: AchatItem[];
};

// ── Helpers ──────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" });
}

function getInitiales(client: string): string {
  return client.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function formatMontant(val: number): string {
  return val.toLocaleString("fr-DZ") + " DA";
}

function filtrerParPeriode(liste: Vente[], filtre: string) {
  const today = new Date();
  return liste.filter((v) => {
    const d = new Date(v.date);
    if (filtre === "Aujourd'hui") return d.toDateString() === today.toDateString();
    if (filtre === "Ce mois") return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    if (filtre === "Cette année") return d.getFullYear() === today.getFullYear();
    return true;
  });
}

const PAR_PAGE = 10;


function AchatBadge({ item }: { item: AchatItem }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${
        item.type === "offre"
          ? "bg-amber-50 text-amber-700 border border-amber-200"
          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
      }`}
    >
      {item.type === "offre" ? (
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ) : (
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      )}
      {item.quantite > 1 && <span className="font-bold">{item.quantite}×</span>}
      <span className="max-w-[90px] truncate">{item.nom}</span>
    </span>
  );
}


export default function VentesPage() {
  const [ventes, setVentes]         = useState<Vente[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur]         = useState<string | null>(null);
  const [page, setPage]             = useState(1);
  const [filtre, setFiltre]         = useState("Tous");
  const [recherche, setRecherche]   = useState("");
  // Ajoute cet état en haut du composant (avec les autres useState)
const [filtreOpen, setFiltreOpen] = useState(false);

const filtreOptions = ["Tous", "Aujourd'hui", "Ce mois", "Cette année"];

  
  const chargerVentes = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const recus = await getRecus();

      const ventesAvecClients = recus.map((r: any) => {
        // Construire la liste des achats (produits + offres)
        const achats: AchatItem[] = [];

        if (Array.isArray(r.produits)) {
          r.produits.forEach((p: any) => {
            achats.push({
              nom:      p.nomProduit ?? "Produit",
              quantite: p.quantite ?? 1,
              prix:     p.subtotal ?? p.prixUnitaire ?? 0,
              image:    p.imageP ?? null,
              type:     "produit",
            });
          });
        }

        if (Array.isArray(r.offres) && r.offres.length > 0) {
          r.offres.forEach((o: any) => {
            achats.push({
              nom:      o.titreOffre ?? "Offre",
              quantite: 1,
              prix:     o.prixPromo ?? 0,
              type:     "offre",
            });
          });
        }

        return {
          id:      r.idRecu,
          numRecu: r.numRecu,
          client:  r.client
            ? `${r.client.firstName} ${r.client.lastName}`
            : "Client inconnu",
          amount:  r.prix_total,
          date:    r.dateR,
          achats,
        };
      });

      setVentes(ventesAvecClients);
    } catch (err) {
      console.error(err);
      setErreur("Impossible de charger les ventes. Vérifiez la connexion à l'API.");
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { chargerVentes(); }, [chargerVentes]);

  // ── Stats ─────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalRevenus     = ventes.reduce((sum, v) => sum + v.amount, 0);
  const ventesAujourdhui = ventes.filter((v) => new Date(v.date).toDateString() === today.toDateString());
  const totalAujourdhui  = ventesAujourdhui.reduce((sum, v) => sum + v.amount, 0);
  const panierMoyen      = ventesAujourdhui.length > 0
    ? Math.round(totalAujourdhui / ventesAujourdhui.length) : 0;

  // ── Filtres ───────────────────────────────────────────────
  const ventesFiltrees = filtrerParPeriode(ventes, filtre).filter((v) => {
    const q = recherche.toLowerCase().trim();
    if (!q) return true;
    return v.client.toLowerCase().includes(q) || v.id.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(ventesFiltrees.length / PAR_PAGE));
  const ventesPage = ventesFiltrees.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

  return (
    <div className="p-5 flex flex-col gap-4">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-medium text-gray-900 uppercase tracking-wide">Historique des ventes</h1>
        <p className="text-sm text-gray-400 mt-0.5">Visualisation et gestion complète des transactions de votre magasin.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-[#064e3b] text-white p-4 rounded-xl">
          <p className="text-xs text-white/70 mb-1">Total revenus</p>
          <h3 className="text-xl font-medium flex items-baseline gap-1">
            <CountingNumber number={totalRevenus} />
            <span className="text-sm font-normal text-white/70">DA</span>
          </h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Ventes du jour</p>
          <h3 className="text-xl font-medium text-gray-900 flex items-baseline gap-1">
            <CountingNumber number={totalAujourdhui} />
            <span className="text-sm font-normal text-gray-400">DA</span>
          </h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Panier moyen</p>
          <h3 className="text-xl font-medium text-gray-900 flex items-baseline gap-1">
            <CountingNumber number={panierMoyen} />
            <span className="text-sm font-normal text-gray-400">DA</span>
          </h3>
        </div>
      </div>

      {/* Chargement */}
      {chargement && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm animate-pulse">
          Chargement des ventes depuis l'API...
        </div>
      )}

      {/* Erreur */}
      {erreur && !chargement && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm text-red-600">{erreur}</span>
          <button onClick={chargerVentes}
            className="text-xs text-red-600 border border-red-300 rounded-lg px-3 py-1.5 hover:bg-red-100 transition-colors">
            Réessayer
          </button>
        </div>
      )}

      {/* Table */}
      {!chargement && !erreur && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 gap-3">
            <div className="relative flex-1 max-w-xs">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-black" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input type="text" value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }}
                placeholder="Rechercher par client ou N° reçu..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md text-black placeholder-black focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
            </div>
           <div className="relative flex-shrink-0">
  <button
    type="button"
    onClick={() => setFiltreOpen((o) => !o)}
    className="text-xs text-black border border-gray-200 rounded-md px-2 py-1.5 bg-white flex items-center gap-2 min-w-[120px] justify-between"
  >
    {filtre}
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M6 9l6 6 6-6" />
    </svg>
  </button>

  {filtreOpen && (
    <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[140px] overflow-hidden">
      {filtreOptions.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => {
            setFiltre(opt);
            setPage(1);
            setFiltreOpen(false);
          }}
          className={`w-full text-left px-3 py-2 text-xs transition-colors ${
            filtre === opt
              ? "bg-[#064e3b] text-white"
              : "text-gray-700 hover:bg-emerald-50 hover:text-[#064e3b]"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )}
</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Client", "Id Reçu", "A acheté", "Montant", "Date"].map((h) => (
                    <th key={h} className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ventesPage.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-sm">Aucune vente enregistrée</td></tr>
                ) : (
                  ventesPage.map((vente) => (
                    <tr key={vente.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      {/* Client */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-[10px] font-medium text-[#064e3b] flex-shrink-0">
                            {getInitiales(vente.client)}
                          </div>
                          <span className="text-gray-900 text-xs">{vente.client}</span>
                        </div>
                      </td>

                     
                      <td className="px-4 py-3 text-black text-xs">{vente.id}</td>

                    
                      <td className="px-4 py-3">
                        {vente.achats.length === 0 ? (
                          <span className="text-gray-300 text-xs italic">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-[280px]">
                            {vente.achats.map((item, i) => (
                              <AchatBadge key={i} item={item} />
                            ))}
                          </div>
                        )}
                      </td>

                      
                      <td className="px-4 py-3 text-black text-xs font-medium whitespace-nowrap">
                        {formatMontant(vente.amount)}
                      </td>

                    
                      <td className="px-4 py-3 text-black text-xs whitespace-nowrap">
                        {formatDate(vente.date)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              {`${(page - 1) * PAR_PAGE + 1}–${Math.min(page * PAR_PAGE, ventesFiltrees.length)} sur ${ventesFiltrees.length} ventes`}
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