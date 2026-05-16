"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CountingNumber } from "@/components/ui/counting-number";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  getRecus,
  getProduits,
  getClients,
  type RecuAPI,
  type ProduitAPI,
} from "@/lib/api";

// ─── Types locaux ─────────────────────────────────────────────
type Vente = { id: string; client: string; amount: number; date: string };
type Produit = { id: string; nom: string; categorie: string; stock: number; prix: number; note: number };


type ChartPoint = { label: string; revenus: number };

// ─── Mappers API → local ──────────────────────────────────────
function mapRecu(r: RecuAPI): Vente {
  const prenom = r.client?.firstName ?? "";
  const nom    = r.client?.lastName  ?? "";
  const client = [prenom, nom].filter(Boolean).join(" ") || "Client inconnu";
  return {
    id:     r.idRecu,
    client,
    amount: Number(r.prix_total ?? 0),
    date:   r.dateR ?? new Date().toISOString().slice(0, 10),
  };
}

function mapProduit(p: ProduitAPI): Produit {
  return {
    id:        p.idProduit,
    nom:       p.nomProduit,
    categorie: p.categorie ?? "Autre",
    stock:     Number(p.quantite ?? 0),
    prix:      Number(p.prixP ?? 0),
    note:      Number((p as any).noteGenerale ?? 0),
  };
}

// ─── Helpers ─────────────────────────────────────────────────
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" });
}
function formatMontant(v: number) { return v.toLocaleString("fr-DZ") + " DA"; }
function getInitiales(n: string) { return n.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase(); }

const MOIS_FR: Record<number, string> = {
  1:"Janvier",2:"Février",3:"Mars",4:"Avril",5:"Mai",6:"Juin",
  7:"Juillet",8:"Août",9:"Septembre",10:"Octobre",11:"Novembre",12:"Décembre",
};


function buildRevenusParMois(ventes: Vente[]): ChartPoint[] {
  const map: Record<string, number> = {};
  ventes.forEach(({ date, amount }) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map[key] = (map[key] || 0) + amount;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, revenus]) => {
      const [annee, moisStr] = key.split("-");
      const moisNum = parseInt(moisStr, 10);
      return {
        label: `${(MOIS_FR[moisNum] ?? key).slice(0, 3)} ${annee.slice(2)}`,
        revenus,
      };
    });
}

function buildRevenusParSemaine(ventes: Vente[]): ChartPoint[] {
  const now = new Date();
  const semaines: ChartPoint[] = [
    { label: "Semaine 1", revenus: 0 },
    { label: "Semaine 2", revenus: 0 },
    { label: "Semaine 3", revenus: 0 },
    { label: "Semaine 4", revenus: 0 },
  ];
  ventes.forEach(({ date, amount }) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return;
    if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return;
    const j = d.getDate();
    if      (j <= 7)  semaines[0].revenus += amount;
    else if (j <= 14) semaines[1].revenus += amount;
    else if (j <= 21) semaines[2].revenus += amount;
    else              semaines[3].revenus += amount;
  });
  return semaines;
}

const chartConfig = {
  revenus: { label: "Revenus (DA)", color: "#064e3b" },
} satisfies ChartConfig;

