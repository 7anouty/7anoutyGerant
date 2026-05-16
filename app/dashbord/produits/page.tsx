"use client";

import { useState, useEffect, useCallback } from "react";
import { CountingNumber } from "@/components/ui/counting-number";
import {
  getProduits,
  creerProduit,
  modifierProduit,
  supprimerProduit,
  type ProduitAPI,
} from "@/lib/api";

// ============================================================
// TYPES
// ============================================================
type Statut = "EN_STOCK" | "STOCK_FAIBLE" | "RUPTURE";
type Event  = "NORMAL" | "RAMADAN" | "AID" | "VENDREDI";
type Rayon  = "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "C7" | "C8";

type Produit = {
  id: string;
  nom: string;
  barcode: string;
  categorie: string;
  rayon: Rayon;
  ingredients: string[];
  labels: string[];
  event: Event;
  stock: number;
  statut: Statut;
  prix: number;
  image: string | null;
  proteins: number;
  glucides: number;
  lipides: number;
};

// ============================================================
// CONSTANTES
// ============================================================
const CATEGORIES = [
  "LAITIER", "BOISSON", "BOULANGERIE",
  "EPICERIE", "FRUITS_LEGUMES", "VIANDE", "SURGELE", "SNACK",
];

const CATEGORIE_RAYON: Record<string, Rayon> = {
  "FRUITS_LEGUMES": "C8", "BOULANGERIE": "C5", "VIANDE": "C7",
  "LAITIER": "C1", "BOISSON": "C2", "EPICERIE": "C3",
  "SNACK": "C6", "SURGELE": "C4",
};

const INGREDIENTS_LIST = [
  "EAU", "SUCRE", "SEL", "HUILE_VEGETALE", "LAIT", "BEURRE",
  "OEUFS", "AROME", "COLORANT", "GELATINE", "FARINE",
  "GLUTEN", "NOIX", "POISSON",
];


const LABELS_LIST = ["BIO", "VEGAN", "VEGETARIEN", "SANS_AROME", "SANS_COLORANT"];
const EVENTS: Event[] = ["NORMAL", "RAMADAN", "AID", "VENDREDI"];

const STATUT_CONFIG: Record<Statut, { label: string; bg: string; text: string }> = {
  "EN_STOCK":     { label: "EN_STOCK",     bg: "bg-emerald-50", text: "text-emerald-700" },
  "STOCK_FAIBLE": { label: "STOCK_FAIBLE", bg: "bg-amber-50",   text: "text-amber-700"   },
  "RUPTURE":      { label: "RUPTURE",      bg: "bg-red-50",     text: "text-red-600"     },
};

const PAR_PAGE = 10;


const FORM_VIDE = {
  nom: "", barcode: "", categorie: "", rayon: "" as Rayon | "",
  ingredients: [] as string[], labels: [] as string[],
  event: "NORMAL" as Event, stock: 0, prix: 0,
  image: null as string | null, proteins: 0, glucides: 0, lipides: 0,
};

// HELPERS
// ============================================================
function getInitiales(nom: string) {
  if (!nom) return "?";
  return nom.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}
function formatPrix(val: number) {
  return val.toLocaleString("fr-DZ") + " DA";
}
function toggleItem(arr: string[], item: string) {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}
function getStatut(stock: number): Statut {
  if (stock === 0)   return "RUPTURE";
  if (stock <= 10)   return "STOCK_FAIBLE";
  return "EN_STOCK";
}

function apiToProduit(d: any): Produit {
  return {
    id:          d.idProduit ?? d.id ?? "",
    nom:         d.nomProduit ?? d.nom ?? "Sans nom",
    barcode:     d.barcodeP ?? d.barcode ?? "",
    categorie:   d.categorie ?? "",
    rayon:       (d.rayon as Rayon) ?? CATEGORIE_RAYON[d.categorie] ?? "C1",
    ingredients: d.ingredients ?? [],
    labels:      d.labelsAlimentaires ?? d.labels ?? [],
    event:       (d.evenement as Event) ?? d.event ?? "NORMAL",
    stock:       d.quantite ?? d.stock ?? 0,
    statut:      getStatut(d.quantite ?? d.stock ?? 0),
    prix:        d.prixP ?? d.prix ?? 0,
    image:       d.imageP ?? d.image ?? null,
    proteins:    d.proteins ?? 0,
    glucides:    d.glucides ?? 0,
    lipides:     d.lipides ?? 0,
  };
}

