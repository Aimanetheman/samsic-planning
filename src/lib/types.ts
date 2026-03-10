// ============================================================
// Samsic Planning IA - Data Model Types
// Based on CDC (Cahier des Charges) specifications
// ============================================================

// --- Employee ---

export type LanguageLevel = 'natif' | 'courant' | 'intermediaire' | 'notions';
export type ContractType = 'CDI' | 'CDD' | 'interim';
export type WorkTime = 'temps_plein' | 'mi_temps';
export type EmployeeStatus = 'actif' | 'inactif' | 'en_formation';

export interface EmployeeLanguage {
  language: string; // FR, EN, LU, DE, PT
  level: LanguageLevel;
}

export interface EmployeeSkill {
  skill: string; // accueil_standard, gestion_appels, microsoft_office, prise_rdv, gestion_courrier, facturation, accueil_juridique
}

export interface EmployeeFormation {
  name: string;
  date_obtained: string;
  date_expiry: string | null;
  is_valid: boolean;
}

export interface Employee {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  photo_url?: string;
  type_contrat: ContractType;
  temps_travail: WorkTime;
  heures_hebdo: number; // max weekly hours
  heures_planifiees_semaine: number; // currently scheduled this week
  langues: EmployeeLanguage[];
  competences: EmployeeSkill[];
  formations: EmployeeFormation[];
  statut: EmployeeStatus;
  anciennete_mois: number;
  created_at: string;
}

// --- Client / Site ---

export type Priority = 'haute' | 'moyenne' | 'basse';

export interface ClientLangueRequise {
  language: string;
  minimum_level: LanguageLevel;
}

export interface Client {
  id: string;
  nom: string;
  adresse: string;
  horaire_debut: string; // "08:00"
  horaire_fin: string; // "17:00"
  langues_requises: ClientLangueRequise[];
  competences_requises: string[];
  priorite: Priority;
  certifications_requises: string[];
  titulaires: string[]; // employee IDs
  en_formation: string[]; // employee IDs
  stand_by: string[]; // employee IDs
}

// --- Affectation (Assignment) ---

export type AffectationType = 'titulaire' | 'formation' | 'stand_by' | 'remplacement';
export type AffectationStatut = 'confirme' | 'en_attente' | 'annule';

export interface Affectation {
  id: string;
  employe_id: string;
  client_id: string;
  date: string; // YYYY-MM-DD
  type: AffectationType;
  statut: AffectationStatut;
  score_ia?: number;
  created_at: string;
}

// --- Absence ---

export type AbsenceType = 'maladie' | 'conge' | 'imprevue' | 'autre';
export type AbsenceStatus = 'ouverte' | 'couverte' | 'non_couverte';
export type AbsenceChannel = 'telephone' | 'email' | 'whatsapp' | 'sms';

export interface Absence {
  id: string;
  employe_id: string;
  client_id: string;
  date: string;
  type: AbsenceType;
  channel: AbsenceChannel;
  statut: AbsenceStatus;
  remplacement_id?: string; // affectation ID of replacement
  notes?: string;
  created_at: string;
}

// --- Matching Result ---

export interface MatchCandidate {
  employe_id: string;
  employe_nom: string;
  employe_prenom: string;
  score_total: number; // 0-100
  score_langues: number; // 0-35
  score_competences: number; // 0-25
  score_disponibilite: number; // 0-20
  score_experience: number; // 0-10
  score_standby: number; // 0-10
  raisons: string[]; // human-readable reasons
  exclusion_raisons?: string[]; // if excluded
  is_standby: boolean;
  is_available: boolean;
}

// --- Alert ---

export type AlertType =
  | 'absence'
  | 'poste_non_couvert'
  | 'formation_expiree'
  | 'refresh'
  | 'conflit_horaire'
  | 'standby_insuffisant';

export type AlertPriority = 'urgent' | 'moyen' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  title: string;
  description: string;
  related_client_id?: string;
  related_employe_id?: string;
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

// --- Planning Day Status ---

export type DayStatus = 'titulaire' | 'formation' | 'stand_by' | 'remplacement' | 'absent' | 'non_couvert';

// --- KPI ---

export interface DashboardKPI {
  clients_actifs: number;
  employes_actifs: number;
  absences_aujourdhui: number;
  postes_non_couverts: number;
}
