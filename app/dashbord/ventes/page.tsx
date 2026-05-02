"use client";

import { useState } from "react";
import { CountingNumber } from "@/components/ui/counting-number";


type ventes = {
  id: string;
  client: string;
  amount: number;
  date: string;
};

const ventes = [
  { id: "TR-1043", client: "Ramy Kaci",  amount: 8500, date: "2026-01-17" },
  { id: "TR-1042", client: "Anis M.",    amount: 2500, date: "2026-03-17" },
  { id: "TR-1041", client: "Sara B.",    amount: 1800, date: "2026-04-28" },
  { id: "TR-1040", client: "Karim H.",   amount: 5500, date: "2026-04-28" },
  { id: "TR-1039", client: "Nadia R.",   amount:  900, date: "2026-03-08" },
  { id: "TR-1038", client: "Youcef L.",  amount: 2100, date: "2026-01-07" },
  { id: "TR-1037", client: "Ahmed M.",   amount: 3200, date: "2026-01-09" },
  { id: "TR-1036", client: "Sara B.",    amount: 1800, date: "2026-02-09" },
  { id: "TR-1035", client: "Karim H.",   amount: 5500, date: "2025-11-08" },
  { id: "TR-1034", client: "Nadia R.",   amount:  900, date: "2025-11-08" },
  { id: "TR-1033", client: "Youcef L.",  amount: 2100, date: "2025-12-07" },
  { id: "TR-1032", client: "Sara B.",    amount: 1800, date: "2025-10-09" },
  { id: "TR-1031", client: "Karim H.",   amount: 5500, date: "2025-10-08" },
  { id: "TR-1030", client: "Nadia R.",   amount:  900, date: "2025-09-08" },
  { id: "TR-1029", client: "Youcef L.",  amount: 2100, date: "2025-09-07" },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" });
}

function getInitiales(client: string): string {
  return client.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function filtrerParPeriode(liste: typeof ventes, filtre: string) {
  const today = new Date();

  return liste.filter((v) => {
    const d = new Date(v.date);
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
    (v) => new Date(v.date).toDateString() === today.toDateString()
  );
  const totalAujourdhui = ventesAujourdhui.reduce((sum, v) => sum + v.amount, 0);

  const panierMoyen =
    ventesAujourdhui.length > 0
      ? Math.round(totalAujourdhui / ventesAujourdhui.length)
      : 0;

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
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-medium text-gray-900 uppercase tracking-wide">Historique des ventes</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Visualisation et gestion complète des transactions de votre magasin.
        </p>
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 gap-3">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-black" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
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
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-[10px] font-medium text-[#064e3b] flex-shrink-0">
                          {getInitiales(vente.client)}
                        </div>
                        <span className="text-gray-900">{vente.client}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-black">{vente.id}</td>
                    <td className="px-4 py-3 text-black">{formatMontant(vente.amount)}</td>
                    <td className="px-4 py-3 text-black">{formatDate(vente.date)}</td>
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