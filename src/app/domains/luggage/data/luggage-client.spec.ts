import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { TicketClient } from '../../ticketing/api/ticketing-api';
import { LuggageClient } from './luggage-client';

describe('LuggageClient', () => {
  const flight = { id: 1, from: 'Paris', to: 'Vienne', date: '2026-11-02T08:30', delayed: false };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TicketClient,
          useValue: { findAll: () => of([{ id: 7, flight, passenger: 'Alan Turing', bags: 2 }]) },
        },
      ],
    });
  });

  it('crée un bagage par bagage déclaré sur le billet, puis suit son statut', async () => {
    const client = TestBed.inject(LuggageClient);

    const bags = await firstValueFrom(client.findAll());
    expect(bags.map((b) => [b.id, b.status])).toEqual([
      ['7-1', 'checked-in'],
      ['7-2', 'checked-in'],
    ]);

    await firstValueFrom(client.setStatus('7-1', 'loaded'));
    const updated = await firstValueFrom(client.findAll());
    expect(updated[0].status).toBe('loaded');
  });
});
