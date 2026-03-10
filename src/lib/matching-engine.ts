// ============================================================
// Matching Engine for Samsic Planning IA
// Scores and ranks available employees for replacement assignments.
//
// Scoring weights (from CDC):
//   - Languages:     35 pts (all required languages meet minimum level)
//   - Competences:   25 pts (coverage of required skills)
//   - Availability:  20 pts (not assigned elsewhere, within hours, not on leave)
//   - Experience:    10 pts (bonus if worked at this client before)
//   - Stand-by:      10 pts (priority to designated stand-by)
//
// Hard exclusion rules:
//   - Already assigned elsewhere on the same date
//   - On leave/sick/unavailable on that date
//   - Would exceed weekly contract hours
//   - Inactive status
//   - Required certification missing or expired
// ============================================================

import type { MatchCandidate, Employee, Client } from './types';
import {
  getEmployees,
  getAbsenceById,
  getClientById,
  getAffectations,
  getAbsences,
} from './store';

// --- Language level ranking ---

const LANGUAGE_LEVELS = ['notions', 'intermediaire', 'courant', 'natif'] as const;

function languageLevelIndex(level: string): number {
  return LANGUAGE_LEVELS.indexOf(level as typeof LANGUAGE_LEVELS[number]);
}

// --- Exclusion checks (hard filters) ---

interface ExclusionResult {
  excluded: boolean;
  reasons: string[];
}

function checkExclusions(employee: Employee, client: Client, date: string): ExclusionResult {
  const reasons: string[] = [];

  // 1. Inactive status
  if (employee.statut !== 'actif') {
    reasons.push(`Statut inactif (${employee.statut})`);
  }

  // 2. Already assigned elsewhere on the same date (non-cancelled)
  const dayAffectations = getAffectations({ employe_id: employee.id, date });
  const hasConflict = dayAffectations.some((a) => a.statut !== 'annule');
  if (hasConflict) {
    reasons.push('Deja affecte(e) a un autre poste ce jour');
  }

  // 3. On leave/sick on that date
  const dayAbsences = getAbsences({ employe_id: employee.id, date });
  const isAbsent = dayAbsences.some(
    (a) => a.statut === 'ouverte' || a.statut === 'non_couverte'
  );
  if (isAbsent) {
    reasons.push('En absence ce jour (maladie/conge)');
  }

  // 4. Would exceed weekly contract hours (assume 8h per day assignment)
  const hoursPerDay = 8;
  if (employee.heures_planifiees_semaine + hoursPerDay > employee.heures_hebdo) {
    reasons.push(
      `Depassement heures hebdo (${employee.heures_planifiees_semaine}/${employee.heures_hebdo}h)`
    );
  }

  // 5. Required certifications missing or expired
  if (client.certifications_requises.length > 0) {
    for (const certName of client.certifications_requises) {
      const formation = employee.formations.find((f) => f.name === certName);
      if (!formation) {
        reasons.push(`Certification manquante: ${certName}`);
      } else if (!formation.is_valid) {
        reasons.push(`Certification expiree: ${certName}`);
      } else if (formation.date_expiry) {
        // Also check actual expiry date against the assignment date
        const expiryDate = new Date(formation.date_expiry);
        const assignDate = new Date(date);
        if (expiryDate < assignDate) {
          reasons.push(`Certification expiree le ${formation.date_expiry}: ${certName}`);
        }
      }
    }
  }

  return {
    excluded: reasons.length > 0,
    reasons,
  };
}

// --- Scoring functions ---

