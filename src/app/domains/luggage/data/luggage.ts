import type { Flight } from '../../ticketing/api/ticketing-api';

export type LuggageStatus = 'checked-in' | 'loaded';

/**
 * Un bagage, vu par l'aéroport. Pour ce domaine, le vol n'est qu'une
 * référence (trajet, date) : on ne réutilise pas le modèle de réservation.
 */
export interface Luggage {
  id: string;
  ticketId: number;
  passenger: string;
  label: string;
  status: LuggageStatus;
  flight: Flight;
}
