"use client";
import { useState } from "react";
import { CountingNumber } from "@/components/ui/counting-number";

type Statut = "Actif" | "Inactif" | "À venir";

type Produit = {
  id: string;
  nom: string;
  prix: number;
};

type Offre = {
  id: string;
  titre: string;
  dateDebut: string;
  dateFin: string;
  ancienPrix: number;
  nouveauPrix: number;
  produits: string[];
};

const CATALOGUE_PRODUITS: Produit[] = [
  { id: "REF-1022", nom: "Huile d'Olive Souss 2L",     prix: 1050  },
  { id: "REF-1021", nom: "Huile d'Olive Souss 1L",     prix: 850   },
  { id: "REF-1234", nom: "Semoule Fine Extra 5kg",      prix: 4250  },
  { id: "REF-2096", nom: "Thé Vert Sultan 200g",        prix: 2200  },
  { id: "REF-3042", nom: "Miel d'Oranger Pur 500g",     prix: 13000 },
  { id: "REF-4413", nom: "Datte Medjool 1kg",           prix: 9600  },
  { id: "REF-5521", nom: "Couscous Moyen 2kg",          prix: 3200  },
  { id: "REF-6630", nom: "Harissa Traditionnelle 200g", prix: 1500  },
  { id: "REF-7741", nom: "Eau Minérale Ifri 1.5L",      prix: 600   },
  { id: "REF-8852", nom: "Lait en Poudre 1kg",          prix: 7800  },
  { id: "REF-9963", nom: "Café Arabica Moulu 250g",     prix: 4100  },
  { id: "REF-1074", nom: "Huile de Table 5L",           prix: 8500  },
  { id: "REF-1185", nom: "Sucre Blanc 2kg",             prix: 2100  },
];

const offresInitiales: Offre[] = [
  { id: "OF-2035", titre: "Soldes d'été – Électroménager",   dateDebut: "2024-01-01", dateFin: "2026-04-31", ancienPrix: 4000,  nouveauPrix: 1899, produits: ["REF-1022", "REF-1021"] },
  { id: "OF-2024", titre: "Soldes d'hiver – Électroménager", dateDebut: "2024-01-01", dateFin: "2024-01-31", ancienPrix: 2999,  nouveauPrix: 1899, produits: ["REF-5521", "REF-1234"] },
  { id: "OF-2023", titre: "Pack Ramadan – Denrées de base",  dateDebut: "2024-03-10", dateFin: "2024-04-04", ancienPrix: 450,   nouveauPrix: 380,  produits: ["REF-2096", "REF-6630"] },
  { id: "OF-2025", titre: "Offre Flash – Smartphones",       dateDebut: "2024-05-12", dateFin: "2024-05-17", ancienPrix: 5000,  nouveauPrix: 4388, produits: ["REF-9963"] },
  { id: "OF-2026", titre: "Promo Été – Climatiseurs",        dateDebut: "2026-06-01", dateFin: "2026-07-31", ancienPrix: 8500,  nouveauPrix: 6800, produits: ["REF-3042", "REF-4413"] },
  { id: "OF-2027", titre: "Rentrée Scolaire – Fournitures",  dateDebut: "2026-09-01", dateFin: "2026-09-15", ancienPrix: 1200,  nouveauPrix: 950,  produits: ["REF-7741"] },
  { id: "OF-2028", titre: "Black Friday – High-Tech",        dateDebut: "2026-11-28", dateFin: "2026-11-30", ancienPrix: 12000, nouveauPrix: 9500, produits: ["REF-8852", "REF-1074"] },
  { id: "OF-2029", titre: "Soldes Hivernaux – Chauffage",    dateDebut: "2025-12-01", dateFin: "2026-01-15", ancienPrix: 3500,  nouveauPrix: 2800, produits: ["REF-1185"] },
];

function getStatut(dateDebut: string, dateFin: string): Statut {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const debut = new Date(dateDebut);
  debut.setHours(0, 0, 0, 0);
  const fin = new Date(dateFin);
  fin.setHours(23, 59, 59, 999);
  if (today < debut) return "À venir";
  if (today > fin) return "Inactif";
  return "Actif";
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" });
}

function formatMontant(n: number) {
  return n.toLocaleString("fr-DZ") + " DA";
}

function getPrixCumule(produitsIds: string[]): number {
  return produitsIds.reduce((sum, pid) => {
    const p = CATALOGUE_PRODUITS.find((x) => x.id === pid);
    return sum + (p ? p.prix : 0);
  }, 0);
}

const BADGE: Record<Statut, string> = {
  Actif:     "bg-emerald-50 text-[#064e3b]",
  Inactif:   "bg-gray-100 text-gray-500",
  "À venir": "bg-amber-50 text-amber-800",
};

const PAR_PAGE = 10;

const FORM_VIDE = {
  id: "",
  titre: "",
  dateDebut: "",
  dateFin: "",
  nouveauPrix: 0,
  produitsIds: [] as string[],
};