// ============================================================
// PAGE
// ============================================================
export default function ProduitsPage() {
  const [produits, setProduits]               = useState<Produit[]>([]);
  const [chargement, setChargement]           = useState(true);
  const [erreur, setErreur]                   = useState<string | null>(null);
  const [page, setPage]                       = useState(1);
  const [filtreStock, setFiltreStock]         = useState("Tous");
  const [filtreEvenement, setFiltreEvenement] = useState("Tous");
  const [filtreCategorie, setFiltreCategorie] = useState("Toutes");
  const [recherche, setRecherche]             = useState("");
  const [modalOuvert, setModalOuvert]         = useState(false);
  const [modeEdition, setModeEdition]         = useState(false);
  const [idEdition, setIdEdition]             = useState<string | null>(null);
  const [form, setForm]                       = useState(FORM_VIDE);
  const [imagePreview, setImagePreview]       = useState<string | null>(null);
  const [imageFile, setImageFile]             = useState<File | null>(null);
  const [enregistrement, setEnregistrement]   = useState(false);

  // ── Chargement ───────────────────────────────────────────────
  const chargerProduits = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const data = await getProduits();
      setProduits(data.map(apiToProduit));
    } catch (err) {
      setErreur("Impossible de charger les produits. Vérifiez la connexion à l'API.");
      console.error(err);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { chargerProduits(); }, [chargerProduits]);

  // ── Stats ────────────────────────────────────────────────────
  const totalProduits = produits.length;
  const categories    = [...new Set(produits.map((p) => p.categorie))].length;
  const alertesStock  = produits.filter((p) => p.statut === "STOCK_FAIBLE").length;
  const ruptures      = produits.filter((p) => p.statut === "RUPTURE").length;

  // ── Filtres ──────────────────────────────────────────────────
  const produitsFiltres = produits
    .filter((p) => filtreStock      === "Tous"    || p.statut    === filtreStock)
    .filter((p) => filtreEvenement  === "Tous"    || p.event     === filtreEvenement)
    .filter((p) => filtreCategorie  === "Toutes"  || p.categorie === filtreCategorie)
    .filter((p) => {
      const q = recherche.toLowerCase().trim();
      return !q || p.nom.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    });

  const totalPages   = Math.max(1, Math.ceil(produitsFiltres.length / PAR_PAGE));
  const produitsPage = produitsFiltres.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

  function resetFiltres() {
    setFiltreStock("Tous"); setFiltreEvenement("Tous");
    setFiltreCategorie("Toutes"); setPage(1);
  }

  // ── Modal ────────────────────────────────────────────────────
  function ouvrirModalAjout() {
    setModeEdition(false); setIdEdition(null);
    setForm(FORM_VIDE); setImagePreview(null); setImageFile(null);
    setModalOuvert(true);
  }

 
  function ouvrirModalEdition(p: Produit) {
    setModeEdition(true); setIdEdition(p.id);
    setForm({
      nom: p.nom, barcode: p.barcode, categorie: p.categorie, rayon: p.rayon,
      ingredients: [...p.ingredients], labels: [...p.labels],
      event: p.event, stock: p.stock, prix: p.prix, image: p.image,
      proteins: p.proteins, glucides: p.glucides, lipides: p.lipides,
    });
    setImagePreview(p.image);
    setImageFile(null);
    setModalOuvert(true);
  }

  function fermerModal() {
    setModalOuvert(false); setModeEdition(false); setIdEdition(null);
    setForm(FORM_VIDE); setImagePreview(null); setImageFile(null);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

 
  const formValide =
    form.nom.trim() !== "" && form.barcode.trim() !== "" &&
    form.categorie !== "" && form.ingredients.length > 0 && imagePreview !== null;

  // ── Enregistrer ──────────────────────────────────────────────
  async function handleEnregistrer() {
    if (!formValide || enregistrement) return;
    setEnregistrement(true);
    try {
      const rayonAuto  = CATEGORIE_RAYON[form.categorie] ?? "C1";
      const statutAuto = getStatut(form.stock);

      const payloadBase = {
        nomProduit:         form.nom,
        categorie:          form.categorie,
        rayon:              rayonAuto,
        evenement:          form.event,
        quantite:           form.stock,
        prixP:              form.prix,
        imageP:             form.image,
        ingredients:        form.ingredients,
        labelsAlimentaires: form.labels,
        proteins:           form.proteins,
        glucides:           form.glucides,
        lipides:            form.lipides,
        instock:            statutAuto,
        barcodeP:           form.barcode,
        poids:              0,
      } as any;

      if (modeEdition && idEdition) {
     
        
              await modifierProduit(idEdition, payloadBase, imageFile);
              await chargerProduits(); 
      } else {
         const payloadCreation = { ...payloadBase, idGerant: "cm7p9z1l600003b6m7u8n2x4q" };
         await creerProduit(payloadCreation, imageFile);
         await chargerProduits(); 
         setPage(1);
      }
      
      fermerModal();
    } catch (err) {
      console.error("Erreur enregistrement:", err);
      alert("Erreur lors de l'enregistrement. Consultez la console.");
    } finally {
      setEnregistrement(false);
    }
  }

  // ── Supprimer ────────────────────────────────────────────────
  async function handleSupprimer(id: string) {
    if (!confirm("Supprimer ce produit définitivement ?")) return;
    try {
      await supprimerProduit(id);
      setProduits((prev) => {
        const updated   = prev.filter((p) => p.id !== id);
        const newTotal  = Math.max(1, Math.ceil(updated.length / PAR_PAGE));
        if (page > newTotal) setPage(newTotal);
        return updated;
      });
    } catch (err) {
      console.error("Erreur suppression:", err);
      alert("Erreur lors de la suppression.");
    }
  }

  const hasActiveFilters = filtreEvenement !== "Tous" || filtreCategorie !== "Toutes" || filtreStock !== "Tous";

  
  return (
    <div className="p-5 flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-medium text-gray-900 uppercase tracking-wide">Gestion des produits</h1>
          <p className="text-sm text-gray-400 mt-0.5">Catalogue et inventaire temps réel de votre magasin.</p>
        </div>
        <button type="button" onClick={ouvrirModalAjout}
          className="flex items-center gap-2 bg-[#064e3b] text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-[#065f46] transition-colors flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Ajouter un Produit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-[#064e3b] text-white p-4 rounded-xl">
          <p className="text-xs text-white/70 mb-1">Total produits</p>
          <h3 className="text-xl font-medium flex items-baseline gap-1">
            <CountingNumber number={totalProduits} />
            <span className="text-sm font-normal text-white/70">Produits</span>
          </h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Catégories</p>
          <h3 className="text-xl font-medium text-gray-900 flex items-baseline gap-1">
            <CountingNumber number={categories} />
            <span className="text-sm font-normal text-gray-400">types organisés</span>
          </h3>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
          <p className="text-xs text-amber-900 mb-1">Alertes stock</p>
          <h3 className="text-xl font-medium text-amber-900 flex items-baseline gap-1">
            <CountingNumber number={alertesStock} />
            <span className="text-sm font-normal text-amber-900">articles en stock faible</span>
          </h3>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
          <p className="text-xs text-red-400 mb-1">Ruptures de stock</p>
          <h3 className="text-xl font-medium text-red-600 flex items-baseline gap-1">
            <CountingNumber number={ruptures} />
            <span className="text-sm font-normal text-red-400">produits épuisés</span>
          </h3>
        </div>
      </div>

      {/* Chargement */}
      {chargement && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm animate-pulse">
          Chargement des produits...
        </div>
      )}

      {/* Erreur */}
      {erreur && !chargement && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm text-red-600">{erreur}</span>
          <button onClick={chargerProduits}
            className="text-xs text-red-600 border border-red-300 rounded-lg px-3 py-1.5 hover:bg-red-100 transition-colors">
            Réessayer
          </button>
        </div>
      )}

      {/* Table */}
      {!chargement && !erreur && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

          {/* Filtres */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 gap-3 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-black" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input type="text" value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }}
                placeholder="Rechercher par nom ou ID..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md text-black placeholder-black focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
            </div>

        
            <select value={filtreStock} onChange={(e) => { setFiltreStock(e.target.value); setPage(1); }}
              className="text-xs text-black border border-gray-200 rounded-md px-2 py-1.5 bg-transparent">
              <option value="Tous">Tous</option>
              <option value="EN_STOCK">En stock</option>
              <option value="STOCK_FAIBLE">Stock faible</option>
              <option value="RUPTURE">Rupture</option>
            </select>

            <select value={filtreEvenement} onChange={(e) => { setFiltreEvenement(e.target.value); setPage(1); }}
              className="text-xs text-black border border-gray-200 rounded-md px-2 py-1.5 bg-transparent">
              <option value="Tous">Tous événements</option>
              {EVENTS.map((ev) => <option key={ev} value={ev}>{ev}</option>)}
            </select>
            <select value={filtreCategorie} onChange={(e) => { setFiltreCategorie(e.target.value); setPage(1); }}
              className="text-xs text-black border border-gray-200 rounded-md px-2 py-1.5 bg-transparent">
              <option value="Toutes">Toutes catégories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            {hasActiveFilters && (
              <button type="button" onClick={resetFiltres}
                className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-red-500 transition-colors">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
                Réinitialiser
              </button>
            )}
          </div>

          {/* Tableau */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Produit","ID","Barcode","Catégorie","Ingrédients","Macros","Labels","Événement","Rayon","Stock","Statut","Prix","Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {produitsPage.length === 0 ? (
                  <tr><td colSpan={13} className="text-center py-8 text-gray-400 text-sm">Aucun produit trouvé</td></tr>
                ) : (
                  produitsPage.map((produit) => {
                    const statut = STATUT_CONFIG[produit.statut];
                    return (
                      <tr key={produit.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {produit.image
                              ? <img src={produit.image} alt={produit.nom} className="w-14 h-14 rounded-md object-cover flex-shrink-0" />
                              : <div className="w-10 h-10 bg-emerald-50 flex items-center justify-center text-[9px] font-medium text-[#064e3b] flex-shrink-0">{getInitiales(produit.nom)}</div>
                            }
                            <span className="text-gray-900 text-xs">{produit.nom}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-black text-xs">{produit.id}</td>
                        <td className="px-4 py-3 text-black text-xs font-mono">{produit.barcode || <span className="text-gray-300">—</span>}</td>
                        <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{produit.categorie}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {produit.ingredients.map((ing) => <span key={ing} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{ing}</span>)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5 min-w-[90px]">
                            <span className="text-[10px] text-gray-600"><span className="font-semibold text-blue-600">P</span> {Number(produit.proteins).toFixed(1)}g</span>
                            <span className="text-[10px] text-gray-600"><span className="font-semibold text-amber-600">G</span> {Number(produit.glucides).toFixed(1)}g</span>
                            <span className="text-[10px] text-gray-600"><span className="font-semibold text-rose-500">L</span> {Number(produit.lipides).toFixed(1)}g</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {produit.labels.map((label) => <span key={label} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{label}</span>)}
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{produit.event}</span></td>
                        <td className="px-4 py-3"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#064e3b]/10 text-[#064e3b]">{produit.rayon}</span></td>
                        <td className="px-4 py-3 text-black text-xs">{produit.stock} unités</td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statut.bg} ${statut.text}`}>{statut.label}</span></td>
                        <td className="px-4 py-3 text-black text-xs font-medium">{formatPrix(produit.prix)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => ouvrirModalEdition(produit)} className="text-gray-400 hover:text-[#064e3b] transition-colors" title="Modifier">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button type="button" onClick={() => handleSupprimer(produit.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Supprimer">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              {`${(page - 1) * PAR_PAGE + 1}–${Math.min(page * PAR_PAGE, produitsFiltres.length)} sur ${produitsFiltres.length} produits`}
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
            <div className="flex items-start p-6 pb-4 sticky top-0 bg-white z-10 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {modeEdition ? "Modifier le Produit" : "Ajouter un Nouveau Produit"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {modeEdition ? "Modifiez les informations puis enregistrez." : "Remplissez les informations détaillées."}
                </p>
              </div>
            </div>

            <div className="px-6 py-5 flex flex-col gap-5">

              {/* Nom + Barcode */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Nom du Produit</label>
                  <input type="text" value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} placeholder="Ex: Lait Entier 1L"
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Code-barres</label>
                  <input type="text" value={form.barcode} onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))} placeholder="Ex: 6191234567890"
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 font-mono focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
                </div>
              </div>

              {/* Catégorie + Événement */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Catégorie</label>
                  <select value={form.categorie} onChange={(e) => setForm((f) => ({ ...f, categorie: e.target.value, rayon: CATEGORIE_RAYON[e.target.value] ?? "" as Rayon }))}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]">
                    <option value="">Sélectionner...</option>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  {form.categorie && (
                    <p className="text-[10px] text-gray-400 mt-0.5">Rayon : <span className="font-bold text-[#064e3b]">{CATEGORIE_RAYON[form.categorie]}</span></p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Événement</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {EVENTS.map((ev) => (
                      <button key={ev} type="button" onClick={() => setForm((f) => ({ ...f, event: ev }))}
                        className={`text-[10px] font-semibold py-1.5 rounded-lg border transition-all ${form.event === ev ? "bg-gray-200 text-gray-800 border-gray-300" : "bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300"}`}>
                        {ev}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prix + Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Prix (DA)</label>
                  <input type="number" min={0} value={form.prix} onChange={(e) => setForm((f) => ({ ...f, prix: Number(e.target.value) }))}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Stock</label>
                  <input type="number" min={0} value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
                </div>
              </div>

              {/* Macros */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Macros (pour 100g)</label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-blue-600 font-semibold">Protéines (g)</label>
                    <input type="number" min={0} step={0.1} value={form.proteins} onChange={(e) => setForm((f) => ({ ...f, proteins: parseFloat(e.target.value) || 0 }))}
                      className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-amber-600 font-semibold">Glucides (g)</label>
                    <input type="number" min={0} step={0.1} value={form.glucides} onChange={(e) => setForm((f) => ({ ...f, glucides: parseFloat(e.target.value) || 0 }))}
                      className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-rose-500 font-semibold">Lipides (g)</label>
                    <input type="number" min={0} step={0.1} value={form.lipides} onChange={(e) => setForm((f) => ({ ...f, lipides: parseFloat(e.target.value) || 0 }))}
                      className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400" />
                  </div>
                </div>
              </div>

              {/* Ingrédients */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Ingrédients</label>
                <div className="flex flex-wrap gap-1.5">
                  {INGREDIENTS_LIST.map((ing) => (
                    <button key={ing} type="button" onClick={() => setForm((f) => ({ ...f, ingredients: toggleItem(f.ingredients, ing) }))}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${form.ingredients.includes(ing) ? "bg-gray-200 text-gray-800 border-gray-300" : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"}`}>
                      {ing}
                    </button>
                  ))}
                </div>
              </div>

              {/* Labels */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Labels</label>
                <div className="flex flex-wrap gap-1.5">
                  {LABELS_LIST.map((label) => (
                    <button key={label} type="button" onClick={() => setForm((f) => ({ ...f, labels: toggleItem(f.labels, label) }))}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${form.labels.includes(label) ? "bg-gray-200 text-gray-800 border-gray-300" : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Photo du produit</label>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-5 cursor-pointer hover:border-[#064e3b] transition-colors group">
                  {imagePreview
                    ? <img src={imagePreview} alt="preview" className="h-16 w-16 object-cover" />
                    : <>
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-[#064e3b]">
                            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-gray-500 group-hover:text-[#064e3b]">Cliquez pour télécharger</span>
                        <span className="text-[10px] text-gray-400">PNG, JPG jusqu'à 5MB</span>
                      </>
                  }
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>

              {/* Boutons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button type="button" onClick={fermerModal}
                  className="text-xs font-medium text-gray-700 border border-gray-200 rounded-lg py-2.5 hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button type="button" onClick={handleEnregistrer} disabled={!formValide || enregistrement}
                  className="text-xs font-medium text-white bg-[#064e3b] rounded-lg py-2.5 hover:bg-[#065f46] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  {enregistrement ? "Enregistrement..." : modeEdition ? "Enregistrer les Modifications" : "Enregistrer le Produit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}