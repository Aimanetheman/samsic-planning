// ============================================================
// Samsic Planning IA - In-Memory Data Store
// Initializes from seed data, provides CRUD operations.
// All mutations return the updated entity for easy response handling.
// ============================================================

import type {
  Employee,
  Client,
  Affectation,
  Absence,
  Alert,
  DashboardKPI,
  AffectationStatut,
  AbsenceStatus,
} from './types';

import {
  seedEmployees,
  seedClients,
  seedAffectations,
  seedAbsences,
  seedAlerts,
} from './data';

// --- In-memory state (initialized from seed data) ---

let employees: Map<string, Employee> = new Map();
let clients: Map<string, Client> = new Map();
let affectations: Map<string, Affectation> = new Map();
let absences: Map<string, Absence> = new Map();
let alerts: Map<string, Alert> = new Map();

// --- Initialize ---

function loadSeedData() {
  employees = new Map(seedEmployees.map((e) => [e.id, structuredClone(e)]));
  clients = new Map(seedClients.map((c) => [c.id, structuredClone(c)]));
  affectations = new Map(seedAffectations.map((a) => [a.id, structuredClone(a)]));
  absences = new Map(seedAbsences.map((a) => [a.id, structuredClone(a)]));
  alerts = new Map(seedAlerts.map((a) => [a.id, structuredClone(a)]));
}

// Auto-initialize on first import
loadSeedData();

// --- ID generation ---

let idCounter = 1000;
function nextId(prefix: string): string {
  idCounter++;
  return `${prefix}-${idCounter}`;
}

function now(): string {
  return new Date().toISOString();
}

// ============================================================
// EMPLOYEES
// ============================================================

export function getEmployees(): Employee[] {
  return Array.from(employees.values());
}

export function getEmployee(id: string): Employee | undefined {
  return employees.get(id);
}

/** Alias for backward compatibility with existing API routes */
export const getEmployeeById = getEmployee;

export function createEmployee(data: Omit<Employee, 'id' | 'created_at'>): Employee {
  const employee: Employee = {
    ...data,
    id: nextId('emp'),
    created_at: now(),
  };
  employees.set(employee.id, employee);
  return employee;
}

export function updateEmployee(id: string, updates: Partial<Employee>): Employee | undefined {
  const existing = employees.get(id);
  if (!existing) return undefined;
  const updated: Employee = { ...existing, ...updates, id, created_at: existing.created_at };
  employees.set(id, updated);
  return updated;
}

// ============================================================
// CLIENTS
// ============================================================

export function getClients(): Client[] {
  return Array.from(clients.values());
}

export function getClient(id: string): Client | undefined {
  return clients.get(id);
}

/** Alias for backward compatibility with existing API routes */
export const getClientById = getClient;

export function createClient(data: Omit<Client, 'id'>): Client {
  const client: Client = {
    ...data,
    id: nextId('cli'),
  };
  clients.set(client.id, client);
  return client;
}

export function updateClient(id: string, updates: Partial<Client>): Client | undefined {
  const existing = clients.get(id);
  if (!existing) return undefined;
  const updated: Client = { ...existing, ...updates, id };
  clients.set(id, updated);
  return updated;
}

// ============================================================
// AFFECTATIONS
// ============================================================

export interface AffectationFilters {
  employe_id?: string;
  client_id?: string;
  date?: string;
  statut?: AffectationStatut;
}

export function getAffectations(filters?: AffectationFilters): Affectation[] {
  const all = Array.from(affectations.values());
  if (!filters) return all;

  return all.filter((a) => {
    if (filters.employe_id && a.employe_id !== filters.employe_id) return false;
    if (filters.client_id && a.client_id !== filters.client_id) return false;
    if (filters.date && a.date !== filters.date) return false;
    if (filters.statut && a.statut !== filters.statut) return false;
    return true;
  });
}

export function getAffectationById(id: string): Affectation | undefined {
  return affectations.get(id);
}

