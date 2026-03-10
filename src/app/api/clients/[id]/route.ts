import { NextResponse } from 'next/server';
import { getClientById, getEmployeeById, updateClient } from '@/lib/store';
import { errorResponse, parseBody } from '@/lib/api-utils';
import type { Client } from '@/lib/types';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Resolve an array of employee IDs into full employee objects.
 * Skips IDs that no longer exist in the store.
 */
function resolveEmployeeIds(ids: string[]) {
  return ids
    .map((id) => getEmployeeById(id))
    .filter((e) => e !== undefined);
}

/**
 * GET /api/clients/:id
 * Retrieve a single client with resolved titulaires, stand_by, and en_formation employees.
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const client = getClientById(id);

    if (!client) {
      return errorResponse(404, 'NOT_FOUND', `Client avec l'id '${id}' introuvable`);
    }

    // Resolve employee IDs to full objects for the response
    const resolved = {
      ...client,
      titulaires_details: resolveEmployeeIds(client.titulaires),
      stand_by_details: resolveEmployeeIds(client.stand_by),
      en_formation_details: resolveEmployeeIds(client.en_formation),
    };

    return NextResponse.json({ data: resolved });
  } catch (error) {
    console.error('[GET /api/clients/:id] Unexpected error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Erreur interne du serveur');
  }
}

/**
 * PATCH /api/clients/:id
 * Partially update a client.
 */
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { data, error } = await parseBody<Partial<Client>>(request);
    if (error) return error;

    const updated = updateClient(id, data);
    if (!updated) {
      return errorResponse(404, 'NOT_FOUND', `Client avec l'id '${id}' introuvable`);
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('[PATCH /api/clients/:id] Unexpected error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Erreur interne du serveur');
  }
}
