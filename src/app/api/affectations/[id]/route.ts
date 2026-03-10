import { NextResponse } from 'next/server';
import { ensureInitialized, getAffectationById, updateAffectation } from '@/lib/store';
import { errorResponse, parseBody } from '@/lib/api-utils';
import type { Affectation } from '@/lib/types';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * PATCH /api/affectations/:id
 * Update an affectation (change status, type, etc.).
 */
export async function PATCH(request: Request, context: RouteContext) {
  try {
    ensureInitialized();
    const { id } = await context.params;
    const { data, error } = await parseBody<Partial<Affectation>>(request);
    if (error) return error;

    const updated = updateAffectation(id, data);
    if (!updated) {
      return errorResponse(404, 'NOT_FOUND', `Affectation avec l'id '${id}' introuvable`);
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('[PATCH /api/affectations/:id] Unexpected error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Erreur interne du serveur');
  }
}