export default function OffresPage() {
  const [offres, setOffres] = useState<Offre[]>(offresInitiales);
  const [page, setPage] = useState(1);
  const [filtreStatut, setFiltreStatut] = useState("Tous");
  const [recherche, setRecherche] = useState("");
  const [modalOuvert, setModalOuvert] = useState(false);
  const [modeEdition, setModeEdition] = useState(false);
  const [idEdition, setIdEdition] = useState<string | null>(null);
  const [form, setForm] = useState(FORM_VIDE);

  const offresAvecStatut = offres.map((o) => ({
    ...o,
    statut: getStatut(o.dateDebut, o.dateFin),
    ancienPrix: o.produits.length > 0 ? getPrixCumule(o.produits) : o.ancienPrix,
  }));

  const actives = offresAvecStatut.filter((o) => o.statut === "Actif");

  const offresFiltrees = offresAvecStatut.filter((o) => {
    const q = recherche.toLowerCase().trim();
    const matchStatut = filtreStatut === "Tous" || o.statut === filtreStatut;
    const matchRecherche = !q || o.titre.toLowerCase().includes(q) || o.id.toLowerCase().includes(q);
    return matchStatut && matchRecherche;
  });

  const totalPages = Math.max(1, Math.ceil(offresFiltrees.length / PAR_PAGE));
  const offresPage = offresFiltrees.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

  function handleStatut(val: string) {
    setFiltreStatut(val);
    setPage(1);
  }

  function handleRecherche(val: string) {
    setRecherche(val);
    setPage(1);
  }

  function ouvrirModalAjout() {
    setModeEdition(false);
    setIdEdition(null);
    setForm(FORM_VIDE);
    setModalOuvert(true);
  }

  function ouvrirModalEdition(offre: Offre) {
    setModeEdition(true);
    setIdEdition(offre.id);
    setForm({
      id: offre.id,
      titre: offre.titre,
      dateDebut: offre.dateDebut,
      dateFin: offre.dateFin,
      nouveauPrix: offre.nouveauPrix,
      produitsIds: [...offre.produits],
    });
    setModalOuvert(true);
  }

  function fermerModal() {
    setModalOuvert(false);
    setModeEdition(false);
    setIdEdition(null);
    setForm(FORM_VIDE);
  }

  function handleSupprimer(id: string) {
    setOffres((prev) => {
      const newOffres = prev.filter((o) => o.id !== id);
      const newTotalPages = Math.max(1, Math.ceil(newOffres.length / PAR_PAGE));
      if (page > newTotalPages) setPage(newTotalPages);
      return newOffres;
    });
  }

  function toggleProduit(id: string) {
    setForm((f) => ({
      ...f,
      produitsIds: f.produitsIds.includes(id)
        ? f.produitsIds.filter((x) => x !== id)
        : [...f.produitsIds, id],
    }));
  }

  const ancienPrixCalcule = getPrixCumule(form.produitsIds);

  const statutCalcule: Statut =
    form.dateDebut && form.dateFin
      ? getStatut(form.dateDebut, form.dateFin)
      : "À venir";

  const formValide =
    form.id.trim() !== "" &&
    form.titre.trim() !== "" &&
    form.dateDebut !== "" &&
    form.dateFin !== "" &&
    form.nouveauPrix > 0 &&
    form.produitsIds.length > 0;

  function handleEnregistrer() {
    if (!formValide) return;
    const offreFinal: Offre = {
      id: form.id.trim(),
      titre: form.titre.trim(),
      dateDebut: form.dateDebut,
      dateFin: form.dateFin,
      ancienPrix: ancienPrixCalcule,
      nouveauPrix: form.nouveauPrix,
      produits: form.produitsIds,
    };
    if (modeEdition && idEdition !== null) {
      setOffres((prev) => prev.map((o) => (o.id === idEdition ? offreFinal : o)));
    } else {
      setOffres((prev) => [offreFinal, ...prev]);
      setPage(1);
    }
    fermerModal();
  }

  return (
    <div className="p-5 flex flex-col gap-4">

      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-medium text-gray-900 uppercase tracking-wide">
            Gestion des offres
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Créez et gérez vos campagnes promotionnelles en cours.
          </p>
        </div>
        <button
          type="button"
          onClick={ouvrirModalAjout}
          className="flex items-center gap-2 bg-[#064e3b] text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-[#065f46] transition-colors flex-shrink-0"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Ajouter une Offre
        </button>
      </div>

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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 gap-3 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-black" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={recherche}
              onChange={(e) => handleRecherche(e.target.value)}
              placeholder="Rechercher par titre ou ID..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md text-black placeholder-black focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]"
            />
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <select
              value={filtreStatut}
              onChange={(e) => handleStatut(e.target.value)}
              className="text-xs text-black border border-gray-200 rounded-md px-2 py-1.5 bg-transparent"
            >
              <option>Tous</option>
              <option>Actif</option>
              <option>Inactif</option>
              <option>À venir</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Offre</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">ID</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Produits</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Date début</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Date fin</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Ancien prix</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Nouveau prix</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Statut</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offresPage.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-400 text-sm">
                    Aucune offre trouvée
                  </td>
                </tr>
              ) : (
                offresPage.map((offre, i) => {
                  const produitsLies = offre.produits
                    .map((pid) => CATALOGUE_PRODUITS.find((p) => p.id === pid))
                    .filter(Boolean) as Produit[];

                  return (
                    <tr key={`${offre.id}-${i}`} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-gray-900 text-sm">{offre.titre}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{offre.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 max-w-[200px]">
                          {
                            produitsLies.map((p) => (
                              <span key={p.id} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full w-fit">
                                {p.nom}
                              </span>
                            ))
                          }
                        </div>
                      </td>
                      <td className="px-4 py-3 text-black text-xs">{formatDate(offre.dateDebut)}</td>
                      <td className="px-4 py-3 text-black text-xs">{formatDate(offre.dateFin)}</td>
                      <td className="px-4 py-3 text-gray-400 line-through text-xs">{formatMontant(offre.ancienPrix)}</td>
                      <td className="px-4 py-3 text-[#064e3b] font-medium text-xs">{formatMontant(offre.nouveauPrix)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${BADGE[offre.statut]}`}>
                          {offre.statut}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => ouvrirModalEdition(offre)}
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
                            onClick={() => handleSupprimer(offre.id)}
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

        <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {`${(page - 1) * PAR_PAGE + 1}–${Math.min(page * PAR_PAGE, offresFiltrees.length)} sur ${offresFiltrees.length} offres`}
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

      {modalOuvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">

            <div className="flex items-start justify-between p-6 pb-4 sticky top-0 bg-white z-10 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {modeEdition ? "Modifier l'Offre" : "Ajouter une Nouvelle Offre"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {modeEdition
                    ? "Modifiez les informations de la campagne puis enregistrez."
                    : "Remplissez les informations de la campagne promotionnelle."}
                </p>
              </div>
            </div>

            <div className="px-6 py-5 flex flex-col gap-5">

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">ID Offre</label>
                  <input
                    type="text"
                    value={form.id}
                    onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
                    placeholder="Ex: OF-2030"
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Titre de l'offre</label>
                  <input
                    type="text"
                    value={form.titre}
                    onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))}
                    placeholder="Ex: Promo Ramadan"
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Date de début</label>
                  <input
                    type="date"
                    value={form.dateDebut}
                    onChange={(e) => setForm((f) => ({ ...f, dateDebut: e.target.value }))}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Date de fin</label>
                  <input
                    type="date"
                    value={form.dateFin}
                    onChange={(e) => setForm((f) => ({ ...f, dateFin: e.target.value }))}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Nouveau prix (DA)</label>
                <input
                  type="number"
                  min={0}
                  value={form.nouveauPrix}
                  onChange={(e) => setForm((f) => ({ ...f, nouveauPrix: Number(e.target.value) }))}
                  placeholder="0"
                  className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#064e3b] focus:border-[#064e3b]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Produits concernés</label>
                <p className="text-[10px] text-gray-400 -mt-1">
                  Sélectionnez au moins un produit. L'ancien prix sera calculé automatiquement.
                </p>
                <div className="border border-gray-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                  {CATALOGUE_PRODUITS.map((produit) => {
                    const selected = form.produitsIds.includes(produit.id);
                    return (
                      <button
                        key={produit.id}
                        type="button"
                        onClick={() => toggleProduit(produit.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs border-b border-gray-50 last:border-b-0 transition-colors ${
                          selected ? "bg-emerald-50 text-[#064e3b]" : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                            selected ? "bg-[#064e3b] border-[#064e3b]" : "border-gray-300"
                          }`}>
                            {selected && (
                              <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="2 6 5 9 10 3" />
                              </svg>
                            )}
                          </div>
                          <span className="font-medium">{produit.nom}</span>
                          <span className="text-[10px] text-gray-400">{produit.id}</span>
                        </div>
                        <span className={`font-medium ${selected ? "text-[#064e3b]" : "text-gray-500"}`}>
                          {formatMontant(produit.prix)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {(form.produitsIds.length > 0 || (form.dateDebut && form.dateFin)) && (
                <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2 border border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Récapitulatif calculé automatiquement
                  </p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Ancien prix (cumul produits)</span>
                    <span className="font-medium text-gray-400 line-through">
                      {ancienPrixCalcule > 0 ? formatMontant(ancienPrixCalcule) : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Statut</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${BADGE[statutCalcule]}`}>
                      {statutCalcule}
                    </span>
                  </div>
                  {ancienPrixCalcule > 0 && form.nouveauPrix > 0 && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Réduction</span>
                      <span className="font-medium text-[#064e3b]">
                        {Math.round(((ancienPrixCalcule - form.nouveauPrix) / ancienPrixCalcule) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={fermerModal}
                  className="text-xs font-medium text-gray-700 border border-gray-200 rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleEnregistrer}
                  disabled={!formValide}
                  className="text-xs font-medium text-white bg-[#064e3b] rounded-lg py-2.5 hover:bg-[#065f46] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {modeEdition ? "Enregistrer les Modifications" : "Enregistrer l'Offre"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
