import { Flight } from './flight';

/** Un billet : un vol réservé pour UN passager, avec ses bagages en soute. */
export interface Ticket {
  id: number;
  flight: Flight;
  passenger: string;
  bags: number;
}