export function createAffectation(
  data: Omit<Affectation, 'id' | 'created_at'>
): Affectation {
  const affectation: Affectation = {
    ...data,
    id: nextId('aff'),
    created_at: now(),
  };
  affectations.set(affectation.id, affectation);
  return affectation;
}

export function updateAffectation(
  id: string,
  updates: Partial<Affectation>
): Affectation | undefined {
  const existing = affectations.get(id);
  if (!existing) return undefined;
  const updated: Affectation = { ...existing, ...updates, id, created_at: existing.created_at };
  affectations.set(id, updated);
  return updated;
}

// ============================================================
// ABSENCES
// ============================================================

export interface AbsenceFilters {
  employe_id?: string;
  client_id?: string;
  date?: string;
  statut?: AbsenceStatus;
}

export function getAbsences(filters?: AbsenceFilters): Absence[] {
  const all = Array.from(absences.values());
  if (!filters) return all;

  return all.filter((a) => {
    if (filters.employe_id && a.employe_id !== filters.employe_id) return false;
    if (filters.client_id && a.client_id !== filters.client_id) return false;
    if (filters.date && a.date !== filters.date) return false;
    if (filters.statut && a.statut !== filters.statut) return false;
    return true;
  });
}

export function getAbsenceById(id: string): Absence | undefined {
  return absences.get(id);
}

export function createAbsence(
  data: Omit<Absence, 'id' | 'created_at'>
): Absence {
  const absence: Absence = {
    ...data,
    id: nextId('abs'),
    created_at: now(),
  };
  absences.set(absence.id, absence);
  return absence;
}

export function updateAbsence(
  id: string,
  updates: Partial<Absence>
): Absence | undefined {
  const existing = absences.get(id);
  if (!existing) return undefined;
  const updated: Absence = { ...existing, ...updates, id, created_at: existing.created_at };
  absences.set(id, updated);
  return updated;
}

// ============================================================
// ALERTS
// ============================================================

export function getAlerts(): Alert[] {
  return Array.from(alerts.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getAlertById(id: string): Alert | undefined {
  return alerts.get(id);
}

export function createAlert(data: Omit<Alert, 'id' | 'created_at'>): Alert {
  const alert: Alert = {
    ...data,
    id: nextId('alert'),
    created_at: now(),
  };
  alerts.set(alert.id, alert);
  return alert;
}

export function markAlertRead(id: string): Alert | undefined {
  const existing = alerts.get(id);
  if (!existing) return undefined;
  const updated: Alert = { ...existing, is_read: true };
  alerts.set(id, updated);
  return updated;
}

// ============================================================
// DASHBOARD KPI
// ============================================================

export function getDashboardKPI(): DashboardKPI {
  const todayStr = new Date().toISOString().split('T')[0];

  const clientsActifs = clients.size;
  const employesActifs = Array.from(employees.values()).filter(
    (e) => e.statut === 'actif'
  ).length;

  const todayAbsences = Array.from(absences.values()).filter(
    (a) => a.date === todayStr && a.statut !== 'couverte'
  );
  const absencesAujourdhui = todayAbsences.length;

  // A post is uncovered if there is an absence today without a confirmed replacement
  const allAffectations = Array.from(affectations.values());
  const postesNonCouverts = todayAbsences.filter((absence) => {
    const hasReplacement = allAffectations.some(
      (aff) =>
        aff.client_id === absence.client_id &&
        aff.date === todayStr &&
        aff.type === 'remplacement' &&
        aff.statut === 'confirme'
    );
    return !hasReplacement;
  }).length;

  return {
    clients_actifs: clientsActifs,
    employes_actifs: employesActifs,
    absences_aujourdhui: absencesAujourdhui,
    postes_non_couverts: postesNonCouverts,
  };
}

// ============================================================
// RESET (for testing)
// ============================================================

export function resetStore(): void {
  loadSeedData();
  idCounter = 1000;
}
