import { NextResponse } from 'next/server';
import {
  getAbsences,
  getClientById,
  getEmployeeById,
  createAbsence,
  createAlert,
} from '@/lib/store';
import { errorResponse, parseBody, getSearchParams } from '@/lib/api-utils';
import type { Absence, AbsenceStatus } from '@/lib/types';

/**
 * GET /api/absences
 * List absences with optional filters: ?status=, ?date=
 * Uses the store's built-in filter support.
 */
export async function GET(request: Request) {
  try {
    const params = getSearchParams(request);
    const status = params.get('status') as AbsenceStatus | null;
    const date = params.get('date');

    const absences = getAbsences({
      ...(status && { statut: status }),
      ...(date && { date }),
    });

    return NextResponse.json({ data: absences, total: absences.length });
  } catch (error) {
    console.error('[GET /api/absences] Unexpected error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Erreur interne du serveur');
  }
}

/**
 * POST /api/absences
 * Create a new absence and auto-generate an alert.
 */
export async function POST(request: Request) {
  try {
    const { data, error } = await parseBody<Omit<Absence, 'id' | 'created_at'>>(request);
    if (error) return error;

    const missing: Record<string, string[]> = {};
    if (!data.employe_id) missing.employe_id = ["L'employe_id est obligatoire"];
    if (!data.client_id) missing.client_id = ['Le client_id est obligatoire'];
    if (!data.date) missing.date = ['La date est obligatoire'];
    if (!data.type) missing.type = ['Le type est obligatoire'];

    if (Object.keys(missing).length > 0) {
      return errorResponse(400, 'VALIDATION_ERROR', 'Champs obligatoires manquants', missing);
    }

    const employee = getEmployeeById(data.employe_id);
    if (!employee) {
      return errorResponse(404, 'NOT_FOUND', `Employe '${data.employe_id}' introuvable`);
    }

    const client = getClientById(data.client_id);
    if (!client) {
      return errorResponse(404, 'NOT_FOUND', `Client '${data.client_id}' introuvable`);
    }

    const absence = createAbsence({
      ...data,
      statut: data.statut || 'ouverte',
    });

    // Auto-generate an absence alert with priority based on client priority
    createAlert({
      type: 'absence',
      priority: client.priorite === 'haute' ? 'urgent' : 'moyen',
      title: `Absence signalee: ${employee.prenom} ${employee.nom}`,
      description: `${employee.prenom} ${employee.nom} est absent(e) le ${absence.date} chez ${client.nom}. Motif: ${absence.type}.`,
      related_client_id: client.id,
      related_employe_id: employee.id,
      is_read: false,
    });

    return NextResponse.json({ data: absence }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/absences] Unexpected error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Erreur interne du serveur');
  }
}
