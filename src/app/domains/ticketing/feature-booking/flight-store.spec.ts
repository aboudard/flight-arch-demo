import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { FlightClient } from '../data/flight-client';
import { FlightStore } from './flight-store';

describe('FlightStore', () => {
  const flight = { id: 1, from: 'Paris', to: 'Vienne', date: '2026-11-02T08:30', delayed: false };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: FlightClient, useValue: { find: () => of([flight]) } }],
    });
  });

  it('charge les vols et gère la sélection', () => {
    const store = TestBed.inject(FlightStore);
    store.load();
    expect(store.flights()).toEqual([flight]);

    store.toggleSelected(1);
    expect(store.selectedFlights()).toEqual([flight]);

    store.toggleSelected(1);
    expect(store.selectedFlights()).toEqual([]);
  });
});
