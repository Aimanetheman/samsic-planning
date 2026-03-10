// ============================================================================
// Shared API utilities for consistent response formatting and error handling
// ============================================================================

import { NextResponse } from 'next/server';

/**
 * Return a structured JSON error response.
 * Centralizes error shape so all routes return { error: { code, message, details? } }.
 */
export function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: Record<string, string[]>
): NextResponse {
  return NextResponse.json(
    { error: { code, message, ...(details && { details }) } },
    { status }
  );
}

/**
 * Safely parse JSON body from a request.
 * Returns null and an error response if parsing fails.
 */
export async function parseBody<T = Record<string, unknown>>(
  request: Request
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const data = (await request.json()) as T;
    return { data, error: null };
  } catch {
    return {
      data: null,
      error: errorResponse(400, 'INVALID_JSON', 'Le corps de la requete doit etre du JSON valide'),
    };
  }
}

/**
 * Extract and return search params from a request URL.
 */
export function getSearchParams(request: Request): URLSearchParams {
  const { searchParams } = new URL(request.url);
  return searchParams;
}
