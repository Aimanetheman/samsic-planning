import { NextResponse } from 'next/server';
import { getEmployees, createEmployee } from '@/lib/store';
import { errorResponse, parseBody, getSearchParams } from '@/lib/api-utils';
import type { Employee } from '@/lib/types';

/**
 * GET /api/employees
 * List all employees with optional filters: ?search=, ?status=, ?language=
 */
export async function GET(request: Request) {
  try {
    const params = getSearchParams(request);
    const search = params.get('search')?.toLowerCase();
    const status = params.get('status');
    const language = params.get('language');

    let employees = getEmployees();

    if (search) {
      employees = employees.filter(
        (e) =>
          e.nom.toLowerCase().includes(search) ||
          e.prenom.toLowerCase().includes(search) ||
          e.email.toLowerCase().includes(search)
      );
    }

    if (status) {
      employees = employees.filter((e) => e.statut === status);
    }

    if (language) {
      employees = employees.filter((e) =>
        e.langues.some((l) => l.language === language)
      );
    }

    return NextResponse.json({ data: employees, total: employees.length });
  } catch (error) {
    console.error('[GET /api/employees] Unexpected error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Erreur interne du serveur');
  }
}

/**
 * POST /api/employees
 * Create a new employee.
 */
export async function POST(request: Request) {
  try {
    const { data, error } = await parseBody<Omit<Employee, 'id' | 'created_at'>>(request);
    if (error) return error;

    // Validate required fields
    const missing: Record<string, string[]> = {};
    if (!data.nom) missing.nom = ['Le nom est obligatoire'];
    if (!data.prenom) missing.prenom = ['Le prenom est obligatoire'];
    if (!data.email) missing.email = ["L'email est obligatoire"];
    if (!data.telephone) missing.telephone = ['Le telephone est obligatoire'];

    if (Object.keys(missing).length > 0) {
      return errorResponse(400, 'VALIDATION_ERROR', 'Champs obligatoires manquants', missing);
    }

    const employee = createEmployee(data);
    return NextResponse.json({ data: employee }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/employees] Unexpected error:', error);
    return errorResponse(500, 'INTERNAL_ERROR', 'Erreur interne du serveur');
  }
}
