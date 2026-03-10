import { NextResponse } from 'next/server';
import { getAbsenceById, updateAbsence } from '@/lib/store';
import { errorResponse, parseBody } from '@/lib/api-utils';
import type { Absence } from '@/lib/types';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/absences/:id
 * Retrieve a single absence by ID.
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const absence = getAbsenceById(id);

    if (!absence) {
      return errorResponse(404, 'NOT_FOUND', `Absence avec l'id '${id}' introuvable`);
    }

    return NextResponse.json({ data: absence });
  } catch (error) {
    console.error('[GET /api/absences/:id] Unexpected error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Erreur interne du serveur');
  }
}

/**
 * PATCH /api/absences/:id
 * Update an absence (mark as covered, change status, etc.).
 */
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { data, error } = await parseBody<Partial<Absence>>(request);
    if (error) return error;

    const updated = updateAbsence(id, data);
    if (!updated) {
      return errorResponse(404, 'NOT_FOUND', `Absence avec l'id '${id}' introuvable`);
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('[PATCH /api/absences/:id] Unexpected error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Erreur interne du serveur');
  }
}
