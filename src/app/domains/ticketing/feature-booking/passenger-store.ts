import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { Ticket } from '../data/ticket';
import { TicketClient } from '../data/ticket-client';
// ❌ Démo ArchUnit : un store importe un autre store (règle « store → store » interdite).
// Version conforme : c'est booking-coordinator.ts qui combine FlightStore et PassengerStore.
import { FlightStore } from './flight-store';

/** Store du passager en cours de réservation et enregistrement du billet. */
export const PassengerStore = signalStore(
  { providedIn: 'root' },
  withState({ name: '', bags: 0, saving: false }),
  withMethods((store, client = inject(TicketClient), flights = inject(FlightStore)) => ({
    setName(name: string): void {
      patchState(store, { name });
    },
    setBags(bags: number): void {
      patchState(store, { bags });
    },
    reset(): void {
      patchState(store, { name: '', bags: 0 });
    },
    // ❌ Le store lit le vol choisi dans un autre store, puis le modifie
    async book(): Promise<Ticket | null> {
      const flight = flights.selectedFlight();
      if (!flight) return null;
      patchState(store, { saving: true });
      const ticket = await firstValueFrom(client.book(flight, store.name().trim(), store.bags()));
      patchState(store, { saving: false });
      flights.clearSelection();
      return ticket;
    },
  })),
);
