import { Service } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { SIMULATED_LATENCY_MS } from '../../shared/util-config/simulated-latency';
import { Flight } from './flight';
import { Ticket } from './ticket';

/**
 * Accès aux billets (suffixe « -client »). Simule un backend en mémoire.
 *
 * Placé dans la couche `data` du domaine car utilisé par DEUX features
 * (booking crée les billets, my-tickets les liste) et exposé au domaine
 * luggage via l'API publique `api/ticketing-api.ts`.
 */
@Service()
export class TicketClient {
  // Un billet existant, pour que les écrans ne soient pas vides au démarrage.
  private readonly tickets: Ticket[] = [
    {
      id: 1,
      passenger: 'Ada Lovelace',
      bags: 1,
      flight: { id: 3, from: 'Paris', to: 'Berlin', date: '2026-11-03T09:10', delayed: false },
    },
  ];

  book(flight: Flight, passenger: string, bags: number): Observable<Ticket> {
    const ticket: Ticket = { id: this.tickets.length + 1, flight, passenger, bags };
    this.tickets.push(ticket);
    return of(ticket).pipe(delay(SIMULATED_LATENCY_MS));
  }

  findAll(): Observable<Ticket[]> {
    return of([...this.tickets]).pipe(delay(SIMULATED_LATENCY_MS));
  }
}
