import { Component, inject } from '@angular/core';
import { FlightCard } from '../ui-flight/flight-card';
import { TicketStore } from './ticket-store';

@Component({
  selector: 'app-my-tickets-page',
  imports: [FlightCard],
  providers: [TicketStore],
  template: `
    <h2>Mes billets</h2>
    @if (store.loading()) {
      <p>Chargement…</p>
    }
    @for (ticket of store.tickets(); track ticket.id) {
      <app-flight-card [item]="ticket" />
    }
  `,
})
export class MyTicketsPage {
  protected readonly store = inject(TicketStore);
}
