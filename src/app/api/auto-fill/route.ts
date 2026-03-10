import { NextResponse } from 'next/server';
import { startOfWeek, addDays, format } from 'date-fns';
import { getClients, getAffectations, getAbsences } from '@/lib/store';
import { findReplacementsForSlot } from '@/lib/matching-engine';
import { errorResponse, parseBody } from '@/lib/api-utils';

interface AutoFillRequest {
  week: string; // YYYY-MM-DD
}

/**
 * Find all uncovered slots for a given week.
 * A slot is uncovered when:
 *   - There is an absence (ouverte/non_couverte) at a client on a given date, AND
 *   - There is no confirmed replacement affectation for that client/date
 */
function findUncoveredSlots(monday: Date): { client_id: string; date: string }[] {
  const uncovered: { client_id: string; date: string }[] = [];
  const clients = getClients();

  for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
    const date = format(addDays(monday, dayOffset), 'yyyy-MM-dd');

    for (const client of clients) {
      // Check if there's an open absence for this client on this date
      const dayAbsences = getAbsences({ client_id: client.id, date });
      const hasOpenAbsence = dayAbsences.some(
        (a) => a.statut === 'ouverte' || a.statut === 'non_couverte'
      );

      if (!hasOpenAbsence) continue;

      // Check if there's already a confirmed replacement
      const dayAffectations = getAffectations({ client_id: client.id, date });
      const hasReplacement = dayAffectations.some(
        (a) => a.type === 'remplacement' && a.statut !== 'annule'
      );

      if (!hasReplacement) {
        uncovered.push({ client_id: client.id, date });
      }
    }
  }

  return uncovered;
}

/**
 * POST /api/auto-fill
 * For each uncovered slot in the specified week, runs the matching engine
 * and suggests the best available replacement.
 *
 * Body: { week: "YYYY-MM-DD" }
 * Returns: { suggestions: [{ client_id, date, candidate }] }
 */
export async function POST(request: Request) {
  try {
    const { data, error } = await parseBody<AutoFillRequest>(request);
    if (error) return error;

    if (!data.week) {
      return errorResponse(400, 'VALIDATION_ERROR', 'Le champ "week" (YYYY-MM-DD) est obligatoire');
    }

    const targetDate = new Date(data.week);
    if (isNaN(targetDate.getTime())) {
      return errorResponse(400, 'VALIDATION_ERROR', `Date invalide: '${data.week}'`);
    }

    const monday = startOfWeek(targetDate, { weekStartsOn: 1 });
    const uncoveredSlots = findUncoveredSlots(monday);

    const suggestions: {
      client_id: string;
      date: string;
      candidate: NonNullable<ReturnType<typeof findReplacementsForSlot>>['candidates'][0];
    }[] = [];

    for (const slot of uncoveredSlots) {
      const result = findReplacementsForSlot(slot.client_id, slot.date);
      if (!result || result.candidates.length === 0) continue;

      // Pick the top available candidate
      const bestCandidate = result.candidates.find((c) => c.is_available);
      if (bestCandidate) {
        suggestions.push({
          client_id: slot.client_id,
          date: slot.date,
          candidate: bestCandidate,
        });
      }
    }

    return NextResponse.json({
      data: {
        week_start: format(monday, 'yyyy-MM-dd'),
        week_end: format(addDays(monday, 4), 'yyyy-MM-dd'),
        total_uncovered: uncoveredSlots.length,
        total_suggestions: suggestions.length,
        suggestions,
      },
    });
  } catch (error) {
    console.error('[POST /api/auto-fill] Unexpected error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Erreur interne du serveur');
  }
}
