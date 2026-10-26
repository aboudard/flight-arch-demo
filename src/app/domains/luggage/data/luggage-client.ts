import { Service } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { SIMULATED_LATENCY_MS } from '../../shared/util-config/simulated-latency';
import { Luggage } from './luggage';

const LUGGAGE: Luggage[] = [
  {
    id: 101,
    passenger: 'Ada Lovelace',
    weightKg: 18,
    status: 'loaded',
    flight: { id: 1, from: 'Paris', to: 'Vienne', date: '2026-11-02T08:30', delayed: false },
  },
  {
    id: 102,
    passenger: 'Alan Turing',
    weightKg: 23,
    status: 'lost',
    flight: { id: 3, from: 'Paris', to: 'Berlin', date: '2026-11-03T09:10', delayed: false },
  },
];

@Service()
export class LuggageClient {
  findAll(): Observable<Luggage[]> {
    return of(LUGGAGE).pipe(delay(SIMULATED_LATENCY_MS));
  }
}
