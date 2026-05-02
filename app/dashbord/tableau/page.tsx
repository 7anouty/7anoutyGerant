"use client";

import { useState } from "react";
import Link from "next/link";
import { CountingNumber } from "@/components/ui/counting-number";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type Vente = { id: string; client: string; amount: number; date: string };
type Produit = { id: string; nom: string; categorie: string; stock: number; prix: number };

const VENTES: Vente[] = [
  { id: "TR-1043", client: "Ramy Kaci",  amount: 8500, date: "2026-01-17" },
  { id: "TR-1042", client: "Anis M.",    amount: 2500, date: "2026-03-17" },
  { id: "TR-1041", client: "Sara B.",    amount: 1800, date: "2026-02-11" },
  { id: "TR-1040", client: "Karim H.",   amount: 5500, date: "2026-04-08" },
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

const CLIENTS_COUNT = 13;

const PRODUITS: Produit[] = [
  { id: "REF-1022", nom: "Huile d'Olive Souss 2L",     categorie: "Épicerie",          stock: 45,  prix: 1050  },
  { id: "REF-1021", nom: "Huile d'Olive Souss 1L",     categorie: "Épicerie",          stock: 43,  prix: 850   },
  { id: "REF-1234", nom: "Semoule Fine Extra 5kg",      categorie: "Boulangerie",       stock: 12,  prix: 4250  },
  { id: "REF-2096", nom: "Thé Vert Sultan 200g",        categorie: "Boissons",          stock: 0,   prix: 2200  },
  { id: "REF-3042", nom: "Miel d'Oranger Pur 500g",     categorie: "Épicerie",          stock: 18,  prix: 13000 },
  { id: "REF-4413", nom: "Datte Medjool 1kg",           categorie: "Fruits et Légumes", stock: 5,   prix: 9600  },
  { id: "REF-5521", nom: "Couscous Moyen 2kg",          categorie: "Boulangerie",       stock: 60,  prix: 3200  },
  { id: "REF-6630", nom: "Harissa Traditionnelle 200g", categorie: "Épicerie",          stock: 0,   prix: 1500  },
  { id: "REF-7741", nom: "Eau Minérale Ifri 1.5L",      categorie: "Boissons",          stock: 120, prix: 600   },
  { id: "REF-8852", nom: "Lait en Poudre 1kg",          categorie: "Produits Laitiers", stock: 9,   prix: 7800  },
  { id: "REF-9963", nom: "Café Arabica Moulu 250g",     categorie: "Boissons",          stock: 34,  prix: 4100  },
  { id: "REF-1074", nom: "Huile de Table 5L",           categorie: "Épicerie",          stock: 0,   prix: 8500  },
  { id: "REF-1185", nom: "Sucre Blanc 2kg",             categorie: "Épicerie",          stock: 77,  prix: 2100  },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" });
}
function formatMontant(val: number): string { return val.toLocaleString("fr-DZ") + " DA"; }
function getInitiales(nom: string): string { return nom.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase(); }

const MOIS_FR: Record<number, string> = {
  1: "Janvier", 2: "Février", 3: "Mars", 4: "Avril",
  5: "Mai", 6: "Juin", 7: "Juillet", 8: "Août",
  9: "Septembre", 10: "Octobre", 11: "Novembre", 12: "Décembre",
};

// ─── Data builders ────────────────────────────────────────────────────────────

function buildRevenusParMois(ventes: Vente[]) {
  const map: Record<string, number> = {};
  ventes.forEach(({ date, amount }) => {
    const d = new Date(date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map[key] = (map[key] || 0) + amount;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, revenus]) => {
      const [annee, moisStr] = key.split("-");
      const moisNum = parseInt(moisStr, 10);
      const moisCourt = (MOIS_FR[moisNum] ?? key).slice(0, 3);
      return { mois: `${moisCourt} ${annee.slice(2)}`, revenus };
    });
}

// Retourne les revenus par semaine pour le mois en cours
function buildRevenusParSemaine(ventes: Vente[]) {
  const now = new Date();
  const moisCourant = now.getMonth();
  const anneeCourante = now.getFullYear();

  // 4 semaines fixes : S1=1-7, S2=8-14, S3=15-21, S4=22-fin
  const semaines = [
    { label: "Semaine 1", revenus: 0 },
    { label: "Semaine 2", revenus: 0 },
    { label: "Semaine 3", revenus: 0 },
    { label: "Semaine 4", revenus: 0 },
  ];

  ventes.forEach(({ date, amount }) => {
    const d = new Date(date);
    if (d.getMonth() !== moisCourant || d.getFullYear() !== anneeCourante) return;
    const jour = d.getDate();
    if (jour <= 7) semaines[0].revenus += amount;
    else if (jour <= 14) semaines[1].revenus += amount;
    else if (jour <= 21) semaines[2].revenus += amount;
    else semaines[3].revenus += amount;
  });

  return semaines;
}

const chartConfig = { revenus: { label: "Revenus (DA)", color: "#064e3b" } } satisfies ChartConfig;

// ─── Graphique ────────────────────────────────────────────────────────────────

function RevenusChart({ ventes }: { ventes: Vente[] }) {
  const [filtre, setFiltre] = useState<"tout" | "mois">("tout");

  const chartData = filtre === "tout"
    ? buildRevenusParMois(ventes)
    : buildRevenusParSemaine(ventes);

  const totalChart = chartData.reduce((s, d) => s + d.revenus, 0);

 
  // Label axe X selon le filtre
  const xKey = filtre === "tout" ? "mois" : "label";

  const now = new Date();
  const sousTitre = filtre === "tout"
    ? `Total sur ${chartData.length} mois · ${totalChart.toLocaleString("fr-DZ")} DA`
    : `${MOIS_FR[now.getMonth() + 1]} ${now.getFullYear()} · ${totalChart.toLocaleString("fr-DZ")} DA`;

  return (
    <div className="flex flex-col gap-3">
      {/* Header avec filtre */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-900">Revenus mensuels</p>
          <p className="text-[10px] text-gray-400">{sousTitre}</p>
        </div>
        {/* Boutons filtre */}
        <div className="flex gap-1 flex-shrink-0">
          {(["tout", "mois"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltre(f)}
              className={`text-[10px] px-2 py-1 rounded-md transition-colors ${
                filtre === f
                  ? "bg-[#064e3b] text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {f === "tout" ? "Tout" : "Ce mois-ci"}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{ left: 4, right: 4, top: 8, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke="#f3f4f6" />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value: string) =>
              filtre === "tout" ? value.slice(0, 3) : value
            }
            style={{ fontSize: "10px", fill: "#9ca3af" }}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel={false}
                formatter={(value) => `${Number(value).toLocaleString("fr-DZ")} DA`}
              />
            }
          />
          <Line
            dataKey="revenus"
            type="natural"
            stroke="#064e3b"
            strokeWidth={2.5}
            dot={{ fill: "#064e3b", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ChartContainer>


    </div>
  );
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────

const ALL_CATEGORIES = [
  "Épicerie", "Boissons", "Boulangerie", "Fruits et Légumes",
  "Produits Laitiers", "Boucherie", "Snack", "Surgelés",
];
const CATEGORY_COLORS: Record<string, string> = {
  "Épicerie": "#064e3b", "Boissons": "#10b981", "Boulangerie": "#34d399",
  "Fruits et Légumes": "#6ee7b7", "Produits Laitiers": "#a7f3d0",
  "Boucherie": "#047857", "Snack": "#059669", "Surgelés": "#065f46",
};

function DonutChart({ produits }: { produits: Produit[] }) {
  const counts: Record<string, number> = {};
  produits.forEach((p) => { counts[p.categorie] = (counts[p.categorie] || 0) + 1; });
  const total = produits.length;
  const categories = Object.entries(counts).map(([cat, count]) => ({
    cat, count, pct: Math.round((count / total) * 100), color: CATEGORY_COLORS[cat] || "#d1fae5",
  })).sort((a, b) => b.count - a.count);

  const cx = 70, cy = 70, r = 54, strokeW = 16;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const top = categories[0];

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="relative flex-shrink-0">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={strokeW} />
          {categories.map(({ cat, count, color }) => {
            const dash = (count / total) * circumference;
            const gap = circumference - dash;
            const el = (
              <circle key={cat} cx={cx} cy={cy} r={r} fill="none" stroke={color}
                strokeWidth={strokeW} strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset} strokeLinecap="butt"
                style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }} />
            );
            offset += dash;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{top?.pct}%</span>
          <span className="text-[8px] text-gray-400 text-center px-2 leading-tight">{top?.cat}</span>
        </div>
      </div>
      <div className="w-full flex flex-col gap-1.5">
        {ALL_CATEGORIES.map((cat) => {
          const found = categories.find((c) => c.cat === cat);
          const pct = found ? found.pct : 0;
          return (
            <div key={cat} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[cat], opacity: pct === 0 ? 0.3 : 1 }} />
                <span className={`text-xs ${pct === 0 ? "text-gray-300" : "text-gray-600"}`}>{cat}</span>
              </div>
              <span className={`text-xs font-semibold ${pct === 0 ? "text-gray-300" : "text-gray-900"}`}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Produits Vedettes ────────────────────────────────────────────────────────

function ProduitsVedettes({ produits }: { produits: Produit[] }) {
  const top = [...produits].filter((p) => p.stock > 0).sort((a, b) => b.prix - a.prix).slice(0, 3);
  return (
    <div className="flex flex-col gap-3 h-full">
      <div>
        <p className="text-xs font-medium text-gray-900">Produits vedettes</p>
        <p className="text-[10px] text-gray-400">Les articles les plus demandés</p>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {top.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-9 h-9 rounded-md bg-emerald-50 flex items-center justify-center text-[9px] font-semibold text-[#064e3b] flex-shrink-0">
              {p.nom.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{p.nom}</p>
              <p className="text-[10px] text-gray-400">{p.stock} unités</p>
            </div>
            <span className="text-xs font-semibold text-[#064e3b] flex-shrink-0">
              {p.prix.toLocaleString("fr-DZ")} DA
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PAR_PAGE = 5;

export default function TableauDeBordPage() {
  const [page, setPage] = useState(1);

  const totalRevenus = VENTES.reduce((s, v) => s + v.amount, 0);
  const totalTransactions = VENTES.length;
  const totalClients = CLIENTS_COUNT;
  const totalPages = Math.max(1, Math.ceil(VENTES.length / PAR_PAGE));
  const ventesPage = VENTES.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

  return (
    <div className="p-5 flex flex-col gap-4 min-h-screen overflow-auto">

      {/* ── Header ── */}
      <div className="flex-shrink-0">
        <h1 className="text-lg font-medium text-gray-900 uppercase tracking-wide">Vue d'ensemble</h1>
        <p className="text-sm text-gray-400 mt-0.5">Bienvenue sur votre tableau de bord.</p>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-shrink-0">
        <div className="bg-[#064e3b] text-white p-4 rounded-xl">
          <p className="text-xs text-white/70 mb-1">Revenus totaux</p>
          <h3 className="text-xl font-medium flex items-baseline gap-1">
            <CountingNumber number={totalRevenus} />
            <span className="text-sm font-normal text-white/70">DA</span>
          </h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Nombre de transactions</p>
          <h3 className="text-xl font-medium text-gray-900 flex items-baseline gap-1">
            <CountingNumber number={totalTransactions} />
            <span className="text-sm font-normal text-gray-400">ventes</span>
          </h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Nombre de clients</p>
          <h3 className="text-xl font-medium text-gray-900 flex items-baseline gap-1">
            <CountingNumber number={totalClients} />
            <span className="text-sm font-normal text-gray-400">inscrits</span>
          </h3>
        </div>
      </div>

      {/* ── Middle Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-shrink-0">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
          <RevenusChart ventes={VENTES} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="mb-2">
            <p className="text-xs font-medium text-gray-900">Répartition</p>
            <p className="text-[10px] text-gray-400">Ventes par catégorie de produits</p>
          </div>
          <DonutChart produits={PRODUITS} />
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <div>
              <p className="text-xs font-medium text-gray-900">Achats récents</p>
              <p className="text-[10px] text-gray-400">Dernières transactions enregistrées en caisse</p>
            </div>
            <Link href="/dashbord/ventes" className="text-[10px] text-[#064e3b] font-medium hover:underline">
              Voir l'historique →
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-4 py-2 text-[10px] font-medium text-gray-400 uppercase tracking-wide">Nom du client</th>
                  <th className="text-left px-4 py-2 text-[10px] font-medium text-gray-400 uppercase tracking-wide">Transaction</th>
                  <th className="text-left px-4 py-2 text-[10px] font-medium text-gray-400 uppercase tracking-wide">Prix total</th>
                  <th className="text-left px-4 py-2 text-[10px] font-medium text-gray-400 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {ventesPage.map((vente, index) => (
                  <tr key={`${vente.id}-${index}`} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-[9px] font-semibold text-[#064e3b] flex-shrink-0">
                          {getInitiales(vente.client)}
                        </div>
                        <span className="text-xs text-gray-900">{vente.client}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 font-mono">{vente.id}</td>
                    <td className="px-4 py-2.5 text-xs font-medium text-gray-900">{formatMontant(vente.amount)}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{formatDate(vente.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center px-4 py-2.5 border-t border-gray-100 flex-shrink-0">
            <span className="text-[10px] text-gray-400">
              {`${(page - 1) * PAR_PAGE + 1}–${Math.min(page * PAR_PAGE, VENTES.length)} sur ${VENTES.length} ventes`}
            </span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-2 py-1 text-xs border border-black rounded-md text-black hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">←</button>
              <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-2 py-1 text-xs border border-black rounded-md text-black hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">→</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col">
          <ProduitsVedettes produits={PRODUITS} />
        </div>
      </div>
    </div>
  );
}