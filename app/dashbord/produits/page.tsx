"use client";

import { useState } from "react";
import { CountingNumber } from "@/components/ui/counting-number";

type Statut = "En stock" | "Stock faible" | "Rupture";
type Event = "NORMAL" | "RAMADAN" | "AID" | "VENDREDI";

type Produit = {
  id: string;
  nom: string;
  categorie: string;
  ingredients: string[];
  labels: string[];
  event: Event;
  stock: number;
  statut: Statut;
  prix: number;
  image: string | null;
};

const CATEGORIES = [
  "Produits Laitiers",
  "Boulangerie",
  "Boucherie",
  "Fruits et Légumes",
  "Boissons",
  "Épicerie",
  "Snack",
  "Surgelés",
];

const INGREDIENTS_LIST = [
  "Eau", "Sucre", "Sel", "Huile", "Lait", "Beurre",
  "Œufs", "Arome", "Colorant", "Gélatine", "Farine",
  "Gluten", "Noix", "Poisson",
];

const LABELS_LIST = [
  "Bio", "Végétarien", "Sans colorant", "Sans arôme", "Vegan",
];

const EVENTS: Event[] = ["NORMAL", "RAMADAN", "AID", "VENDREDI"];

const STATUT_CONFIG: Record<Statut, { label: string; bg: string; text: string }> = {
  "En stock":     { label: "En stock",     bg: "bg-emerald-50", text: "text-emerald-700" },
  "Stock faible": { label: "Stock faible", bg: "bg-amber-50",   text: "text-amber-700"   },
  "Rupture":      { label: "Rupture",      bg: "bg-red-50",     text: "text-red-600"     },
};

const PRODUITS_INITIAUX: Produit[] = [
  { id: "REF-1022", nom: "Huile d'Olive Souss 2L",      categorie: "Épicerie",          ingredients: ["Huile"],               labels: ["Bio"],           event: "NORMAL",   stock: 45,  statut: "En stock",    prix: 1050,   image: null },
  { id: "REF-1021", nom: "Huile d'Olive Souss 1L",      categorie: "Épicerie",          ingredients: ["Huile"],               labels: ["Bio"],           event: "NORMAL",   stock: 43,   statut: "En stock",     prix: 850,   image: null },
  { id: "REF-1234", nom: "Semoule Fine Extra 5kg",       categorie: "Boulangerie",       ingredients: ["Farine", "Gluten"],    labels: ["Végétarien"],    event: "NORMAL",   stock: 12,  statut: "En stock"  ,     prix: 4250,  image: null },
  { id: "REF-2096", nom: "Thé Vert Sultan 200g",         categorie: "Boissons",          ingredients: ["Eau"],                 labels: ["Sans arôme"],    event: "RAMADAN",  stock: 0,   statut: "Rupture",     prix: 2200,  image: null },
  { id: "REF-3042", nom: "Miel d'Oranger Pur 500g",      categorie: "Épicerie",          ingredients: ["Sucre"],               labels: ["Bio", "Vegan"],  event: "VENDREDI", stock: 18,  statut: "En stock",    prix: 13000, image: null },
  { id: "REF-4413", nom: "Datte Medjool 1kg",            categorie: "Fruits et Légumes", ingredients: ["Sucre"],               labels: ["Bio", "Vegan"],  event: "AID",      stock: 5,   statut: "Stock faible",prix: 9600,  image: null },
  { id: "REF-5521", nom: "Couscous Moyen 2kg",           categorie: "Boulangerie",       ingredients: ["Farine", "Gluten"],    labels: ["Végétarien"],    event: "NORMAL",   stock: 60,  statut: "En stock",    prix: 3200,  image: null },
  { id: "REF-6630", nom: "Harissa Traditionnelle 200g",  categorie: "Épicerie",          ingredients: ["Huile", "Sel"],        labels: ["Vegan"],         event: "RAMADAN",  stock: 0,   statut: "Rupture",     prix: 1500,  image: null },
  { id: "REF-7741", nom: "Eau Minérale Ifri 1.5L",       categorie: "Boissons",          ingredients: ["Eau"],                 labels: ["Sans colorant"], event: "NORMAL",   stock: 120, statut: "En stock",    prix: 600,   image: null },
  { id: "REF-8852", nom: "Lait en Poudre 1kg",           categorie: "Produits Laitiers", ingredients: ["Lait"],                labels: ["Végétarien"],    event: "NORMAL",   stock: 9,   statut: "Stock faible",prix: 7800,  image: null },
  { id: "REF-9963", nom: "Café Arabica Moulu 250g",      categorie: "Boissons",          ingredients: ["Eau"],                 labels: ["Sans arôme"],    event: "VENDREDI", stock: 34,  statut: "En stock",    prix: 4100,  image: null },
  { id: "REF-1074", nom: "Huile de Table 5L",            categorie: "Épicerie",          ingredients: ["Huile"],               labels: [],                event: "NORMAL",   stock: 0,   statut: "Rupture",     prix: 8500,  image: null },
  { id: "REF-1185", nom: "Sucre Blanc 2kg",              categorie: "Épicerie",          ingredients: ["Sucre"],               labels: ["Vegan"],         event: "NORMAL",   stock: 77,  statut: "En stock",    prix: 2100,  image: null },
];

