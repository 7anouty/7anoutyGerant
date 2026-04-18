"use client";

import { useState } from "react";
import { CountingNumber } from "@/components/ui/counting-number";

type Client = {
  id: string;
  nom: string;
  username: string;
  email: string;
  telephone: string;
  dateCreation: string;
};

const CLIENTS_INITIAUX: Client[] = [
  { id: "CL-1001", nom: "Ahmed Benali",       username: "a.benali",        email: "a.benali@gmail.com",       telephone: "+213 550 12 34 56", dateCreation: "2026-03-19" },
  { id: "CL-1002", nom: "Fatima Zohra Hamdi", username: "fz.hamdi",        email: "fz.hamdi@outlook.com",     telephone: "+213 661 98 76 54", dateCreation: "2024-02-03" },
  { id: "CL-1003", nom: "Karim Meziani",      username: "k.meziani",       email: "k.meziani@yahoo.fr",       telephone: "+213 770 45 67 89", dateCreation: "2024-02-18" },
  { id: "CL-1004", nom: "Lynda Aoudia",       username: "l.aoudia",        email: "l.aoudia@gmail.com",       telephone: "+213 555 33 21 10", dateCreation: "2024-03-05" },
  { id: "CL-1005", nom: "Mohamed Tebbal",     username: "m.tebbal",        email: "m.tebbal@hotmail.com",     telephone: "+213 699 87 65 43", dateCreation: "2024-03-22" },
  { id: "CL-1006", nom: "Samira Ferhat",      username: "s.ferhat",        email: "s.ferhat@gmail.com",       telephone: "+213 560 11 22 33", dateCreation: "2024-04-10" },
  { id: "CL-1007", nom: "Youcef Boudaoud",    username: "y.boudaoud",      email: "y.boudaoud@gmail.com",     telephone: "+213 771 44 55 66", dateCreation: "2024-04-27" },
  { id: "CL-1008", nom: "Nadia Chibani",      username: "n.chibani",       email: "n.chibani@yahoo.fr",       telephone: "+213 550 77 88 99", dateCreation: "2024-05-14" },
  { id: "CL-1009", nom: "Rachid Haddad",      username: "r.haddad",        email: "r.haddad@outlook.com",     telephone: "+213 661 23 45 67", dateCreation: "2024-05-30" },
  { id: "CL-1010", nom: "Amina Kaci",         username: "a.kaci",          email: "a.kaci@gmail.com",         telephone: "+213 699 54 32 10", dateCreation: "2024-06-08" },
  { id: "CL-1011", nom: "Djamel Ouali",       username: "d.ouali",         email: "d.ouali@hotmail.com",      telephone: "+213 770 98 12 34", dateCreation: "2024-06-25" },
  { id: "CL-1012", nom: "Houria Sellami",     username: "h.sellami",       email: "h.sellami@gmail.com",      telephone: "+213 555 67 89 01", dateCreation: "2024-07-03" },
  { id: "CL-1013", nom: "Sofiane Merabet",    username: "s.merabet",       email: "s.merabet@gmail.com",      telephone: "+213 560 34 56 78", dateCreation: "2024-07-19" },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" });
}

function getInitiales(nom: string): string {
  return nom.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const PAR_PAGE = 10;

const today = new Date();
const _30_JOURS = new Date(today);
_30_JOURS.setDate(_30_JOURS.getDate() - 30);

export default function ClientsPage() {
  const [clients] = useState<Client[]>(CLIENTS_INITIAUX);
  const [page, setPage] = useState(1);
  const [recherche, setRecherche] = useState("");

  const totalClients = clients.length;
  const nouveauxClients = clients.filter(
    (c) => new Date(c.dateCreation) >= _30_JOURS
  ).length;

  const clientsFiltres = clients.filter((c) => {
    const q = recherche.toLowerCase().trim();
    if (!q) return true;
    return (
      c.nom.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(clientsFiltres.length / PAR_PAGE));
  const clientsPage = clientsFiltres.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

  function handleRecherche(val: string) {
    setRecherche(val);
    setPage(1);
  }

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

      {/* Table */}
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
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Nom Client</th>
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
                          {getInitiales(client.nom)}
                        </div>
                        <span className="text-gray-900">{client.nom}</span>
                      </div>
                    </td>              
                    <td className="px-4 py-3 text-black">{client.id}</td>
                    <td className="px-4 py-3 text-black font-mono text-xs">{client.username}</td>
                    <td className="px-4 py-3 text-black">{client.email}</td>
                    <td className="px-4 py-3 text-black">{client.telephone}</td>
                    <td className="px-4 py-3 text-black">{formatDate(client.dateCreation)}</td>
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
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2 py-1 text-xs border border-black rounded-md text-black hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >←</button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2 py-1 text-xs border border-black rounded-md text-black hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >→</button>
          </div>
        </div>
      </div>
    </div>
  );
}