"use client";
import { useState, useEffect, useCallback } from "react";
import { CountingNumber } from "@/components/ui/counting-number";
import {
  getOffres, creerOffre, modifierOffre, supprimerOffre,
  getProduits,modifierImageOffre, type OffreAPI, type ProduitAPI,
} from "@/lib/api";

// ── Types ────────────────────────────────────────────────────
type Statut = "Actif" | "Inactif" | "À venir";

type Offre = {
  id: string;
  titre: string;
  dateDebut: string;
  dateFin: string;
  prixOriginal: number;
  prixPromo: number;
  tauxReduc: number;
  productIds: string[];
  image: string | null;
  statut: Statut;
};

// ── Helpers ──────────────────────────────────────────────────
function getStatut(dateDebut: string, dateFin: string): Statut {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const debut = new Date(dateDebut); debut.setHours(0, 0, 0, 0);
  const fin   = new Date(dateFin);   fin.setHours(23, 59, 59, 999);
  if (today < debut) return "À venir";
  if (today > fin)   return "Inactif";
  return "Actif";
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" });
}
function formatMontant(n: number) { return n.toLocaleString("fr-DZ") + " DA"; }
function calculerTaux(ancien: number, nouveau: number): number {
  if (ancien <= 0) return 0;
  return Math.round(((ancien - nouveau) / ancien) * 100);
}
function apiToOffre(d: any): Offre {
  const prixOriginal = d.ancienPrix ?? d.prixOriginal ?? d.prixNormal ?? 0;
  return {
    id:           d.idOffre ?? d.id ?? "",
    titre:        d.titreOffre ?? d.titre ?? "",
    dateDebut:    d.dateDebut ?? "",
    dateFin:      d.dateFin ?? "",
    prixOriginal,
    prixPromo:    d.prixPromo ?? 0,
    tauxReduc:    d.tauxReduction ?? calculerTaux(prixOriginal, d.prixPromo ?? 0),
    productIds:   d.productIds ?? [],
    image:        d.offreImg ?? d.image ?? null,  // ← offreImg !
    statut:       getStatut(d.dateDebut ?? "", d.dateFin ?? ""),
  };
}

const BADGE: Record<Statut, string> = {
  Actif:     "bg-emerald-50 text-[#064e3b]",
  Inactif:   "bg-gray-100 text-gray-500",
  "À venir": "bg-amber-50 text-amber-800",
};
const PAR_PAGE = 10;
const FORM_VIDE = {
  id: "", titre: "", dateDebut: "", dateFin: "",
  prixPromo: 0, productIds: [] as string[], image: null as string | null,
};