function getInitiales(nom: string): string {
  return nom.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function formatPrix(val: number): string {
  return val.toLocaleString("fr-DZ") + " DA";
}

const PAR_PAGE = 10;

const FORM_VIDE = {
  id: "",
  nom: "",
  categorie: "",
  ingredients: [] as string[],
  labels: [] as string[],
  event: "NORMAL" as Event,
  stock: 0,
  prix: 0,
  image: null as string | null,
};

function toggleItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export default function ProduitsPage() {
  const [produits, setProduits] = useState<Produit[]>(PRODUITS_INITIAUX);
  const [page, setPage] = useState(1);
  const [filtreStock, setFiltreStock] = useState("Tous");
  const [filtreEvenement, setFiltreEvenement] = useState("Tous");
  const [filtreCategorie, setFiltreCategorie] = useState("Toutes");
  const [recherche, setRecherche] = useState("");
  const [modalOuvert, setModalOuvert] = useState(false);
  const [modeEdition, setModeEdition] = useState(false);
  const [idEdition, setIdEdition] = useState<string | null>(null);
  const [form, setForm] = useState(FORM_VIDE);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const totalProduits = produits.length;
  const categories = [...new Set(produits.map((p) => p.categorie))].length;
  const alertesStock = produits.filter((p) => p.statut === "Stock faible").length;
  const ruptures = produits.filter((p) => p.statut === "Rupture").length;

  const produitsFiltres = produits

   .filter((p) => {
  if (filtreStock !== "Tous") return p.statut === filtreStock;
  return true;
})
    .filter((p) => {
      if (filtreEvenement !== "Tous") return p.event === filtreEvenement;
      return true;
    })
    .filter((p) => {
      if (filtreCategorie !== "Toutes") return p.categorie === filtreCategorie;
      return true;
    })
    .filter((p) => {
      const q = recherche.toLowerCase().trim();
      if (!q) return true;
      return (
        p.nom.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    });

  const totalPages = Math.max(1, Math.ceil(produitsFiltres.length / PAR_PAGE));
  const produitsPage = produitsFiltres.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

  function handleFiltreStock(val: string) { setFiltreStock(val); setPage(1); }
  function handleFiltreEvenement(val: string) { setFiltreEvenement(val); setPage(1); }
  function handleFiltreCategorie(val: string) { setFiltreCategorie(val); setPage(1); }
  function handleRecherche(val: string) { setRecherche(val); setPage(1); }

  function ouvrirModalAjout() {
    setModeEdition(false);
    setIdEdition(null);
    setForm(FORM_VIDE);
    setImagePreview(null);
    setModalOuvert(true);
  }

  function ouvrirModalEdition(produit: Produit) {
    setModeEdition(true);
    setIdEdition(produit.id);
    setForm({
      id: produit.id,
      nom: produit.nom,
      categorie: produit.categorie,
      ingredients: [...produit.ingredients],
      labels: [...produit.labels],
      event: produit.event,
      stock: produit.stock,
      prix: produit.prix,
      image: produit.image,
    });
    setImagePreview(produit.image);
    setModalOuvert(true);
  }

  function fermerModal() {
    setModalOuvert(false);
    setModeEdition(false);
    setIdEdition(null);
    setForm(FORM_VIDE);
    setImagePreview(null);
  }

 function handleSupprimer(id: string) {
  setProduits((prev) => {
    const newProduits = prev.filter((p) => p.id !== id);
    const newTotalPages = Math.max(1, Math.ceil(newProduits.length / PAR_PAGE));
    if (page > newTotalPages) setPage(newTotalPages);
    return newProduits;
  });
}

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  const formValide =
    form.id.trim() !== "" &&
    form.nom.trim() !== "" &&
    form.categorie !== "" &&
    form.ingredients.length > 0 &&
    imagePreview !== null;

  function handleEnregistrer() {
    if (!formValide) return;

     const statutAuto: Statut =
    form.stock === 0 ? "Rupture"
    : form.stock <= 10 ? "Stock faible"
    : "En stock";

    const produitFinal: Produit = { ...form, image: imagePreview , statut: statutAuto};

    if (modeEdition && idEdition !== null) {
      setProduits((prev) =>
        prev.map((p) => (p.id === idEdition ? produitFinal : p))
      );
    } else {
      setProduits((prev) => [produitFinal, ...prev]);
      setPage(1);
    }
    fermerModal();
  }

  // Check if any extra filter is active
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 gap-3">
          {/* Left: search  */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-black" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input type="text" value={recherche} onChange={(e) => handleRecherche(e.target.value)}
                placeholder="Rechercher par nom ou ID..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md text-black placeholder-black focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
            </div>
          </div>

          {/* Right: statut filter */}
          <select value={filtreStock} onChange={(e) => handleFiltreStock(e.target.value)}
            className="text-xs text-black border border-gray-200 rounded-md px-2 py-1.5 bg-transparent flex-shrink-0">
            <option>Tous</option>
            <option>En stock</option>
            <option>Stock faible</option>
            <option>Rupture</option>
          </select>

          {/* Filtre Événement */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <select
                value={filtreEvenement}
                onChange={(e) => handleFiltreEvenement(e.target.value)}
                   className="text-xs text-black border border-gray-200 rounded-md px-2 py-1.5 bg-transparent flex-shrink-0">
               <option value="Tous">Tous événements</option>
               <option value="NORMAL">NORMAL</option>
               <option value="RAMADAN">RAMADAN</option>
               <option value="AID">AID</option>
               <option value="VENDREDI">VENDREDI</option>
              </select>
            </div>

            {/* Filtre Catégorie */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <select
                value={filtreCategorie}
                onChange={(e) => handleFiltreCategorie(e.target.value)}
                  className="text-xs text-black border border-gray-200 rounded-md px-2 py-1.5 bg-transparent flex-shrink-0">
               <option value="Toutes">Toutes catégories</option>
               <option value="Produits Laitiers">Produits Laitiers</option>
               <option value="Boulangerie">Boulangerie</option>
               <option value="Boucherie">Boucherie</option>
               <option value="Fruits et Légumes">Fruits et Légumes</option>
               <option value="Boissons">Boissons</option>
               <option value="Épicerie">Épicerie</option>
               <option value="Snack">Snack</option>
               <option value="Surgelés">Surgelés</option>
              </select>
            </div>
           
      
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {setFiltreStock("Tous"); setFiltreEvenement("Tous"); setFiltreCategorie("Toutes"); setPage(1); }}
                className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                title="Réinitialiser les filtres"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
                Réinitialiser
              </button>
            )}
        </div>


        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Produit</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">ID</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Catégorie</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Ingrédients</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Labels</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Événement</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Stock</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Statut</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Prix</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {produitsPage.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-8 text-gray-400 text-sm">Aucun produit trouvé</td></tr>
              ) : (
                produitsPage.map((produit, index) => {
                  const statut = STATUT_CONFIG[produit.statut];
                  return (
                    <tr key={produit.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {produit.image ? (
                            <img src={produit.image} alt={produit.nom} className="w-14 h-14 rounded-md object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-none bg-emerald-50 flex items-center justify-center text-[9px] font-medium text-[#064e3b] flex-shrink-0">
                              {getInitiales(produit.nom)}
                            </div>
                          )}
                          <span className="text-gray-900 text-xs">{produit.nom}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-black text-xs">{produit.id}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{produit.categorie}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {produit.ingredients.map((ing) => (
                            <span key={ing} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{ing}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {produit.labels.map((label) => (
                            <span key={label} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{label}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {produit.event}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-black text-xs">{produit.stock} unités</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statut.bg} ${statut.text}`}>{statut.label}</span>
                      </td>
                      <td className="px-4 py-3 text-black text-xs font-medium">{formatPrix(produit.prix)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => ouvrirModalEdition(produit)}
                            className="text-gray-400 hover:text-[#064e3b] transition-colors"
                            title="Modifier"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSupprimer(produit.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Supprimer"
                          >
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

      {/* ===== MODAL ===== */}
      {modalOuvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 pb-4 sticky top-0 bg-white z-10 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {modeEdition ? "Modifier le Produit" : "Ajouter un Nouveau Produit"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {modeEdition
                    ? "Modifiez les informations du produit puis enregistrez."
                    : "Remplissez les informations détaillées pour l'inventaire."}
                </p>
              </div>
          
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 flex flex-col gap-5">

              {/* ID + Nom */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">ID Produit</label>
                  <input type="text" value={form.id} onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
                    placeholder="Ex: REF-1000"
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Nom du Produit</label>
                  <input type="text" value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                    placeholder="Ex: Lait Entier 1L"
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
                </div>
              </div>

              {/* Catégorie + Événement */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Catégorie</label>
                  <select value={form.categorie} onChange={(e) => setForm((f) => ({ ...f, categorie: e.target.value }))}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]">
                    <option value="">Sélectionner...</option>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Événement</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {EVENTS.map((ev) => {
                      const selected = form.event === ev;
                      return (
                        <button key={ev} type="button"
                          onClick={() => setForm((f) => ({ ...f, event: ev }))}
                          className={`text-[10px] font-semibold py-1.5 rounded-lg border transition-all ${
                            selected
                              ? "bg-gray-200 text-gray-800 border-gray-300"
                              : "bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300"
                          }`}>
                          {ev}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Prix + Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Prix (DA)</label>
                  <input type="number" min={0} value={form.prix} onChange={(e) => setForm((f) => ({ ...f, prix: Number(e.target.value) }))}
                    placeholder="0"
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Stock</label>
                  <input type="number" min={0} value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
                    placeholder="0"
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
                </div>
              </div>


              {/* Ingrédients */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Ingrédients</label>
                <div className="flex flex-wrap gap-1.5">
                  {INGREDIENTS_LIST.map((ing) => {
                    const selected = form.ingredients.includes(ing);
                    return (
                      <button key={ing} type="button"
                        onClick={() => setForm((f) => ({ ...f, ingredients: toggleItem(f.ingredients, ing) }))}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${selected ? "bg-gray-200 text-gray-800 border-gray-300" : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"}`}>
                        {ing}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Labels */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Labels</label>
                <div className="flex flex-wrap gap-1.5">
                  {LABELS_LIST.map((label) => {
                    const selected = form.labels.includes(label);
                    return (
                      <button key={label} type="button"
                        onClick={() => setForm((f) => ({ ...f, labels: toggleItem(f.labels, label) }))}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${selected ? "bg-gray-200 text-gray-800 border-gray-300" : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"}`}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photo */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Photo du produit</label>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-5 cursor-pointer hover:border-[#064e3b] transition-colors group">
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="h-16 w-16 object-cover rounded-none" />
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-[#064e3b]">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-gray-500 group-hover:text-[#064e3b]">Cliquez pour télécharger</span>
                      <span className="text-[10px] text-gray-400">PNG, JPG jusqu'à 5MB</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button type="button" onClick={fermerModal}
                  className="text-xs font-medium text-gray-700 border border-gray-200 rounded-lg py-2.5 hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button type="button" onClick={handleEnregistrer}
                  disabled={!formValide}
                  className="text-xs font-medium text-white bg-[#064e3b] rounded-lg py-2.5 hover:bg-[#065f46] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  {modeEdition ? "Enregistrer les Modifications" : "Enregistrer le Produit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}