function scoreLanguages(
  employee: Employee,
  client: Client
): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  if (client.langues_requises.length === 0) {
    return { score: 35, reasons: ['Aucune langue requise'] };
  }

  let totalScore = 0;
  const perLang = 35 / client.langues_requises.length;

  for (const req of client.langues_requises) {
    const match = employee.langues.find((l) => l.language === req.language);

    if (!match) {
      reasons.push(`Langue manquante: ${req.language}`);
      continue;
    }

    const empLevel = languageLevelIndex(match.level);
    const reqLevel = languageLevelIndex(req.minimum_level);

    if (empLevel >= reqLevel) {
      totalScore += perLang;
      reasons.push(`${req.language}: ${match.level} (requis: ${req.minimum_level})`);
    } else {
      // Partial score proportional to how close they are
      const partialRatio = reqLevel > 0 ? empLevel / reqLevel : 0;
      totalScore += perLang * partialRatio;
      reasons.push(
        `${req.language}: niveau insuffisant (${match.level} < ${req.minimum_level})`
      );
    }
  }

  return { score: Math.round(totalScore * 10) / 10, reasons };
}

function scoreCompetences(
  employee: Employee,
  client: Client
): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  if (client.competences_requises.length === 0) {
    return { score: 25, reasons: ['Aucune competence requise'] };
  }

  const empSkills = new Set(employee.competences.map((c) => c.skill));
  let matched = 0;

  for (const req of client.competences_requises) {
    if (empSkills.has(req)) {
      matched++;
      reasons.push(`Competence: ${req}`);
    } else {
      reasons.push(`Competence manquante: ${req}`);
    }
  }

  const score = Math.round((matched / client.competences_requises.length) * 25 * 10) / 10;
  return { score, reasons };
}

function scoreAvailability(
  employee: Employee,
  date: string
): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  // Check schedule conflicts (non-cancelled assignments on this date)
  const dayAffectations = getAffectations({ employe_id: employee.id, date });
  const hasConflict = dayAffectations.some((a) => a.statut !== 'annule');

  if (hasConflict) {
    reasons.push('Deja affecte(e) ce jour');
    return { score: 0, reasons };
  }

  // Check absences on this date
  const dayAbsences = getAbsences({ employe_id: employee.id, date });
  const isAbsent = dayAbsences.some(
    (a) => a.statut === 'ouverte' || a.statut === 'non_couverte'
  );

  if (isAbsent) {
    reasons.push('En absence ce jour');
    return { score: 0, reasons };
  }

  // Check remaining weekly capacity
  const hoursPerDay = 8;
  const remainingHours = employee.heures_hebdo - employee.heures_planifiees_semaine;

  if (remainingHours < hoursPerDay) {
    reasons.push(
      `Capacite limitee: ${remainingHours}h restantes sur ${employee.heures_hebdo}h hebdo`
    );
    // Give partial score based on remaining capacity
    const ratio = Math.max(remainingHours / hoursPerDay, 0);
    return { score: Math.round(ratio * 20 * 10) / 10, reasons };
  }

  reasons.push(`Disponible (${remainingHours}h restantes sur ${employee.heures_hebdo}h)`);
  return { score: 20, reasons };
}

function scoreExperience(
  employee: Employee,
  client: Client
): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  // Check if employee has previous affectations at this client
  const allAffectations = getAffectations({ employe_id: employee.id, client_id: client.id });
  const previousAssignments = allAffectations.filter((a) => a.statut !== 'annule');

  if (previousAssignments.length > 0) {
    // Bonus for having worked at this client before
    const expScore = Math.min(previousAssignments.length * 2, 7);
    reasons.push(`Experience sur ce site: ${previousAssignments.length} affectation(s)`);

    // Additional bonus for seniority
    const seniorityBonus = Math.min(Math.round(employee.anciennete_mois / 12), 3);
    reasons.push(`Anciennete: ${employee.anciennete_mois} mois`);

    return { score: Math.min(expScore + seniorityBonus, 10), reasons };
  }

  // No site experience - score based on general seniority only
  const seniorityScore = Math.min(Math.round((employee.anciennete_mois / 24) * 5), 5);
  reasons.push(`Anciennete generale: ${employee.anciennete_mois} mois (pas d'experience sur ce site)`);

  return { score: seniorityScore, reasons };
}

function scoreStandby(
  employee: Employee,
  client: Client
): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  if (client.stand_by.includes(employee.id)) {
    reasons.push('Employe(e) stand-by designe(e) pour ce client');
    return { score: 10, reasons };
  }

  if (client.en_formation.includes(employee.id)) {
    reasons.push('Employe(e) en formation pour ce client');
    return { score: 5, reasons };
  }

  return { score: 0, reasons: [] };
}

