import { NextResponse } from 'next/server';
import { startOfWeek, parseISO, addDays, format, isWithinInterval } from 'date-fns';
import { getAffectations, getClientById, getEmployeeById, createAffectation } from '@/lib/store';
import { errorResponse, parseBody, getSearchParams } from '@/lib/api-utils';
import type { Affectation } from '@/lib/types';

/**
 * GET /api/affectations
 * List affectations with filters:
 *   ?date=YYYY-MM-DD       - single date
 *   ?week=YYYY-MM-DD       - full Mon-Fri week containing that date
 *   ?client_id=             - filter by client
 *   ?employe_id=            - filter by employee
 */
export async function GET(request: Request) {
  try {
    const params = getSearchParams(request);
    const date = params.get('date');
    const week = params.get('week');
    const clientId = params.get('client_id');
    const employeId = params.get('employe_id');

    // Use store-level filters for simple cases
    let affectations = getAffectations({
      ...(date && { date }),
      ...(clientId && { client_id: clientId }),
      ...(employeId && { employe_id: employeId }),
    });

    // Week filter requires date range logic not supported by the store filter
    if (week) {
      const weekDate = parseISO(week);
      const monday = startOfWeek(weekDate, { weekStartsOn: 1 });
      const friday = addDays(monday, 4);

      affectations = affectations.filter((a) => {
        const d = parseISO(a.date);
        return isWithinInterval(d, { start: monday, end: friday });
      });
    }

    return NextResponse.json({ data: affectations, total: affectations.length });
  } catch (error) {
    console.error('[GET /api/affectations] Unexpected error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Erreur interne du serveur');
  }
}

/**
 * POST /api/affectations
 * Create a new affectation (assignment).
 */
export async function POST(request: Request) {
  try {
    const { data, error } = await parseBody<Omit<Affectation, 'id' | 'created_at'>>(request);
    if (error) return error;

    const missing: Record<string, string[]> = {};
    if (!data.employe_id) missing.employe_id = ["L'employe_id est obligatoire"];
    if (!data.client_id) missing.client_id = ['Le client_id est obligatoire'];
    if (!data.date) missing.date = ['La date est obligatoire'];
    if (!data.type) missing.type = ['Le type est obligatoire'];

    if (Object.keys(missing).length > 0) {
      return errorResponse(400, 'VALIDATION_ERROR', 'Champs obligatoires manquants', missing);
    }

    if (!getEmployeeById(data.employe_id)) {
      return errorResponse(404, 'NOT_FOUND', `Employe '${data.employe_id}' introuvable`);
    }
    if (!getClientById(data.client_id)) {
      return errorResponse(404, 'NOT_FOUND', `Client '${data.client_id}' introuvable`);
    }

    // Check for scheduling conflict on the same date
    const conflict = getAffectations({ employe_id: data.employe_id, date: data.date }).find(
      (a) => a.statut !== 'annule'
    );
    if (conflict) {
      return errorResponse(
        409,
        'CONFLICT',
        `L'employe est deja affecte le ${data.date} (affectation ${conflict.id})`
      );
    }

    const affectation = createAffectation({
      ...data,
      statut: data.statut || 'en_attente',
    });

    return NextResponse.json({ data: affectation }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/affectations] Unexpected error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Erreur interne du serveur');
  }
}
