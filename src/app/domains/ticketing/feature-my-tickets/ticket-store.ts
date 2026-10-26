import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { Flight } from '../data/flight';
import { FlightClient } from '../data/flight-client';

/** Store local à la feature « my-tickets ». Réutilise le FlightClient du domaine. */
export const TicketStore = signalStore(
  withState({ tickets: [] as Flight[], loading: false }),
  withMethods((store, client = inject(FlightClient)) => ({
    load: rxMethod<number[]>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap((ids) => client.findByIds(ids)),
        tap((tickets) => patchState(store, { tickets, loading: false })),
      ),
    ),
  })),
  withHooks({
    onInit(store) {
      store.load([1, 3]);
    },
  }),
);
