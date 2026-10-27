/**
 * API publique du domaine « ticketing ».
 *
 * C'est le SEUL point d'entrée que les autres domaines peuvent importer
 * (règle Sheriff : `domain:*` peut accéder à `type:api`).
 * Tout ce qui est exposé ici doit rester rétrocompatible :
 * on n'expose que le strict nécessaire, de façon délibérée.
 */
export type { Flight } from '../data/flight';
export type { Ticket } from '../data/ticket';
// Le domaine luggage lit les billets pour connaître les bagages déclarés à la réservation.
export { TicketClient } from '../data/ticket-client';
export { formatRoute } from '../util-format/format-route';
