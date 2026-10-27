import { inject, Service } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';
import { SIMULATED_LATENCY_MS } from '../../shared/util-config/simulated-latency';
// ✅ Accès autorisé à un autre domaine : uniquement via son API publique.
import { Ticket, TicketClient } from '../../ticketing/api/ticketing-api';
import { Luggage, LuggageStatus } from './luggage';

/**
 * Accès aux bagages (suffixe « -client »).
 * Les bagages sont déduits des billets du domaine ticketing (nombre de bagages
 * déclaré à la réservation) ; leur statut est propre au domaine luggage.
 */
@Service()
export class LuggageClient {
  private readonly tickets = inject(TicketClient);
  // Statuts connus ; un bagage absent de la table est « checked-in ».
  private readonly statuses = new Map<string, LuggageStatus>([['1-1', 'loaded']]);

  findAll(): Observable<Luggage[]> {
    return this.tickets.findAll().pipe(map((tickets) => tickets.flatMap((t) => this.toLuggage(t))));
  }

  setStatus(id: string, status: LuggageStatus): Observable<void> {
    this.statuses.set(id, status);
    return of(undefined).pipe(delay(SIMULATED_LATENCY_MS));
  }

  private toLuggage(ticket: Ticket): Luggage[] {
    return Array.from({ length: ticket.bags }, (_, i) => {
      const id = `${ticket.id}-${i + 1}`;
      return {
        id,
        ticketId: ticket.id,
        passenger: ticket.passenger,
        label: `Bagage ${i + 1}/${ticket.bags}`,
        status: this.statuses.get(id) ?? 'checked-in',
        flight: ticket.flight,
      };
    });
  }
}
