import { NextResponse } from 'next/server';
import { getEmployeeById, updateEmployee } from '@/lib/store';
import { errorResponse, parseBody } from '@/lib/api-utils';
import type { Employee } from '@/lib/types';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/employees/:id
 * Retrieve a single employee by ID.
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const employee = getEmployeeById(id);

    if (!employee) {
      return errorResponse(404, 'NOT_FOUND', `Employe avec l'id '${id}' introuvable`);
    }

    return NextResponse.json({ data: employee });
  } catch (error) {
    console.error('[GET /api/employees/:id] Unexpected error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Erreur interne du serveur');
  }
}

/**
 * PATCH /api/employees/:id
 * Partially update an employee.
 */
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { data, error } = await parseBody<Partial<Employee>>(request);
    if (error) return error;

    const updated = updateEmployee(id, data);
    if (!updated) {
      return errorResponse(404, 'NOT_FOUND', `Employe avec l'id '${id}' introuvable`);
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('[PATCH /api/employees/:id] Unexpected error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Erreur interne du serveur');
  }
}
