import { NextResponse } from 'next/server';
import { ensureInitialized, getAlerts, markAlertRead } from '@/lib/store';
import { errorResponse, parseBody, getSearchParams } from '@/lib/api-utils';

/**
 * GET /api/alerts
 * List alerts with optional filters: ?priority=, ?unread=true
 * Results are pre-sorted by the store (most recent first).
 */
export async function GET(request: Request) {
  try {
    ensureInitialized();
    const params = getSearchParams(request);
    const priority = params.get('priority');
    const unread = params.get('unread');

    let alerts = getAlerts();

    if (priority) {
      alerts = alerts.filter((a) => a.priority === priority);
    }

    if (unread === 'true') {
      alerts = alerts.filter((a) => !a.is_read);
    }

    return NextResponse.json({ data: alerts, total: alerts.length });
  } catch (error) {
    console.error('[GET /api/alerts] Unexpected error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Erreur interne du serveur');
  }
}

/**
 * PATCH /api/alerts
 * Mark an alert as read. Body: { id: string }
 */
export async function PATCH(request: Request) {
  try {
    ensureInitialized();
    const { data, error } = await parseBody<{ id: string }>(request);
    if (error) return error;

    if (!data.id) {
      return errorResponse(400, 'VALIDATION_ERROR', "L'id de l'alerte est obligatoire");
    }

    const updated = markAlertRead(data.id);
    if (!updated) {
      return errorResponse(404, 'NOT_FOUND', `Alerte avec l'id '${data.id}' introuvable`);
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('[PATCH /api/alerts] Unexpected error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Erreur interne du serveur');
  }
}
