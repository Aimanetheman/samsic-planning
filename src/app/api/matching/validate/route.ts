import { NextResponse } from 'next/server';
import {
  ensureInitialized,
  getAbsenceById,
  getEmployeeById,
  getClientById,
  updateAbsence,
  createAffectation,
  createAlert,
} from '@/lib/store';
import { errorResponse, parseBody } from '@/lib/api-utils';

interface ValidateRequest {
  absence_id: string;
  employe_id: string;
}

/**
 * POST /api/matching/validate
 * Validate a replacement: creates an affectation, marks the absence as covered,
 * and generates a confirmation alert.
 *
 * Works with any valid absence_id -- looks up the linked client from the
 * absence record rather than assuming a specific ID.
 */
export async function POST(request: Request) {
  try {
    ensureInitialized();

    const { data, error } = await parseBody<ValidateRequest>(request);
    if (error) return error;

    // Validate required fields
    const missing: Record<string, string[]> = {};
    if (!data.absence_id) missing.absence_id = ["L'absence_id est obligatoire"];
    if (!data.employe_id) missing.employe_id = ["L'employe_id est obligatoire"];

    if (Object.keys(missing).length > 0) {
      return errorResponse(400, 'VALIDATION_ERROR', 'Champs obligatoires manquants', missing);
    }

    // Verify entities exist
    const absence = getAbsenceById(data.absence_id);
    if (!absence) {
      return errorResponse(404, 'NOT_FOUND', `Absence '${data.absence_id}' introuvable`);
    }

    if (absence.statut === 'couverte') {
      return errorResponse(409, 'CONFLICT', 'Cette absence est deja couverte');
    }

    const employee = getEmployeeById(data.employe_id);
    if (!employee) {
      return errorResponse(404, 'NOT_FOUND', `Employe '${data.employe_id}' introuvable`);
    }

    // Derive client from the absence record, not from hardcoded values
    const client = getClientById(absence.client_id);
    if (!client) {
      return errorResponse(404, 'NOT_FOUND', `Client '${absence.client_id}' introuvable`);
    }

    // Create the replacement affectation
    const affectation = createAffectation({
      employe_id: data.employe_id,
      client_id: absence.client_id,
      date: absence.date,
      type: 'remplacement',
      statut: 'confirme',
    });

    // Mark absence as covered and link the replacement
    updateAbsence(data.absence_id, {
      statut: 'couverte',
      remplacement_id: affectation.id,
    });

    // Generate confirmation alert with the correct type
    createAlert({
      type: 'remplacement_confirme',
      priority: 'info',
      title: `Remplacement confirmé chez ${client.nom}`,
      description: `${employee.prenom} ${employee.nom} remplace le ${absence.date} chez ${client.nom}.`,
      related_client_id: client.id,
      related_employe_id: employee.id,
      is_read: false,
    });

    return NextResponse.json({ data: affectation }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/matching/validate] Unexpected error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Erreur interne du serveur');
  }
}
