import { Service } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { SIMULATED_LATENCY_MS } from '../../shared/util-config/simulated-latency';
import { Flight } from '../data/flight';

const FLIGHTS: Flight[] = [
  { id: 1, from: 'Paris', to: 'Vienne', date: '2026-11-02T08:30', delayed: false },
  { id: 2, from: 'Paris', to: 'Vienne', date: '2026-11-02T17:05', delayed: true },
  { id: 3, from: 'Paris', to: 'Berlin', date: '2026-11-03T09:10', delayed: false },
  { id: 4, from: 'Lyon', to: 'Vienne', date: '2026-11-04T12:45', delayed: false },
];

/**
 * Accès au catalogue de vols (suffixe « -client »).
 * Seul un store a le droit de l'utiliser (test d'architecture).
 *
 * Principe de localité : il n'est utilisé que par la feature booking, il reste
 * donc DANS cette feature. Il ne descendra dans `data` que si une seconde
 * feature en a besoin (comme ticket-client).
 */
@Service()
export class FlightClient {
  find(from: string, to: string): Observable<Flight[]> {
    const result = FLIGHTS.filter((f) => matches(f.from, from) && matches(f.to, to));
    return of(result).pipe(delay(SIMULATED_LATENCY_MS));
  }
}

function matches(value: string, filter: string): boolean {
  return !filter || value.toLowerCase().startsWith(filter.toLowerCase());
}
