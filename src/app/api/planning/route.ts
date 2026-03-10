import { NextResponse } from 'next/server';
import { startOfWeek, addDays, format } from 'date-fns';
import { ensureInitialized, getClients, getAffectations, getEmployeeById, getAbsences } from '@/lib/store';
import { errorResponse, getSearchParams } from '@/lib/api-utils';
import type { DayStatus } from '@/lib/types';

const DAY_NAMES = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'] as const;

/**
 * Determine the display status for a single day/client cell in the planning grid.
 * Priority order:
 *   1. If there is an open absence AND a confirmed replacement -> remplacement
 *   2. If there is an open absence with no replacement -> absent (the titulaire row shows red)
 *   3. If there is no active affectation at all -> non_couvert
 *   4. Otherwise map the affectation type directly
 */
function determineDayStatus(
  clientId: string,
  date: string
): DayStatus {
  const dayAffectations = getAffectations({ client_id: clientId, date });
  const activeAffectations = dayAffectations.filter((a) => a.statut !== 'annule');

  const dayAbsences = getAbsences({ client_id: clientId, date });
  const hasOpenAbsence = dayAbsences.some(
    (a) => a.statut === 'ouverte' || a.statut === 'non_couverte'
  );

  if (hasOpenAbsence) {
    // Check if a replacement has been assigned
    const hasReplacement = activeAffectations.some((a) => a.type === 'remplacement');
    return hasReplacement ? 'remplacement' : 'absent';
  }

  // No absence -- find the most relevant affectation
  const activeAffectation = activeAffectations[0] || null;

  if (!activeAffectation) {
    return 'non_couvert';
  }

  const typeToStatus: Record<string, DayStatus> = {
    titulaire: 'titulaire',
    formation: 'formation',
    stand_by: 'stand_by',
    remplacement: 'remplacement',
  };

  return typeToStatus[activeAffectation.type] || 'titulaire';
}

/**
 * GET /api/planning
 * Returns a weekly planning matrix.
 * Query: ?week=YYYY-MM-DD (any date in the target week)
 * If ?week is omitted, defaults to the current week.
 * Returns Mon-Fri grid with client rows and day columns.
 */
export async function GET(request: Request) {
  try {
    ensureInitialized();

    const params = getSearchParams(request);
    const weekParam = params.get('week');

    // Default to current week if no week param provided
    const targetDate = weekParam ? new Date(weekParam) : new Date();
    if (isNaN(targetDate.getTime())) {
      return errorResponse(400, 'VALIDATION_ERROR', `Date invalide: '${weekParam}'`);
    }

    const monday = startOfWeek(targetDate, { weekStartsOn: 1 });
    const friday = addDays(monday, 4);
    const allClients = getClients();

    const planning = allClients.map((client) => {
      const days = DAY_NAMES.map((dayName, index) => {
        const date = format(addDays(monday, index), 'yyyy-MM-dd');

        const dayAffectations = getAffectations({ client_id: client.id, date });
        const activeAffectation = dayAffectations.find((a) => a.statut !== 'annule') || null;

        const employee = activeAffectation
          ? getEmployeeById(activeAffectation.employe_id) || null
          : null;

        const status = determineDayStatus(client.id, date);

        return {
          date,
          day_name: dayName,
          affectation: activeAffectation,
          employee,
          status,
        };
      });

      return { client, days };
    });

    return NextResponse.json({
      data: {
        week_start: format(monday, 'yyyy-MM-dd'),
        week_end: format(friday, 'yyyy-MM-dd'),
        planning,
      },
    });
  } catch (error) {
    console.error('[GET /api/planning] Unexpected error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Erreur interne du serveur');
  }
}
