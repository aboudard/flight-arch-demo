import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { Flight } from '../data/flight';
import { FlightClient } from '../data/flight-client';

interface FlightState {
  from: string;
  to: string;
  flights: Flight[];
  selectedIds: number[];
  loading: boolean;
}

const initialState: FlightState = {
  from: 'Paris',
  to: 'Vienne',
  flights: [],
  selectedIds: [],
  loading: false,
};

/**
 * Store local à la feature « booking » (suffixe « -store »).
 * Seul un store a le droit d'utiliser un client (test d'architecture).
 */
export const FlightStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    selectedFlights: computed(() =>
      store.flights().filter((f) => store.selectedIds().includes(f.id)),
    ),
  })),
  withMethods((store, client = inject(FlightClient)) => ({
    updateCriteria(from: string, to: string): void {
      patchState(store, { from, to });
    },
    toggleSelected(id: number): void {
      const ids = store.selectedIds();
      patchState(store, {
        selectedIds: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
      });
    },
    clearSelection(): void {
      patchState(store, { selectedIds: [] });
    },
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() => client.find(store.from(), store.to())),
        tap((flights) => patchState(store, { flights, loading: false })),
      ),
    ),
  })),
);
