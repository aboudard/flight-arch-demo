import type { Flight } from '../../ticketing/api/ticketing-api';

export type LuggageStatus = 'checked-in' | 'loaded' | 'lost';

export interface Luggage {
  id: number;
  passenger: string;
  weightKg: number;
  status: LuggageStatus;
  flight: Flight;
}
