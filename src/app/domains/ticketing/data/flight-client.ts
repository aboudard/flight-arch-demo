import { Service } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { SIMULATED_LATENCY_MS } from '../../shared/util-config/simulated-latency';
import { Flight } from './flight';

const FLIGHTS: Flight[] = [
  { id: 1, from: 'Paris', to: 'Vienne', date: '2026-11-02T08:30', delayed: false },
  { id: 2, from: 'Paris', to: 'Vienne', date: '2026-11-02T17:05', delayed: true },
  { id: 3, from: 'Paris', to: 'Berlin', date: '2026-11-03T09:10', delayed: false },
  { id: 4, from: 'Lyon', to: 'Vienne', date: '2026-11-04T12:45', delayed: false },
];

/**
 * Accès aux données (suffixe « -client »).
 * Placé dans la couche `data` du domaine car utilisé par DEUX features
 * (booking et my-tickets) : il a été « descendu » d'un niveau.
 */
@Service()
export class FlightClient {
  find(from: string, to: string): Observable<Flight[]> {
    const result = FLIGHTS.filter(
      (f) => matches(f.from, from) && matches(f.to, to),
    );
    return of(result).pipe(delay(SIMULATED_LATENCY_MS));
  }

  findByIds(ids: number[]): Observable<Flight[]> {
    return of(FLIGHTS.filter((f) => ids.includes(f.id))).pipe(
      delay(SIMULATED_LATENCY_MS),
    );
  }
}

function matches(value: string, filter: string): boolean {
  return !filter || value.toLowerCase().startsWith(filter.toLowerCase());
}
