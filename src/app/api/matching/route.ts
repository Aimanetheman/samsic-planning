import { NextResponse } from 'next/server';
import { findReplacementsWithMeta, findReplacementsForSlot } from '@/lib/matching-engine';
import { errorResponse, parseBody } from '@/lib/api-utils';

interface MatchByAbsence {
  absence_id: string;
}

interface MatchBySlot {
  client_id: string;
  date: string;
}

type MatchRequest = MatchByAbsence | MatchBySlot;

function isMatchByAbsence(body: MatchRequest): body is MatchByAbsence {
  return 'absence_id' in body && typeof (body as MatchByAbsence).absence_id === 'string';
}

function isMatchBySlot(body: MatchRequest): body is MatchBySlot {
  return 'client_id' in body && 'date' in body;
}

/**
 * POST /api/matching
 * Find replacement candidates.
 * Accepts either { absence_id } or { client_id, date }.
 * Returns ranked candidates with scoring breakdown and analysis metadata.
 */
export async function POST(request: Request) {
  try {
    const { data, error } = await parseBody<MatchRequest>(request);
    if (error) return error;

    if (isMatchByAbsence(data)) {
      const result = findReplacementsWithMeta(data.absence_id);
      if (!result) {
        return errorResponse(
          404,
          'NOT_FOUND',
          `Absence '${data.absence_id}' introuvable ou client associe introuvable`
        );
      }
      return NextResponse.json({ data: result });
    }

    if (isMatchBySlot(data)) {
      if (!data.client_id || !data.date) {
        return errorResponse(
          400,
          'VALIDATION_ERROR',
          'client_id et date sont obligatoires pour la recherche par creneau'
        );
      }

      const result = findReplacementsForSlot(data.client_id, data.date);
      if (!result) {
        return errorResponse(404, 'NOT_FOUND', `Client '${data.client_id}' introuvable`);
      }
      return NextResponse.json({ data: result });
    }

    return errorResponse(
      400,
      'VALIDATION_ERROR',
      'Le corps doit contenir soit { absence_id } soit { client_id, date }'
    );
  } catch (error) {
    console.error('[POST /api/matching] Unexpected error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Erreur interne du serveur');
  }
}