// ─── Graphique ────────────────────────────────────────────────
function RevenusChart({ ventes }: { ventes: Vente[] }) {
  const [filtre, setFiltre] = useState<"tout" | "mois">("tout");

  const chartData: ChartPoint[] =
    filtre === "tout"
      ? buildRevenusParMois(ventes)
      : buildRevenusParSemaine(ventes);

  const totalChart = chartData.reduce((s, d) => s + d.revenus, 0);
  const now = new Date();
  const sousTitre =
    filtre === "tout"
      ? `Total sur ${chartData.length} mois · ${totalChart.toLocaleString("fr-DZ")} DA`
      : `${MOIS_FR[now.getMonth() + 1]} ${now.getFullYear()} · ${totalChart.toLocaleString("fr-DZ")} DA`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-900">Revenus mensuels</p>
          <p className="text-[10px] text-gray-400">{sousTitre}</p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {(["tout", "mois"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltre(f)}
              className={`text-[10px] px-2 py-1 rounded-md transition-colors ${
                filtre === f ? "bg-[#064e3b] text-white" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {f === "tout" ? "Tout" : "Ce mois-ci"}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-xs text-gray-300">
          Aucune donnée
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 4, right: 4, top: 8, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v: string) =>
                filtre === "tout" ? v.slice(0, 3) : v
              }
              style={{ fontSize: "10px", fill: "#9ca3af" }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel={false}
                  formatter={(value) =>
                    `${Number(value).toLocaleString("fr-DZ")} DA`
                  }
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
      )}
    </div>
  );
}

// ─── Donut Chart ─────────────────────────────────────────────
const ALL_CATEGORIES = [
  "LAITIER", "BOISSON", "BOULANGERIE",
  "EPICERIE", "FRUITS_LEGUMES", "VIANDE", "SURGELE", "SNACK",
];
const CATEGORY_COLORS: Record<string, string> = {
  "EPICERIE":"#064e3b","BOISSON":"#10b981","BOULANGERIE":"#34d399",
  "FRUITS_LEGUMES":"#6ee7b7","LAITIER":"#a7f3d0",
  "VIANDE":"#047857","SNACK":"#059669","SURGELE":"#065f46",
};

function DonutChart({ produits }: { produits: Produit[] }) {
  const counts: Record<string, number> = {};
  produits.forEach((p) => { counts[p.categorie] = (counts[p.categorie] || 0) + 1; });
  const total = produits.length || 1;
  const categories = Object.entries(counts).map(([cat, count]) => ({
    cat, count, pct: Math.round((count / total) * 100),
    color: CATEGORY_COLORS[cat] || "#d1fae5",
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
            const el = (
              <circle key={cat} cx={cx} cy={cy} r={r} fill="none" stroke={color}
                strokeWidth={strokeW} strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset} strokeLinecap="butt"
                style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }} />
            );
            offset += dash;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-gray-900">{top?.pct ?? 0}%</span>
          <span className="text-[8px] text-gray-400 text-center px-2 leading-tight">{top?.cat ?? "—"}</span>
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

// ─── Produits Vedettes ────────────────────────────────────────
function ProduitsVedettes({ produits }: { produits: Produit[] }) {
  const top = [...produits].sort((a, b) => b.note - a.note).slice(0, 5);
  return (
    <div className="flex flex-col gap-3 h-full">
      <div>
        <p className="text-xs font-medium text-gray-900">Produits vedettes</p>
        <p className="text-[10px] text-gray-400">Les articles les plus demandés</p>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {top.length === 0
          ? <p className="text-xs text-gray-300 text-center mt-4">Aucun produit disponible</p>
          : top.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-9 h-9 rounded-md bg-emerald-50 flex items-center justify-center text-[9px] font-semibold text-[#064e3b] flex-shrink-0">
                {p.nom.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{p.nom}</p>
                <p className="text-[10px] text-gray-400">⭐ {p.note} / 5</p>
              </div>
              <span className="text-xs font-semibold text-[#064e3b] flex-shrink-0">
                {p.prix.toLocaleString("fr-DZ")} DA
              </span>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────
function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className ?? ""}`} />;
}

// ─── Main Page ────────────────────────────────────────────────
const PAR_PAGE = 5;

export default function TableauDeBordPage() {
  const [ventes,     setVentes]     = useState<Vente[]>([]);
  const [produits,   setProduits]   = useState<Produit[]>([]);
  const [nbClients,  setNbClients]  = useState(0);
  const [chargement, setChargement] = useState(true);
  const [erreur,     setErreur]     = useState<string | null>(null);
  const [page,       setPage]       = useState(1);

  useEffect(() => {
    async function charger() {
      try {
        setChargement(true);
        setErreur(null);
        const [recusData, produitsData, clientsData] = await Promise.all([
          getRecus(),
          getProduits(),
          getClients(),
        ]);
        const ventesTriees = (recusData as RecuAPI[])
          .map(mapRecu)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setVentes(ventesTriees);
        setProduits((produitsData as ProduitAPI[]).map(mapProduit));
        setNbClients(Array.isArray(clientsData) ? clientsData.length : 0);
      } catch (e: any) {
        setErreur(e.message ?? "Erreur de chargement");
      } finally {
        setChargement(false);
      }
    }
    charger();
  }, []);

  const totalRevenus      = ventes.reduce((s, v) => s + v.amount, 0);
  const totalTransactions = ventes.length;
  const totalPages        = Math.max(1, Math.ceil(ventes.length / PAR_PAGE));
  const ventesPage        = ventes.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

  if (erreur) return (
    <div className="p-5 flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-sm text-red-500">{erreur}</p>
      <button onClick={() => window.location.reload()}
        className="text-xs text-[#064e3b] border border-[#064e3b] px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors">
        Réessayer
      </button>
    </div>
  );

  return (
    <div className="p-5 flex flex-col gap-4 min-h-screen overflow-auto">

      {/* Header */}
      <div className="flex-shrink-0">
        <h1 className="text-lg font-medium text-gray-900 uppercase tracking-wide">Vue d'ensemble</h1>
        <p className="text-sm text-gray-400 mt-0.5">Bienvenue sur votre tableau de bord.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-shrink-0">
        <div className="bg-[#064e3b] text-white p-4 rounded-xl">
          <p className="text-xs text-white/70 mb-1">Revenus totaux</p>
          <h3 className="text-xl font-medium flex items-baseline gap-1">
            {chargement
              ? <Sk className="h-7 w-24 bg-white/20" />
              : <><CountingNumber number={totalRevenus} /><span className="text-sm font-normal text-white/70">DA</span></>
            }
          </h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Nombre de transactions</p>
          <h3 className="text-xl font-medium text-gray-900 flex items-baseline gap-1">
            {chargement
              ? <Sk className="h-7 w-16" />
              : <><CountingNumber number={totalTransactions} /><span className="text-sm font-normal text-gray-400">ventes</span></>
            }
          </h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Nombre de clients</p>
          <h3 className="text-xl font-medium text-gray-900 flex items-baseline gap-1">
            {chargement
              ? <Sk className="h-7 w-16" />
              : <><CountingNumber number={nbClients} /><span className="text-sm font-normal text-gray-400">inscrits</span></>
            }
          </h3>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-shrink-0">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
          {chargement ? <Sk className="h-[260px] w-full" /> : <RevenusChart ventes={ventes} />}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="mb-2">
            <p className="text-xs font-medium text-gray-900">Répartition</p>
            <p className="text-[10px] text-gray-400">Ventes par catégorie de produits</p>
          </div>
          {chargement ? <Sk className="h-[300px] w-full" /> : <DonutChart produits={produits} />}
        </div>
      </div>

      {/* Bottom Row */}
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
                {chargement
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="px-4 py-2.5"><Sk className="h-5 w-32" /></td>
                        <td className="px-4 py-2.5"><Sk className="h-4 w-20" /></td>
                        <td className="px-4 py-2.5"><Sk className="h-4 w-24" /></td>
                        <td className="px-4 py-2.5"><Sk className="h-4 w-20" /></td>
                      </tr>
                    ))
                  : ventesPage.length === 0
                  ? (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-gray-300 text-xs">
                        Aucune transaction trouvée
                      </td>
                    </tr>
                  )
                  : ventesPage.map((vente, i) => (
                      <tr key={`${vente.id}-${i}`} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
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
                    ))
                }
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center px-4 py-2.5 border-t border-gray-100 flex-shrink-0">
            <span className="text-[10px] text-gray-400">
              {chargement
                ? "Chargement..."
                : `${(page - 1) * PAR_PAGE + 1}–${Math.min(page * PAR_PAGE, ventes.length)} sur ${ventes.length} ventes`
              }
            </span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || chargement}
                className="px-2 py-1 text-xs border border-black rounded-md text-black hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">←</button>
              <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || chargement}
                className="px-2 py-1 text-xs border border-black rounded-md text-black hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">→</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col">
          {chargement ? <Sk className="h-full min-h-[300px] w-full" /> : <ProduitsVedettes produits={produits} />}
        </div>
      </div>
    </div>
  );
}