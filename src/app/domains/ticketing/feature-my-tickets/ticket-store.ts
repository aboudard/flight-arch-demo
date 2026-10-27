import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { Ticket } from '../data/ticket';
import { TicketClient } from '../data/ticket-client';

/** Store local à l'écran « Mes billets » (fourni par le composant). */
export const TicketStore = signalStore(
  withState({ tickets: [] as Ticket[], loading: false }),
  withMethods((store, client = inject(TicketClient)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() => client.findAll()),
        tap((tickets) => patchState(store, { tickets, loading: false })),
      ),
    ),
  })),
  withHooks({ onInit: (store) => store.load() }),
);
