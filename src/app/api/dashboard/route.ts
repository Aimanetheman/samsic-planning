import { NextResponse } from 'next/server';
import { format } from 'date-fns';
import { getDashboardKPI, getAlerts, getAffectations } from '@/lib/store';
import { errorResponse } from '@/lib/api-utils';

/**
 * GET /api/dashboard
 * Returns KPIs, today's alerts, and today's planning overview.
 */
export async function GET() {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');

    const kpi = getDashboardKPI();
    const allAlerts = getAlerts();

    // Today's alerts (already sorted most-recent-first by the store)
    const todayAlerts = allAlerts.filter((a) => a.created_at.startsWith(today));
    const unreadCount = allAlerts.filter((a) => !a.is_read).length;

    // Today's planning overview: active assignments for today
    const todayAffectations = getAffectations({ date: today });
    const planningOverview = todayAffectations
      .filter((a) => a.statut !== 'annule')
      .map((aff) => ({
        affectation_id: aff.id,
        client_id: aff.client_id,
        employe_id: aff.employe_id,
        type: aff.type,
        statut: aff.statut,
      }));

    return NextResponse.json({
      data: {
        kpi,
        alertes_du_jour: todayAlerts,
        alertes_non_lues_total: unreadCount,
        planning_du_jour: planningOverview,
      },
    });
  } catch (error) {
    console.error('[GET /api/dashboard] Unexpected error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Erreur interne du serveur');
  }
}
