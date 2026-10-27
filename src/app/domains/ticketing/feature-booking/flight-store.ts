import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { Flight } from '../data/flight';
import { FlightClient } from './flight-client';

interface FlightState {
  from: string;
  to: string;
  flights: Flight[];
  selectedFlightId: number | null;
  loading: boolean;
}

const initialState: FlightState = {
  from: 'Paris',
  to: 'Vienne',
  flights: [],
  selectedFlightId: null,
  loading: false,
};

/**
 * Store de la recherche de vols (suffixe « -store »), local à la feature booking.
 * Seul un store a le droit d'utiliser un client (test d'architecture).
 */
export const FlightStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    selectedFlight: computed(
      () => store.flights().find((f) => f.id === store.selectedFlightId()) ?? null,
    ),
  })),
  withMethods((store, client = inject(FlightClient)) => ({
    updateCriteria(from: string, to: string): void {
      patchState(store, { from, to });
    },
    selectFlight(id: number): void {
      patchState(store, { selectedFlightId: id });
    },
    clearSelection(): void {
      patchState(store, { selectedFlightId: null });
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
