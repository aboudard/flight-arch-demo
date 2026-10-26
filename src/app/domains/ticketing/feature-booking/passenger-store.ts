import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

/** Second store léger de la feature : le passager en cours de réservation. */
export const PassengerStore = signalStore(
  { providedIn: 'root' },
  withState({ name: '' }),
  withMethods((store) => ({
    setName(name: string): void {
      patchState(store, { name });
    },
    reset(): void {
      patchState(store, { name: '' });
    },
  })),
);
