// ============================================================
// api.ts — Service API centralisé pour Hanouty
// Importe ce fichier dans toutes tes pages au lieu d'écrire
// fetch() directement.
// ============================================================

const BASE_URL = "https://hanouty-api-docs-ahsv.onrender.com";

// ── Gestion du token ─────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("hanouty_token");
}

export function setToken(token: string): void {
  localStorage.setItem("hanouty_token", token);
}

export function removeToken(): void {
  localStorage.removeItem("hanouty_token");
}

// ── Headers automatiques ─────────────────────────────────────
function buildHeaders(isFormData = false): HeadersInit {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

// ── Requête générique avec gestion d'erreur ──────────────────
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...buildHeaders(options.body instanceof FormData), ...options.headers },
  });

  // Token expiré → on essaie de le rafraîchir une fois
  if (res.status === 401 && path !== "/auth/refresh" && path !== "/auth/login") {
    try {
      await refreshToken();
      const retry = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: { ...buildHeaders(options.body instanceof FormData), ...options.headers },
      });
      if (!retry.ok) {
        removeToken();
        window.location.href = "/";
        throw new Error("Session expirée, veuillez vous reconnecter.");
      }
      const text = await retry.text();
      return text ? JSON.parse(text) : ({} as T);
    } catch {
      removeToken();
      window.location.href = "/";
      throw new Error("Session expirée, veuillez vous reconnecter.");
    }
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.message ?? `Erreur ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

// ============================================================
// AUTH
// ============================================================

export interface LoginPayload {
  username: string;   // ← l'API utilise "username" (pas "email")
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  accessToken: string;        // ← l'API retourne "accessToken"
  refreshToken?: string;      // ← et "refreshToken"
  gerant?: unknown | null;
  employe?: unknown | null;
  data?: {
    accessToken?: string;
    refreshToken?: string;
  };
}

/** Se connecter — sauvegarde automatiquement le token */
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const data = await request<any>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      username:   payload.username,
      password:   payload.password,
      rememberMe: payload.rememberMe ?? false,
    }),
  });

  // Gère les deux structures possibles : { accessToken } ou { data: { accessToken } }
  const token = data.accessToken ?? data.data?.accessToken ?? data.token;

  if (!token) {
    console.error("Réponse login complète :", JSON.stringify(data));
    throw new Error("Token introuvable dans la réponse du serveur");
  }

  setToken(token);
  return data;
}

/** Se déconnecter */
export async function logout(): Promise<void> {
  await request("/auth/logout", { method: "POST" }).catch(() => {});
  removeToken();
}

/** Rafraîchir le token */
export async function refreshToken(): Promise<void> {
  const data = await request<any>("/auth/refresh", { method: "POST" });
  const token = data.accessToken ?? data.data?.accessToken ?? data.token;
  if (token) setToken(token);
}

/** Profil de l'utilisateur connecté */
export async function getMe() {
  return request("/auth/me");
}

// ============================================================
// PRODUITS
// ============================================================

export interface ProduitAPI {
  idProduit: string;
  nomProduit: string;
  categorie: string;
  rayon: string;
  ingredients: string[];
  labelsAlimentaires: string[];
  evenement: string;
  quantite: number;
  prixP: number;
  imageP: string | null;
  proteins: number;
  glucides: number;
  lipides: number;
}

/** Récupérer tous les produits */
export async function getProduits(): Promise<ProduitAPI[]> {
  const res = await request<any>("/products");
  
  // La réponse est { success: true, data: [...] }
  if (res.data && Array.isArray(res.data)) return res.data;
  if (Array.isArray(res)) return res;
  return res.produits ?? res.products ?? [];
}

/** Récupérer un seul produit par ID */
export async function getProduit(id: string): Promise<ProduitAPI> {
  return request<ProduitAPI>(`/products/${id}`);
}

/** Créer un produit (avec ou sans image) */
export async function creerProduit(
  produit: Omit<ProduitAPI, "id">,
  imageFile?: File | null
): Promise<ProduitAPI> {
  if (imageFile) {
    const fd = new FormData();
    Object.entries(produit).forEach(([k, v]) =>
      fd.append(k, Array.isArray(v) ? JSON.stringify(v) : String(v))
    );
    fd.append("image", imageFile);
    return request<ProduitAPI>("/products", { method: "POST", body: fd });
  }
  return request<ProduitAPI>("/products", {
    method: "POST",
    body: JSON.stringify(produit),
  });
}

/** Modifier un produit */
export async function modifierProduit(
  id: string,
  produit: Partial<ProduitAPI>,
  imageFile?: File | null
): Promise<ProduitAPI> {
  if (imageFile) {
    const fd = new FormData();
    Object.entries(produit).forEach(([k, v]) =>
      v !== undefined && fd.append(k, Array.isArray(v) ? JSON.stringify(v) : String(v))
    );
    fd.append("image", imageFile);
    return request<ProduitAPI>(`/products/${id}`, { method: "PATCH", body: fd });
  }
  return request<ProduitAPI>(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(produit),
  });
}

/** Supprimer un produit */
export async function supprimerProduit(id: string): Promise<void> {
  return request(`/products/${id}`, { method: "DELETE" });
}


// ── CLIENTS ──────────────────────────────────────────────────
 
// ── CLIENTS ──────────────────────────────────────────────────
 
export interface ClientAPI {
  id: string;
  nom?: string;
  prenom?: string;
  username: string;
  email: string;
  telephone?: string;
  phoneNumber?: string;
  dateCreation?: string;
  createdAt?: string;
}
 
export async function getClients(): Promise<any[]> {
  const data = await request<any>("/users/clients");
  if (Array.isArray(data)) return data;
  if (data?.data) return data.data;
  return data.clients ?? data.users ?? [];
}

// ── EMPLOYÉS ─────────────────────────────────────────────────
 
export interface EmployeAPI {
  idUtilisateur?: string;
  id?: string;
  nom: string;
  prenom: string;
  username: string;
  email: string;
  numTelephone?: string;
  telephone?: string;
  poste?: string;
  createdAt?: string;
  employe?: { poste?: string } | null;
}
 
export interface CreerEmployePayload {
  prenom: string;
  nom: string;
  email: string;
  username: string;
  password: string;
  numTelephone: string;
  poste: string; // "CAISSIER" | "RESPONSABLE_RAYON" | "AGENT_SECURITE"
}
 
export async function getEmployes(): Promise<any[]> {
  const data = await request<any>("/users/employees");
  if (Array.isArray(data)) return data;
  if (data?.data) return data.data;
  return data.employees ?? data.users ?? [];
}
 
export async function creerEmploye(payload: CreerEmployePayload): Promise<any> {
  const data = await request<any>("/users/employees", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data?.data ?? data;
}
 
export async function supprimerEmploye(id: string): Promise<void> {
  return request(`/users/${id}`, { method: "DELETE" });
}


// RECUS / VENTES
// ============================================================
 
export interface RecuClient {
  firstName: string;
  lastName: string;
}
 
export interface RecuProduit {
  idProduit: string;
  nomProduit: string;
  imageP: string | null;
  prixUnitaire: number;
  quantite: number;
  subtotal: number;
}

export interface RecuOffre {
  idOffre?: string;
  titreOffre?: string;
  prixPromo?: number;
}

export interface RecuAPI {
  idRecu: string;
  numRecu: string;
  idTransaction: string;
  dateR: string;
  heureR: string;
  prix_total: number;
  client: RecuClient | null;
  produits: RecuProduit[];   // ← nouveau
  offres: RecuOffre[];       // ← nouveau
}
 
/** Récupérer tous les reçus (client inclus dans la réponse) */
export async function getRecus(): Promise<RecuAPI[]> {
  const res = await request<any>("/recus");
  if (res.data && Array.isArray(res.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
}

/** Récupérer le profil du gérant connecté */
export async function getMonProfil(): Promise<any> {
  const res = await request<any>("/users/me");
  return res.data ?? res;
}

/** Mettre à jour username et/ou mot de passe */
export async function modifierCredentials(payload: {
  username?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<any> {
  const res = await request<any>("/users/me/credentials", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data ?? res;
}


// ── OFFRES ───────────────────────────────────────────────────
 
export interface OffreAPI {
  idOffre: string;
  titreOffre: string;
  dateDebut: string;
  dateFin: string;
  prixPromo: number;
  image: string | null;
  productIds: string[];
  prixOriginal?: number;
  produits?: ProduitAPI[];
}
 
/** Récupérer toutes les offres */
export async function getOffres(): Promise<OffreAPI[]> {
  const res = await request<any>("/offres");
  if (res.data && Array.isArray(res.data)) return res.data;
  if (Array.isArray(res)) return res;
  return res.offres ?? [];
}
 
/** Créer une offre (multipart/form-data) */
export async function creerOffre(
  payload: { titreOffre: string; dateDebut: string; dateFin: string; prixPromo: number; productIds: string[] },
  imageFile?: File | null
): Promise<OffreAPI> {
  const fd = new FormData();
  fd.append("titreOffre", payload.titreOffre);
  fd.append("dateDebut",  payload.dateDebut);
  fd.append("dateFin",    payload.dateFin);
  fd.append("prixPromo",  String(payload.prixPromo));
  payload.productIds.forEach((id) => fd.append("productIds", id));
  if (imageFile) fd.append("image", imageFile);
  const res = await request<any>("/offres", { method: "POST", body: fd });
  return res.data ?? res;
}
 
/** Modifier une offre (multipart/form-data) */
export async function modifierOffre(
  id: string,
  payload: { titreOffre?: string; dateDebut?: string; dateFin?: string; prixPromo?: number; productIds?: string[] },
  imageFile?: File | null
): Promise<OffreAPI> {
  
  if (!imageFile) {
    const res = await request<any>(`/offres/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return res.data ?? res;
  }

  
  const fd = new FormData();
  if (payload.titreOffre !== undefined) fd.append("titreOffre", payload.titreOffre);
  if (payload.dateDebut  !== undefined) fd.append("dateDebut",  payload.dateDebut);
  if (payload.dateFin    !== undefined) fd.append("dateFin",    payload.dateFin);
  if (payload.prixPromo  !== undefined) fd.append("prixPromo",  String(payload.prixPromo));
  if (payload.productIds !== undefined) payload.productIds.forEach((pid) => fd.append("productIds", pid));
  fd.append("image", imageFile);
  const res = await request<any>(`/offres/${id}`, { method: "PATCH", body: fd });
  return res.data ?? res;
}
/** Supprimer une offre */
export async function supprimerOffre(id: string): Promise<void> {
  return request(`/offres/${id}`, { method: "DELETE" });
}


export async function modifierImageOffre(id: string, imageFile: File): Promise<any> {
  const fd = new FormData();
  fd.append("image", imageFile);
  const res = await request<any>(`/offres/${id}/image`, { method: "PATCH", body: fd });
  return res.data ?? res;
}


