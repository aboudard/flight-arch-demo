import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { Flight } from '../data/flight';
import { Ticket } from '../data/ticket';
import { TicketClient } from '../data/ticket-client';

/** Store du passager en cours de réservation et enregistrement du billet. */
export const PassengerStore = signalStore(
  { providedIn: 'root' },
  withState({ name: '', bags: 0, saving: false }),
  withMethods((store, client = inject(TicketClient)) => ({
    setName(name: string): void {
      patchState(store, { name });
    },
    setBags(bags: number): void {
      patchState(store, { bags });
    },
    reset(): void {
      patchState(store, { name: '', bags: 0 });
    },
    async book(flight: Flight): Promise<Ticket> {
      patchState(store, { saving: true });
      const ticket = await firstValueFrom(client.book(flight, store.name().trim(), store.bags()));
      patchState(store, { saving: false });
      return ticket;
    },
  })),
);