// ── Page ─────────────────────────────────────────────────────
export default function OffresPage() {
  const [offres, setOffres]           = useState<Offre[]>([]);
  const [produits, setProduits]       = useState<ProduitAPI[]>([]);
  const [chargement, setChargement]   = useState(true);
  const [erreur, setErreur]           = useState<string | null>(null);
  const [page, setPage]               = useState(1);
  const [filtreStatut, setFiltreStatut] = useState("Tous");
  const [recherche, setRecherche]     = useState("");
  const [modalOuvert, setModalOuvert] = useState(false);
  const [modeEdition, setModeEdition] = useState(false);
  const [idEdition, setIdEdition]     = useState<string | null>(null);
  const [form, setForm]               = useState(FORM_VIDE);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile]     = useState<File | null>(null);
  const [rechercheProduit, setRechercheProduit] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);

  // ── Chargement ────────────────────────────────────────────
  const charger = useCallback(async () => {
    setChargement(true); setErreur(null);
    try {
      const [offresData, produitsData] = await Promise.all([getOffres(), getProduits()]);
      setOffres(offresData.map(apiToOffre));
      setProduits(produitsData);
    } catch (err) {
      setErreur("Impossible de charger les données.");
      console.error(err);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  // ── Stats ─────────────────────────────────────────────────
  const actives = offres.filter((o) => o.statut === "Actif");

  // ── Filtres ───────────────────────────────────────────────
  const offresFiltrees = offres.filter((o) => {
    const q = recherche.toLowerCase().trim();
    const matchStatut = filtreStatut === "Tous" || o.statut === filtreStatut;
    const matchRecherche = !q || o.titre.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
    return matchStatut && matchRecherche;
  });
  const totalPages = Math.max(1, Math.ceil(offresFiltrees.length / PAR_PAGE));
  const offresPage = offresFiltrees.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

  // ── Produits filtrés dans le modal ────────────────────────
  const produitsFiltres = rechercheProduit.trim() === "" ? [] :
    produits.filter((p) => {
      const q = rechercheProduit.toLowerCase();
      return p.nomProduit.toLowerCase().includes(q) || p.idProduit.toLowerCase().includes(q);
    });

  // ── Modal ─────────────────────────────────────────────────
  function ouvrirModalAjout() {
    setModeEdition(false); setIdEdition(null);
    setForm(FORM_VIDE); setImagePreview(null); setImageFile(null);
    setRechercheProduit(""); setModalOuvert(true);
  }
  function ouvrirModalEdition(o: Offre) {
    setModeEdition(true); setIdEdition(o.id);
    setForm({ id: o.id, titre: o.titre, dateDebut: o.dateDebut, dateFin: o.dateFin,
              prixPromo: o.prixPromo, productIds: [...o.productIds], image: o.image });
    setImagePreview(o.image); setImageFile(null);
    setRechercheProduit(""); setModalOuvert(true);
  }
  function fermerModal() {
    setModalOuvert(false); setModeEdition(false); setIdEdition(null);
    setForm(FORM_VIDE); setImagePreview(null); setImageFile(null);
    setRechercheProduit("");
  }
  function toggleProduit(id: string) {
    setForm((f) => ({
      ...f,
      productIds: f.productIds.includes(id)
        ? f.productIds.filter((x) => x !== id)
        : [...f.productIds, id],
    }));
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
    form.titre.trim() !== "" && form.dateDebut !== "" &&
    form.dateFin !== "" && form.dateDebut <= form.dateFin &&
    form.prixPromo > 0 && form.productIds.length > 0;

  // ── Enregistrer ───────────────────────────────────────────
  async function handleEnregistrer() {
  if (!formValide || enregistrement) return;
  setEnregistrement(true);
  try {
    const payload = {
      titreOffre: form.titre,
      dateDebut:  form.dateDebut,
      dateFin:    form.dateFin,
      prixPromo:  form.prixPromo,
      productIds: form.productIds,
    };

    if (modeEdition && idEdition) {
  
      const updated = await modifierOffre(idEdition, payload);
     
      if (imageFile) await modifierImageOffre(idEdition, imageFile);
      setOffres((prev) => prev.map((o) => o.id === idEdition ? apiToOffre(updated) : o));
    } else {
      
      const nouvelle = await creerOffre(payload, imageFile);
      setOffres((prev) => [apiToOffre(nouvelle), ...prev]);
      setPage(1);
    }
    fermerModal();
  } catch (err: any) {
    alert(err.message ?? "Erreur lors de l'enregistrement.");
  } finally {
    setEnregistrement(false);
  }
}
  // ── Supprimer ─────────────────────────────────────────────
  async function handleSupprimer(id: string) {
    if (!confirm("Supprimer cette offre définitivement ?")) return;
    try {
      await supprimerOffre(id);
      setOffres((prev) => {
        const updated = prev.filter((o) => o.id !== id);
        const newTotal = Math.max(1, Math.ceil(updated.length / PAR_PAGE));
        if (page > newTotal) setPage(newTotal);
        return updated;
      });
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  }

  const statutCalcule: Statut = form.dateDebut && form.dateFin
    ? getStatut(form.dateDebut, form.dateFin) : "À venir";

  // ── Rendu ─────────────────────────────────────────────────
  return (
    <div className="p-5 flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-medium text-gray-900 uppercase tracking-wide">Gestion des offres</h1>
          <p className="text-sm text-gray-400 mt-0.5">Créez et gérez vos campagnes promotionnelles.</p>
        </div>
        <button type="button" onClick={ouvrirModalAjout}
          className="flex items-center gap-2 bg-[#064e3b] text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-[#065f46] transition-colors flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Ajouter une Offre
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-[#064e3b] text-white p-4 rounded-xl">
          <p className="text-xs text-white/70 mb-1">Offres actives</p>
          <h3 className="text-xl font-medium flex items-baseline gap-1">
            <CountingNumber number={actives.length} />
            <span className="text-sm font-normal text-white/70">offres</span>
          </h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Total offres</p>
          <h3 className="text-xl font-medium text-gray-900 flex items-baseline gap-1">
            <CountingNumber number={offres.length} />
            <span className="text-sm font-normal text-gray-400">au total</span>
          </h3>
        </div>
      </div>

      {/* Chargement */}
      {chargement && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm animate-pulse">
          Chargement des offres depuis l'API...
        </div>
      )}

      {/* Erreur */}
      {erreur && !chargement && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm text-red-600">{erreur}</span>
          <button onClick={charger} className="text-xs text-red-600 border border-red-300 rounded-lg px-3 py-1.5 hover:bg-red-100 transition-colors">
            Réessayer
          </button>
        </div>
      )}

      {/* Table */}
      {!chargement && !erreur && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 gap-3 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-black" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input type="text" value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }}
                placeholder="Rechercher par titre ou ID..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md text-black placeholder-black focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
            </div>
            <select value={filtreStatut} onChange={(e) => { setFiltreStatut(e.target.value); setPage(1); }}
              className="text-xs text-black border border-gray-200 rounded-md px-2 py-1.5 bg-transparent">
              <option>Tous</option><option>Actif</option><option>Inactif</option><option>À venir</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Image","Offre","ID","Produits","Date début","Date fin","Prix original","Prix promo","Réduction","Statut","Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {offresPage.length === 0 ? (
                  <tr><td colSpan={11} className="text-center py-8 text-gray-400 text-sm">Aucune offre trouvée</td></tr>
                ) : (
                  offresPage.map((offre) => {
                    const produitsLies = offre.productIds
                      .map((pid) => produits.find((p) => p.idProduit === pid))
                      .filter(Boolean) as ProduitAPI[];
                    return (
                      <tr key={offre.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          {offre.image
                            ? <img src={offre.image} alt={offre.titre} className="w-40 h-16 rounded-lg object-cover" />
                            : <div className="w-40 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-[10px]">Pas d'image</div>
                          }
                        </td>
                        <td className="px-4 py-3 text-gray-900 text-xs font-medium">{offre.titre}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{offre.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1 max-w-[180px]">
                            {produitsLies.length > 0
                              ? produitsLies.map((p) => (
                                  <span key={p.idProduit} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full w-fit">{p.nomProduit}</span>
                                ))
                              : <span className="text-[10px] text-gray-400">{offre.productIds.length} produit(s)</span>
                            }
                          </div>
                        </td>
                        <td className="px-4 py-3 text-black text-xs">{formatDate(offre.dateDebut)}</td>
                        <td className="px-4 py-3 text-black text-xs">{formatDate(offre.dateFin)}</td>
                        <td className="px-4 py-3 text-gray-400 line-through text-xs">
                          {offre.prixOriginal > 0 ? formatMontant(offre.prixOriginal) : "—"}
                        </td>
                        <td className="px-4 py-3 text-[#064e3b] font-medium text-xs">{formatMontant(offre.prixPromo)}</td>
                        <td className="px-4 py-3">
                          {offre.tauxReduc > 0
                            ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-[#064e3b]">-{offre.tauxReduc}%</span>
                            : <span className="text-xs text-gray-400">—</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${BADGE[offre.statut]}`}>
                            {offre.statut}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => ouvrirModalEdition(offre)} className="text-gray-400 hover:text-[#064e3b] transition-colors" title="Modifier">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button type="button" onClick={() => handleSupprimer(offre.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Supprimer">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
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

          <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              {`${(page - 1) * PAR_PAGE + 1}–${Math.min(page * PAR_PAGE, offresFiltrees.length)} sur ${offresFiltrees.length} offres`}
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

      {/* ── MODAL ── */}
      {modalOuvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start p-6 pb-4 sticky top-0 bg-white z-10 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {modeEdition ? "Modifier l'Offre" : "Ajouter une Nouvelle Offre"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {modeEdition ? "Modifiez les informations puis enregistrez." : "Remplissez les informations de la campagne."}
                </p>
              </div>
            </div>

            <div className="px-6 py-5 flex flex-col gap-5">

              {/* Titre */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Titre de l'offre</label>
                <input type="text" value={form.titre} onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))}
                  placeholder="Ex: Promo Ramadan"
                  className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Date de début</label>
                  <input type="date" value={form.dateDebut} max={form.dateFin || undefined}
                    onChange={(e) => setForm((f) => ({ ...f, dateDebut: e.target.value }))}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Date de fin</label>
                  <input type="date" value={form.dateFin} min={form.dateDebut || undefined}
                    onChange={(e) => setForm((f) => ({ ...f, dateFin: e.target.value }))}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
                </div>
              </div>

              {/* Prix promo */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Prix promo (DA)</label>
                <input type="number" min={0} value={form.prixPromo}
                  onChange={(e) => setForm((f) => ({ ...f, prixPromo: Number(e.target.value) }))}
                  className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
              </div>

              {/* Produits */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Produits concernés</label>
                <div className="relative">
                  <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  <input type="text" value={rechercheProduit}
                    onChange={(e) => setRechercheProduit(e.target.value)}
                    placeholder="Rechercher un produit par nom ou ID..."
                    className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]" />
                </div>

                {rechercheProduit.trim() !== "" && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                    {produitsFiltres.length === 0
                      ? <p className="text-xs text-gray-400 text-center py-4">Aucun produit trouvé</p>
                      : produitsFiltres.map((p) => {
                          const selected = form.productIds.includes(p.idProduit);
                          return (
                            <button key={p.idProduit} type="button" onClick={() => toggleProduit(p.idProduit)}
                              className={`w-full flex items-center justify-between px-3 py-2 text-xs border-b border-gray-50 last:border-b-0 transition-colors ${selected ? "bg-emerald-50 text-[#064e3b]" : "hover:bg-gray-50 text-gray-700"}`}>
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${selected ? "bg-[#064e3b] border-[#064e3b]" : "border-gray-300"}`}>
                                  {selected && (
                                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="2 6 5 9 10 3" />
                                    </svg>
                                  )}
                                </div>
                                <span className="font-medium">{p.nomProduit}</span>
                                <span className="text-[10px] text-gray-400">{p.idProduit}</span>
                              </div>
                              <span className={`font-medium flex-shrink-0 ${selected ? "text-[#064e3b]" : "text-gray-500"}`}>
                                {formatMontant(p.prixP)}
                              </span>
                            </button>
                          );
                        })
                    }
                  </div>
                )}

                {form.productIds.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Sélectionnés ({form.productIds.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {form.productIds.map((pid) => {
                        const p = produits.find((x) => x.idProduit === pid);
                        return (
                          <span key={pid} className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-50 text-[#064e3b] border border-emerald-200 px-2 py-1 rounded-full">
                            {p?.nomProduit ?? pid}
                            <button type="button" onClick={() => toggleProduit(pid)} className="hover:text-red-500 transition-colors">
                              <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 2l8 8M10 2l-8 8" />
                              </svg>
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Image */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Image de l'offre</label>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-5 cursor-pointer hover:border-[#064e3b] transition-colors group">
                  {imagePreview
                    ? <img src={imagePreview} alt="preview" className="h-16 w-40 object-cover rounded-lg" />
                    : <>
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-[#064e3b]">
                            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-gray-500 group-hover:text-[#064e3b]">Cliquez pour télécharger</span>
                        <span className="text-[10px] text-gray-400">PNG, JPG jusqu'à 5MB</span>
                      </>
                  }
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>

              {/* Récapitulatif */}
            {(form.productIds.length > 0 || (form.dateDebut && form.dateFin)) && (
               <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2 border border-gray-100">
                 <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Récapitulatif</p>
    
                   <div className="flex justify-between items-center text-xs">
                       <span className="text-gray-500">Statut calculé</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${BADGE[statutCalcule]}`}>
              {statutCalcule}
             </span>
           </div>

          <div className="flex justify-between items-center text-xs">
             <span className="text-gray-500">Ancien prix (cumul produits)</span>
           <span className="font-medium text-gray-400 line-through">
            {form.productIds.length > 0
             ? formatMontant(form.productIds.reduce((sum, pid) => {
              const p = produits.find((x) => x.idProduit === pid);
              return sum + (p ? p.prixP : 0);
            }, 0))
           : "—"}
               </span>
           </div>

    <div className="flex justify-between items-center text-xs">
      <span className="text-gray-500">Taux de réduction</span>
      <span className="font-medium text-[#064e3b]">
        {form.productIds.length > 0 && form.prixPromo > 0
          ? `-${calculerTaux(
              form.productIds.reduce((sum, pid) => {
                const p = produits.find((x) => x.idProduit === pid);
                return sum + (p ? p.prixP : 0);
              }, 0),
              form.prixPromo
            )}%`
          : "—"}
      </span>
    </div>
  </div>
)}

              {/* Boutons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button type="button" onClick={fermerModal}
                  className="text-xs font-medium text-gray-700 border border-gray-200 rounded-lg py-2.5 hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button type="button" onClick={handleEnregistrer} disabled={!formValide || enregistrement}
                  className="text-xs font-medium text-white bg-[#064e3b] rounded-lg py-2.5 hover:bg-[#065f46] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  {enregistrement ? "Enregistrement..." : modeEdition ? "Enregistrer les Modifications" : "Enregistrer l'Offre"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}