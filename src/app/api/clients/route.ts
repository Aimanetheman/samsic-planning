import { NextResponse } from 'next/server';
import { ensureInitialized, getClients, createClient } from '@/lib/store';
import { errorResponse, parseBody, getSearchParams } from '@/lib/api-utils';
import type { Client } from '@/lib/types';

/**
 * GET /api/clients
 * List all clients with optional filters: ?search=, ?priority=
 */
export async function GET(request: Request) {
  try {
    ensureInitialized();
    const params = getSearchParams(request);
    const search = params.get('search')?.toLowerCase();
    const priority = params.get('priority');

    let clientsList = getClients();

    if (search) {
      clientsList = clientsList.filter(
        (c) =>
          c.nom.toLowerCase().includes(search) ||
          c.adresse.toLowerCase().includes(search)
      );
    }

    if (priority) {
      clientsList = clientsList.filter((c) => c.priorite === priority);
    }

    return NextResponse.json({ data: clientsList, total: clientsList.length });
  } catch (error) {
    console.error('[GET /api/clients] Unexpected error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Erreur interne du serveur');
  }
}

/**
 * POST /api/clients
 * Create a new client.
 */
export async function POST(request: Request) {
  try {
    ensureInitialized();
    const { data, error } = await parseBody<Omit<Client, 'id'>>(request);
    if (error) return error;

    const missing: Record<string, string[]> = {};
    if (!data.nom) missing.nom = ['Le nom est obligatoire'];
    if (!data.adresse) missing.adresse = ["L'adresse est obligatoire"];

    if (Object.keys(missing).length > 0) {
      return errorResponse(400, 'VALIDATION_ERROR', 'Champs obligatoires manquants', missing);
    }

    const client = createClient(data);
    return NextResponse.json({ data: client }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/clients] Unexpected error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Erreur interne du serveur');
  }
}