// --- Main matching function ---

function rankCandidates(client: Client, date: string): MatchCandidate[] {
  const allEmployees = getEmployees();
  const candidates: MatchCandidate[] = [];

  for (const emp of allEmployees) {
    // Skip titulaires of this client (they are the ones being replaced)
    if (client.titulaires.includes(emp.id)) continue;

    // Run hard exclusion checks
    const exclusion = checkExclusions(emp, client, date);

    // Calculate scores (even for excluded candidates, for transparency)
    const lang = scoreLanguages(emp, client);
    const comp = scoreCompetences(emp, client);
    const avail = scoreAvailability(emp, date);
    const exp = scoreExperience(emp, client);
    const sb = scoreStandby(emp, client);

    const totalScore = exclusion.excluded
      ? 0
      : Math.round((lang.score + comp.score + avail.score + exp.score + sb.score) * 10) / 10;

    const positiveReasons = [
      ...lang.reasons,
      ...comp.reasons,
      ...avail.reasons,
      ...exp.reasons,
      ...sb.reasons,
    ].filter(
      (r) =>
        !r.startsWith('Competence manquante') &&
        !r.startsWith('Langue manquante')
    );

    const negativeReasons = [
      ...lang.reasons,
      ...comp.reasons,
    ].filter(
      (r) =>
        r.startsWith('Competence manquante') || r.startsWith('Langue manquante')
    );

    candidates.push({
      employe_id: emp.id,
      employe_nom: emp.nom,
      employe_prenom: emp.prenom,
      score_total: totalScore,
      score_langues: lang.score,
      score_competences: comp.score,
      score_disponibilite: avail.score,
      score_experience: exp.score,
      score_standby: sb.score,
      raisons: positiveReasons,
      exclusion_raisons: exclusion.excluded
        ? [...exclusion.reasons, ...negativeReasons]
        : negativeReasons.length > 0
          ? negativeReasons
          : undefined,
      is_standby: client.stand_by.includes(emp.id),
      is_available: !exclusion.excluded && avail.score > 0,
    });
  }

  // Sort: available first, then by score descending
  candidates.sort((a, b) => {
    if (a.is_available && !b.is_available) return -1;
    if (!a.is_available && b.is_available) return 1;
    return b.score_total - a.score_total;
  });

  return candidates;
}

// --- Public API ---

/**
 * Find replacement candidates for a given absence.
 * Returns ranked candidates with detailed scoring breakdown.
 */
export function findReplacements(absenceId: string): MatchCandidate[] {
  const absence = getAbsenceById(absenceId);
  if (!absence) return [];

  const client = getClientById(absence.client_id);
  if (!client) return [];

  return rankCandidates(client, absence.date);
}

/**
 * Extended version that also returns analysis metadata.
 * Used by the API layer for richer responses.
 */
export function findReplacementsWithMeta(absenceId: string): {
  candidates: MatchCandidate[];
  analysis_time_ms: number;
  total_analyzed: number;
} | null {
  const start = performance.now();
  const absence = getAbsenceById(absenceId);
  if (!absence) return null;

  const client = getClientById(absence.client_id);
  if (!client) return null;

  const candidates = rankCandidates(client, absence.date);
  const elapsed = Math.round(performance.now() - start);

  return {
    candidates,
    analysis_time_ms: elapsed,
    total_analyzed: candidates.length,
  };
}

/**
 * Find replacement candidates for a specific client/date slot.
 * Used for manual planning and auto-fill scenarios.
 */
export function findReplacementsForSlot(clientId: string, date: string): {
  candidates: MatchCandidate[];
  analysis_time_ms: number;
  total_analyzed: number;
} | null {
  const start = performance.now();
  const client = getClientById(clientId);
  if (!client) return null;

  const candidates = rankCandidates(client, date);
  const elapsed = Math.round(performance.now() - start);

  return {
    candidates,
    analysis_time_ms: elapsed,
    total_analyzed: candidates.length,
  };
}
