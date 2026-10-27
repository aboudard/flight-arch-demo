import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../shared/ui-design/page-header';
import { FlightCard } from '../ui-flight/flight-card';
import { TicketStore } from './ticket-store';

/** Écran 3 — composant « smart » (suffixe « -page ») : les billets réservés. */
@Component({
  selector: 'app-my-tickets-page',
  imports: [FlightCard, PageHeader, RouterLink],
  providers: [TicketStore],
  template: `
    <app-page-header
      step="Étape 3 sur 3"
      heading="Mes billets"
      description="Tous les billets réservés, un par passager et par vol."
      domain="ticketing"
      feature="feature-my-tickets"
    />

    @if (confirmed()) {
      <p class="confirmation" role="status">
        Billet n°{{ confirmed() }} confirmé. Ses bagages apparaissent maintenant dans
        <a routerLink="/luggage">l'écran Bagages</a>.
      </p>
    }

    @if (store.loading()) {
      <p>Chargement…</p>
    }
    @for (ticket of store.tickets(); track ticket.id) {
      <app-flight-card [item]="ticket.flight" [highlight]="ticket.id === +(confirmed() ?? 0)">
        <p class="ticket">
          <strong>Billet n°{{ ticket.id }}</strong><br />
          {{ ticket.passenger }} · {{ ticket.bags }} bagage(s)
        </p>
      </app-flight-card>
    }
  `,
  styles: `
    .confirmation { background: #f0fdf4; border: 1px solid #16a34a; padding: 8px 12px; border-radius: 8px; }
    .ticket { margin: 0; text-align: right; }
  `,
})
export class MyTicketsPage {
  protected readonly store = inject(TicketStore);
  /** Identifiant du billet qui vient d'être confirmé (paramètre d'URL `?confirmed=`). */
  readonly confirmed = input<string>();
}
