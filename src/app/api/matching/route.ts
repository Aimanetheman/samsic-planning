import { NextResponse } from 'next/server';
import { findReplacementsWithMeta, findReplacementsForSlot } from '@/lib/matching-engine';
import { getAIAnalysis } from '@/lib/ai-matching';
import { getClients } from '@/lib/store';
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
 * Find replacement candidates with AI analysis.
 * Accepts either { absence_id } or { client_id, date }.
 */
export async function POST(request: Request) {
  try {
    const { data, error } = await parseBody<MatchRequest>(request);
    if (error) return error;

    let result;
    let clientId: string | undefined;

    if (isMatchByAbsence(data)) {
      result = findReplacementsWithMeta(data.absence_id);
      if (!result) {
        return errorResponse(
          404,
          'NOT_FOUND',
          `Absence '${data.absence_id}' introuvable ou client associe introuvable`
        );
      }
    } else if (isMatchBySlot(data)) {
      if (!data.client_id || !data.date) {
        return errorResponse(
          400,
          'VALIDATION_ERROR',
          'client_id et date sont obligatoires pour la recherche par creneau'
        );
      }
      clientId = data.client_id;
      result = findReplacementsForSlot(data.client_id, data.date);
      if (!result) {
        return errorResponse(404, 'NOT_FOUND', `Client '${data.client_id}' introuvable`);
      }
    } else {
      return errorResponse(
        400,
        'VALIDATION_ERROR',
        'Le corps doit contenir soit { absence_id } soit { client_id, date }'
      );
    }

    // Enrich with AI analysis (server-side only, API key never exposed)
    let aiAnalysis = null;
    try {
      const clients = getClients();
      const client = clientId
        ? clients.find(c => c.id === clientId)
        : clients[0]; // fallback

      if (client && result.candidates.length > 0) {
        const dateStr = isMatchBySlot(data) ? data.date : new Date().toISOString().split('T')[0];
        aiAnalysis = await getAIAnalysis({
          clientName: client.nom,
          clientAddress: client.adresse,
          requiredLanguages: client.langues_requises.map(l => l.language),
          requiredSkills: client.competences_requises,
          requiredCertifications: client.certifications_requises,
          schedule: `${client.horaire_debut} - ${client.horaire_fin}`,
          absentEmployeeName: 'Employe absent',
          date: dateStr,
          candidates: result.candidates.map(c => ({
            name: `${c.employe_prenom} ${c.employe_nom}`,
            score: c.score_total,
            languages: c.raisons.filter(r => r.includes('langue') || r.includes('FR') || r.includes('EN') || r.includes('DE')),
            skills: c.raisons,
            isStandby: c.is_standby,
            isAvailable: c.is_available,
            reasons: c.raisons,
            exclusionReasons: c.exclusion_raisons,
          })),
        });
      }
    } catch (aiError) {
      console.error('[AI Analysis] Error:', aiError);
      // AI analysis is non-blocking, continue without it
    }

    return NextResponse.json({
      data: {
        ...result,
        ai_analysis: aiAnalysis,
      },
    });
  } catch (error) {
    console.error('[POST /api/matching] Unexpected error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Erreur interne du serveur');
  }
}
