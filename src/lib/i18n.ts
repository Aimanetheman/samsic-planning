'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import React from 'react';

export type Locale = 'fr' | 'en';

const translations: Record<Locale, Record<string, string>> = {
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.personnel': 'Personnel',
    'nav.clients': 'Clients',
    'nav.planning': 'Planning',
    'nav.matching': 'IA Matching',
    'nav.alertes': 'Alertes',
    'nav.formations': 'Formations',
    'nav.parametres': 'Parametres',
    'nav.collapse': 'Reduire',

    // Dashboard
    'dashboard.title': 'Tableau de bord',
    'dashboard.subtitle': "Vue d'ensemble de la planification du jour",
    'dashboard.clients_actifs': 'Clients actifs',
    'dashboard.employes_actifs': 'Employes actifs',
    'dashboard.absences_today': "Absences aujourd'hui",
    'dashboard.postes_non_couverts': 'Postes non couverts',
    'dashboard.alertes_actions': 'Alertes & Actions requises',
    'dashboard.no_alerts': 'Aucune alerte en attente',
    'dashboard.planning_jour': 'Planning du jour',
    'dashboard.voir_planning': 'Voir planning',
    'dashboard.no_affectations': "Aucune affectation pour aujourd'hui",
    'dashboard.voir_alertes': 'Voir toutes les alertes',
    'dashboard.error': 'Impossible de charger le tableau de bord. Veuillez rafraichir la page.',

    // Personnel
    'personnel.title': 'Personnel',
    'personnel.subtitle': 'Gestion des employes Samsic Luxembourg',
    'personnel.search': 'Rechercher par nom, prenom, email...',
    'personnel.all_statuses': 'Tous les statuts',
    'personnel.actif': 'Actif',
    'personnel.inactif': 'Inactif',
    'personnel.en_formation': 'En formation',
    'personnel.all_languages': 'Toutes les langues',
    'personnel.francais': 'Francais',
    'personnel.anglais': 'Anglais',
    'personnel.allemand': 'Allemand',
    'personnel.luxembourgeois': 'Luxembourgeois',
    'personnel.portugais': 'Portugais',
    'personnel.employes': 'employes',
    'personnel.no_results': 'Aucun employe trouve avec ces criteres.',
    'personnel.temps_plein': 'Temps plein',
    'personnel.mi_temps': 'Mi-temps',
    'personnel.back': 'Retour au personnel',
    'personnel.contrat': 'Contrat',
    'personnel.horaires': 'Horaires',
    'personnel.anciennete': 'Anciennete',
    'personnel.contact': 'Contact',
    'personnel.langues': 'Langues',
    'personnel.competences': 'Competences',
    'personnel.formations_certifications': 'Formations & Certifications',
    'personnel.obtenue_le': 'Obtenue le',
    'personnel.expire_le': 'Expire le',
    'personnel.valide': 'Valide',
    'personnel.expiree': 'Expiree',
    'personnel.clients_compatibles': 'Clients compatibles (IA)',
    'personnel.planifiees': 'planifiees',
    'personnel.not_found': 'Employe non trouve',
    'personnel.error_loading': 'Impossible de charger la liste du personnel.',
    'personnel.error_api': 'Erreur API',
    'personnel.anciennete_an': '{n} an',
    'personnel.anciennete_ans': '{n} ans',
    'personnel.anciennete_ans_mois': '{n} ans et {m} mois',
    'personnel.anciennete_an_mois': '{n} an et {m} mois',
    'personnel.anciennete_mois': '{n} mois',

    // Clients
    'clients.title': 'Clients',
    'clients.subtitle': 'Sites clients geres par Samsic Luxembourg',
    'clients.search': 'Rechercher par nom ou adresse...',
    'clients.all_priorities': 'Toutes les priorites',
    'clients.haute': 'Haute',
    'clients.moyenne': 'Moyenne',
    'clients.basse': 'Basse',
    'clients.no_results': 'Aucun client trouve avec ces criteres.',
    'clients.langues_requises': 'Langues requises',
    'clients.non_assigne': 'Non assigne',
    'clients.error_loading': 'Impossible de charger la liste des clients.',
    'clients.error_api': 'Erreur API',

    // Planning
    'planning.title': 'Planning',
    'planning.semaine_du': 'Semaine du',
    'planning.auto_remplir': 'Auto-remplir',
    'planning.sem_prec': 'Sem. prec.',
    'planning.aujourdhui': "Aujourd'hui",
    'planning.sem_suiv': 'Sem. suiv.',
    'planning.client': 'Client',
    'planning.legende': 'Legende :',
    'planning.titulaire': 'Titulaire',
    'planning.en_formation': 'En formation',
    'planning.stand_by': 'Stand-by',
    'planning.remplacement': 'Remplacement',
    'planning.absent': 'Absent',
    'planning.error': 'Impossible de charger le planning. Veuillez reessayer.',
    'planning.suggestion_ia': 'Suggestion : voir IA',
    'planning.lundi': 'Lundi',
    'planning.mardi': 'Mardi',
    'planning.mercredi': 'Mercredi',
    'planning.jeudi': 'Jeudi',
    'planning.vendredi': 'Vendredi',

    // Matching
    'matching.title': 'IA Matching',
    'matching.subtitle': 'Suggestions intelligentes de remplacement',
    'matching.back': 'Retour au planning',
    'matching.absence_signalee': 'Absence signalee',
    'matching.date': 'Date',
    'matching.client': 'Client',
    'matching.exigences': 'Exigences du poste',
    'matching.langues_requises': 'Langues requises',
    'matching.competences': 'Competences',
    'matching.horaires': 'Horaires',
    'matching.certifications': 'Certifications',
    'matching.suggestions': 'Suggestions IA',
    'matching.disponibles': 'disponibles',
    'matching.recommande': 'RECOMMANDE',
    'matching.valide': 'VALIDE',
    'matching.standby_client': 'Stand-by du client',
    'matching.disponible': 'Disponible',
    'matching.valider': 'Valider',
    'matching.validation': 'Validation...',
    'matching.no_candidates': 'Aucun candidat disponible pour cette date et ce client.',
    'matching.exclus': 'Candidats exclus',
    'matching.exclu': 'Exclu',
    'matching.ia_analyse': "L'IA a analyse",
    'matching.profils_en': 'profils en',
    'matching.analyse_en_cours': 'Analyse IA en cours...',
    'matching.fermer': 'Fermer',
    'matching.error_loading': 'Impossible de charger les suggestions IA.',
    'matching.error_matching': 'Erreur lors du matching',
    'matching.error_validation': 'Erreur de validation',
    'matching.error_validation_generic': 'Erreur lors de la validation.',
    'matching.no_candidates_short': 'Aucun candidat disponible.',
    'matching.ai_insight': 'Analyse IA',
    'matching.ai_recommendation': 'Recommandation',
    'matching.ai_reasoning': 'Raisonnement',
    'matching.ai_risk': 'Evaluation des risques',
    'matching.ai_alternative': 'Strategie alternative',

    // Alertes
    'alertes.title': 'Alertes',
    'alertes.non_lues': 'alerte(s) non lue(s)',
    'alertes.toutes_lues': 'Toutes les alertes sont lues',
    'alertes.total': 'total',
    'alertes.all_priorities': 'Toutes les priorites',
    'alertes.urgent': 'Urgent',
    'alertes.moyen': 'Moyen',
    'alertes.info': 'Info',
    'alertes.no_results': 'Aucune alerte trouvee.',
    'alertes.action': 'Action',
    'alertes.marquer_lu': 'Marquer lu',
    'alertes.lu': 'Lu',
    'alertes.a_linstant': "A l'instant",
    'alertes.il_y_a_min': 'Il y a {n} min',
    'alertes.il_y_a_h': 'Il y a {n}h',
    'alertes.hier': 'Hier',
    'alertes.il_y_a_jours': 'Il y a {n} jours',
    'alertes.error_loading': 'Impossible de charger les alertes.',

    // Formations
    'formations.title': 'Formations',
    'formations.subtitle': 'Suivi des certifications et formations du personnel',
    'formations.total': 'Total formations',
    'formations.expirees': 'Expirees',
    'formations.expirent_90': 'Expirent sous 90 jours',
    'formations.formations_expirees': 'Formations expirees',
    'formations.expirent_prochainement': 'Expirent prochainement',
    'formations.formations_valides': 'Formations valides',
    'formations.expiree_le': 'Expiree le',
    'formations.expire_le': 'Expire le',
    'formations.valide_jusquau': "Valide jusqu'au",

    // Parametres
    'parametres.title': 'Parametres',
    'parametres.subtitle': 'Configuration de la plateforme Samsic Planning',
    'parametres.notifications': 'Notifications',
    'parametres.email_alerts': 'Alertes par email',
    'parametres.email_alerts_desc': 'Recevoir les alertes urgentes par email',
    'parametres.push': 'Notifications push',
    'parametres.push_desc': 'Notifications en temps reel dans le navigateur',
    'parametres.resume': 'Resume quotidien',
    'parametres.resume_desc': 'Recevoir un resume chaque matin a 7h00',
    'parametres.moteur_ia': 'Moteur IA',
    'parametres.seuil': 'Seuil de compatibilite minimum',
    'parametres.seuil_desc': "Score minimum pour qu'un candidat apparaisse dans les suggestions",
    'parametres.auto_fill': 'Auto-remplissage du planning',
    'parametres.auto_fill_desc': 'Completer automatiquement les creneaux vides chaque lundi',
    'parametres.donnees': 'Donnees',
    'parametres.exporter': 'Exporter les donnees',
    'parametres.exporter_desc': 'Telecharger un export CSV complet',
    'parametres.exporter_btn': 'Exporter',
    'parametres.langue': "Langue de l'interface",

    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.error_unknown': 'Erreur inconnue',
    'common.error_api': 'Erreur API',
    'common.se_deconnecter': 'Se deconnecter',
    'common.responsable_planning': 'Responsable Planning',
    'common.couvert': 'Couvert',
    'common.non_couvert': 'Non couvert',
    'common.confirme': 'Confirme',
    'common.en_attente': 'En attente',
    'common.annule': 'Annule',
    'common.h_sem': 'h/sem',
    'common.search_placeholder': 'Rechercher dans Samsic...',

    // StatusBadge
    'status.actif': 'Actif',
    'status.inactif': 'Inactif',
    'status.en_formation': 'En formation',
    'status.titulaire': 'Titulaire',
    'status.formation': 'Formation',
    'status.stand_by': 'Stand-by',
    'status.absent': 'Absent',
    'status.remplacement': 'Remplacement',
    'status.couvert': 'Couvert',
    'status.non_couvert': 'Non couvert',
    'status.confirme': 'Confirme',
    'status.en_attente': 'En attente',
    'status.annule': 'Annule',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.personnel': 'Staff',
    'nav.clients': 'Clients',
    'nav.planning': 'Schedule',
    'nav.matching': 'AI Matching',
    'nav.alertes': 'Alerts',
    'nav.formations': 'Training',
    'nav.parametres': 'Settings',
    'nav.collapse': 'Collapse',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': "Overview of today's scheduling",
    'dashboard.clients_actifs': 'Active Clients',
    'dashboard.employes_actifs': 'Active Employees',
    'dashboard.absences_today': 'Absences Today',
    'dashboard.postes_non_couverts': 'Uncovered Posts',
    'dashboard.alertes_actions': 'Alerts & Required Actions',
    'dashboard.no_alerts': 'No pending alerts',
    'dashboard.planning_jour': "Today's Schedule",
    'dashboard.voir_planning': 'View schedule',
    'dashboard.no_affectations': 'No assignments for today',
    'dashboard.voir_alertes': 'View all alerts',
    'dashboard.error': 'Unable to load the dashboard. Please refresh the page.',

    // Personnel
    'personnel.title': 'Staff',
    'personnel.subtitle': 'Samsic Luxembourg Employee Management',
    'personnel.search': 'Search by name, first name, email...',
    'personnel.all_statuses': 'All statuses',
    'personnel.actif': 'Active',
    'personnel.inactif': 'Inactive',
    'personnel.en_formation': 'In training',
    'personnel.all_languages': 'All languages',
    'personnel.francais': 'French',
    'personnel.anglais': 'English',
    'personnel.allemand': 'German',
    'personnel.luxembourgeois': 'Luxembourgish',
    'personnel.portugais': 'Portuguese',
    'personnel.employes': 'employees',
    'personnel.no_results': 'No employees found matching these criteria.',
    'personnel.temps_plein': 'Full-time',
    'personnel.mi_temps': 'Part-time',
    'personnel.back': 'Back to staff',
    'personnel.contrat': 'Contract',
    'personnel.horaires': 'Schedule',
    'personnel.anciennete': 'Seniority',
    'personnel.contact': 'Contact',
    'personnel.langues': 'Languages',
    'personnel.competences': 'Skills',
    'personnel.formations_certifications': 'Training & Certifications',
    'personnel.obtenue_le': 'Obtained on',
    'personnel.expire_le': 'Expires on',
    'personnel.valide': 'Valid',
    'personnel.expiree': 'Expired',
    'personnel.clients_compatibles': 'Compatible Clients (AI)',
    'personnel.planifiees': 'scheduled',
    'personnel.not_found': 'Employee not found',
    'personnel.error_loading': 'Unable to load the staff list.',
    'personnel.error_api': 'API Error',
    'personnel.anciennete_an': '{n} year',
    'personnel.anciennete_ans': '{n} years',
    'personnel.anciennete_ans_mois': '{n} years and {m} months',
    'personnel.anciennete_an_mois': '{n} year and {m} months',
    'personnel.anciennete_mois': '{n} months',

    // Clients
    'clients.title': 'Clients',
    'clients.subtitle': 'Client sites managed by Samsic Luxembourg',
    'clients.search': 'Search by name or address...',
    'clients.all_priorities': 'All priorities',
    'clients.haute': 'High',
    'clients.moyenne': 'Medium',
    'clients.basse': 'Low',
    'clients.no_results': 'No clients found matching these criteria.',
    'clients.langues_requises': 'Required Languages',
    'clients.non_assigne': 'Unassigned',
    'clients.error_loading': 'Unable to load the client list.',
    'clients.error_api': 'API Error',

    // Planning
    'planning.title': 'Schedule',
    'planning.semaine_du': 'Week of',
    'planning.auto_remplir': 'Auto-fill',
    'planning.sem_prec': 'Prev. week',
    'planning.aujourdhui': 'Today',
    'planning.sem_suiv': 'Next week',
    'planning.client': 'Client',
    'planning.legende': 'Legend:',
    'planning.titulaire': 'Assigned',
    'planning.en_formation': 'In training',
    'planning.stand_by': 'Stand-by',
    'planning.remplacement': 'Replacement',
    'planning.absent': 'Absent',
    'planning.error': 'Unable to load the schedule. Please try again.',
    'planning.suggestion_ia': 'Suggestion: see AI',
    'planning.lundi': 'Monday',
    'planning.mardi': 'Tuesday',
    'planning.mercredi': 'Wednesday',
    'planning.jeudi': 'Thursday',
    'planning.vendredi': 'Friday',

    // Matching
    'matching.title': 'AI Matching',
    'matching.subtitle': 'Intelligent replacement suggestions',
    'matching.back': 'Back to schedule',
    'matching.absence_signalee': 'Absence reported',
    'matching.date': 'Date',
    'matching.client': 'Client',
    'matching.exigences': 'Position Requirements',
    'matching.langues_requises': 'Required Languages',
    'matching.competences': 'Skills',
    'matching.horaires': 'Schedule',
    'matching.certifications': 'Certifications',
    'matching.suggestions': 'AI Suggestions',
    'matching.disponibles': 'available',
    'matching.recommande': 'RECOMMENDED',
    'matching.valide': 'VALIDATED',
    'matching.standby_client': 'Client stand-by',
    'matching.disponible': 'Available',
    'matching.valider': 'Validate',
    'matching.validation': 'Validating...',
    'matching.no_candidates': 'No candidates available for this date and client.',
    'matching.exclus': 'Excluded candidates',
    'matching.exclu': 'Excluded',
    'matching.ia_analyse': 'AI analyzed',
    'matching.profils_en': 'profiles in',
    'matching.analyse_en_cours': 'AI analysis in progress...',
    'matching.fermer': 'Close',
    'matching.error_loading': 'Unable to load AI suggestions.',
    'matching.error_matching': 'Matching error',
    'matching.error_validation': 'Validation error',
    'matching.error_validation_generic': 'Error during validation.',
    'matching.no_candidates_short': 'No candidates available.',
    'matching.ai_insight': 'AI Analysis',
    'matching.ai_recommendation': 'Recommendation',
    'matching.ai_reasoning': 'Reasoning',
    'matching.ai_risk': 'Risk Assessment',
    'matching.ai_alternative': 'Alternative Strategy',

    // Alertes
    'alertes.title': 'Alerts',
    'alertes.non_lues': 'unread alert(s)',
    'alertes.toutes_lues': 'All alerts are read',
    'alertes.total': 'total',
    'alertes.all_priorities': 'All priorities',
    'alertes.urgent': 'Urgent',
    'alertes.moyen': 'Medium',
    'alertes.info': 'Info',
    'alertes.no_results': 'No alerts found.',
    'alertes.action': 'Action',
    'alertes.marquer_lu': 'Mark read',
    'alertes.lu': 'Read',
    'alertes.a_linstant': 'Just now',
    'alertes.il_y_a_min': '{n} min ago',
    'alertes.il_y_a_h': '{n}h ago',
    'alertes.hier': 'Yesterday',
    'alertes.il_y_a_jours': '{n} days ago',
    'alertes.error_loading': 'Unable to load alerts.',

    // Formations
    'formations.title': 'Training',
    'formations.subtitle': 'Staff certifications and training tracking',
    'formations.total': 'Total trainings',
    'formations.expirees': 'Expired',
    'formations.expirent_90': 'Expiring within 90 days',
    'formations.formations_expirees': 'Expired trainings',
    'formations.expirent_prochainement': 'Expiring soon',
    'formations.formations_valides': 'Valid trainings',
    'formations.expiree_le': 'Expired on',
    'formations.expire_le': 'Expires on',
    'formations.valide_jusquau': 'Valid until',

    // Parametres
    'parametres.title': 'Settings',
    'parametres.subtitle': 'Samsic Planning platform configuration',
    'parametres.notifications': 'Notifications',
    'parametres.email_alerts': 'Email alerts',
    'parametres.email_alerts_desc': 'Receive urgent alerts by email',
    'parametres.push': 'Push notifications',
    'parametres.push_desc': 'Real-time notifications in the browser',
    'parametres.resume': 'Daily summary',
    'parametres.resume_desc': 'Receive a summary every morning at 7:00 AM',
    'parametres.moteur_ia': 'AI Engine',
    'parametres.seuil': 'Minimum compatibility threshold',
    'parametres.seuil_desc': 'Minimum score for a candidate to appear in suggestions',
    'parametres.auto_fill': 'Schedule auto-fill',
    'parametres.auto_fill_desc': 'Automatically fill empty slots every Monday',
    'parametres.donnees': 'Data',
    'parametres.exporter': 'Export data',
    'parametres.exporter_desc': 'Download a complete CSV export',
    'parametres.exporter_btn': 'Export',
    'parametres.langue': 'Interface language',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.error_unknown': 'Unknown error',
    'common.error_api': 'API error',
    'common.se_deconnecter': 'Log out',
    'common.responsable_planning': 'Planning Manager',
    'common.couvert': 'Covered',
    'common.non_couvert': 'Uncovered',
    'common.confirme': 'Confirmed',
    'common.en_attente': 'Pending',
    'common.annule': 'Cancelled',
    'common.h_sem': 'h/wk',
    'common.search_placeholder': 'Search Samsic...',

    // StatusBadge
    'status.actif': 'Active',
    'status.inactif': 'Inactive',
    'status.en_formation': 'In training',
    'status.titulaire': 'Assigned',
    'status.formation': 'Training',
    'status.stand_by': 'Stand-by',
    'status.absent': 'Absent',
    'status.remplacement': 'Replacement',
    'status.couvert': 'Covered',
    'status.non_couvert': 'Uncovered',
    'status.confirme': 'Confirmed',
    'status.en_attente': 'Pending',
    'status.annule': 'Cancelled',
  },
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const LanguageContext = createContext<LanguageContextType>({
  locale: 'fr',
  setLocale: () => {},
});

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>('fr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('samsic-locale') as Locale | null;
    if (stored === 'fr' || stored === 'en') {
      setLocaleState(stored);
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('samsic-locale', newLocale);
    // Update html lang attribute dynamically
    document.documentElement.lang = newLocale;
  }, []);

  // Update html lang on mount to match persisted locale
  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale;
    }
  }, [locale, mounted]);

  return React.createElement(
    LanguageContext.Provider,
    { value: { locale, setLocale } },
    children
  );
}

export function useTranslation() {
  const { locale, setLocale } = useContext(LanguageContext);

  const t = useCallback(
    (key: string): string => {
      return translations[locale]?.[key] ?? translations.fr[key] ?? key;
    },
    [locale]
  );

  return { t, locale, setLocale };
}

/**
 * Returns the locale string for date formatting.
 * fr -> 'fr-FR', en -> 'en-GB'
 */
export function getDateLocale(locale: Locale): string {
  return locale === 'fr' ? 'fr-FR' : 'en-GB';
}
