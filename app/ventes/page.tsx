"use client";

import { useState } from "react";

const ventes = [
  { id: "TR-1042", client: "Ahmmed M.", initials: "AM", amount: 3200, date: "09 Avr 2025" },
  { id: "TR-1041", client: "Sara B.", initials: "SB", amount: 1800, date: "09 Avr 2026"},
  { id: "TR-1040", client: "Karim H.", initials: "KH", amount: 5500, date: "08 Avr 2026"},
  { id: "TR-1039", client: "Nadia R.", initials: "NR", amount: 900, date: "08 Avr 2026" },
  { id: "TR-1038", client: "Youcef L.", initials: "YL", amount: 2100, date: "07 Avr 2026" },
  { id: "TR-1042", client: "Ahmed M.", initials: "AM", amount: 3200, date: "09 Avr 2026"},
  { id: "TR-1041", client: "Sara B.", initials: "SB", amount: 1800, date: "09 Avr 2026"},
  { id: "TR-1040", client: "Karim H.", initials: "KH", amount: 5500, date: "08 Avr 2026"},
  { id: "TR-1039", client: "Nadia R.", initials: "NR", amount: 900, date: "08 Avr 2026"},
  { id: "TR-1038", client: "Youcef L.", initials: "YL", amount: 2100, date: "07 Avr 2026"},
  { id: "TR-1041", client: "Sara B.", initials: "SB", amount: 1800, date: "09 Avr 2026"},
  { id: "TR-1040", client: "Karim H.", initials: "KH", amount: 5500, date: "08 Avr 2026" },
  { id: "TR-1039", client: "Nadia R.", initials: "NR", amount: 900, date: "08 Avr 2026" },
  { id: "TR-1038", client: "Youcef L.", initials: "YL", amount: 2100, date: "07 Avr 2026"},
];

const moisMap: Record<string, number> = {
  Jan: 0, Fév: 1, Mar: 2, Avr: 3, Mai: 4, Jun: 5,
  Jul: 6, Aoû: 7 , Sep: 8, Oct: 9, Nov: 10, Déc: 11,
};

function parseDate(dateStr: string): Date {
  const [jour, mois, annee] = dateStr.split(" ");
  return new Date(parseInt(annee), moisMap[mois], parseInt(jour));
}

function filtrerParPeriode(liste: typeof ventes, filtre: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return liste.filter((v) => {
    const d = parseDate(v.date);
    if (filtre === "Aujourd'hui") {
      return d.toDateString() === today.toDateString();
    }
    if (filtre === "Ce mois") {
      return (
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );
    }
    if (filtre === "Cette année") {
      return d.getFullYear() === today.getFullYear();
    }
    return true;
  });
}

function formatMontant(val: number): string {
  return val.toLocaleString("fr-DZ") + " DA";
}

const PAR_PAGE = 10;

export default function VentesPage() {
  const [page, setPage] = useState(1);
  const [filtre, setFiltre] = useState("Tous");
  const [recherche, setRecherche] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  
  const totalRevenus = ventes.reduce((sum, v) => sum + v.amount, 0);
  
  const ventesAujourdhui = ventes.filter(
    (v) => parseDate(v.date).toDateString() === today.toDateString()
  );
  const totalAujourdhui = ventesAujourdhui.reduce((sum, v) => sum + v.amount, 0);

  const panierMoyen =
    ventesAujourdhui.length > 0
      ? Math.round(totalAujourdhui / ventesAujourdhui.length)
      : 0;

  // Table filtrée
  const ventesFiltrees = filtrerParPeriode(ventes, filtre).filter((v) => {
    const q = recherche.toLowerCase().trim();
    if (!q) return true;
    return (
      v.client.toLowerCase().includes(q) ||
      v.id.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(ventesFiltrees.length / PAR_PAGE));
  const ventesPage = ventesFiltrees.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

  function handleFiltre(val: string) {
    setFiltre(val);
    setPage(1);
  }

  function handleRecherche(val: string) {
    setRecherche(val);
    setPage(1);
  }

  return (
    <div className="p-5 flex flex-col gap-4">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-medium text-gray-900">Historique des ventes</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-[#064e3b] text-white p-4 rounded-xl">
          <p className="text-xs text-white/70 mb-1">Total revenus</p>
          <h3 className="text-xl font-medium">{formatMontant(totalRevenus)}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Ventes du jour</p>
          <h3 className="text-xl font-medium text-gray-900">{formatMontant(totalAujourdhui)}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Panier moyen</p>
          <h3 className="text-xl font-medium text-gray-900">{formatMontant(panierMoyen)}</h3>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 gap-3">
          <div className="relative flex-1 max-w-xs">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-black"
              width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={recherche}
              onChange={(e) => handleRecherche(e.target.value)}
              placeholder="Rechercher par client ou ID..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md text-black placeholder-black focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]"
            />
          </div>
          <select
            value={filtre}
            onChange={(e) => handleFiltre(e.target.value)}
            className="text-xs text-black border border-gray-200 rounded-md px-2 py-1.5 bg-transparent flex-shrink-0"
          >
            <option>Tous</option>
            <option>Aujourd'hui</option>
            <option>Ce mois</option>
            <option>Cette année</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Client</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Transaction</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Montant</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody>
              {ventesPage.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400 text-sm">
                    Aucune vente enregistrée
                  </td>
                </tr>
              ) : (
                ventesPage.map((vente, index) => (
                  <tr key={`${vente.id}-${index}`} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-[10px] font-medium text-[#064e3b] flex-shrink-0">
                          {vente.initials}
                        </div>
                        <span className="text-gray-900">{vente.client}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-black">{vente.id}</td>
                    <td className="px-4 py-3 text-black">{formatMontant(vente.amount)}</td>
                    <td className="px-4 py-3 text-black">{vente.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {`${(page - 1) * PAR_PAGE + 1}–${Math.min(page * PAR_PAGE, ventesFiltrees.length)} sur ${ventesFiltrees.length} ventes`}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2 py-1 text-xs border border-black rounded-md text-black hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2 py-1 text-xs border border-black rounded-md text-black hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}