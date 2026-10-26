import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { Luggage } from '../data/luggage';
import { LuggageClient } from '../data/luggage-client';

export const LuggageStore = signalStore(
  withState({ items: [] as Luggage[], loading: false }),
  withMethods((store, client = inject(LuggageClient)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() => client.findAll()),
        tap((items) => patchState(store, { items, loading: false })),
      ),
    ),
  })),
  withHooks({ onInit: (store) => store.load() }),
);
