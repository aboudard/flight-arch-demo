import { computed, inject, Service } from '@angular/core';
import { Ticket } from '../../data/ticket';
import { FlightStore } from '../flight-store';
import { PassengerStore } from '../passenger-store';

/**
 * Coordinator (suffixe « -coordinator ») : orchestre plusieurs stores pour le
 * cas d'usage « réserver le vol choisi pour un passager ».
 *
 * Un STORE n'a pas le droit d'accéder à un autre store (risque de cycles et
 * d'incohérences) : c'est le rôle du coordinator. Renommer ce fichier en
 * « booking-store.ts » fait échouer les tests d'architecture.
 */
@Service()
export class BookingCoordinator {
  private readonly flights = inject(FlightStore);
  private readonly passenger = inject(PassengerStore);

  readonly flight = this.flights.selectedFlight;
  readonly passengerName = this.passenger.name;
  readonly bags = this.passenger.bags;
  readonly saving = this.passenger.saving;
  readonly canConfirm = computed(
    () => !!this.flight() && this.passengerName().trim().length > 0 && !this.saving(),
  );

  setPassengerName(name: string): void {
    this.passenger.setName(name);
  }

  setBags(bags: number): void {
    this.passenger.setBags(bags);
  }

  /** Enregistre le billet, puis remet la réservation à zéro. */
  async confirm(): Promise<Ticket | null> {
    const flight = this.flight();
    if (!flight || !this.canConfirm()) return null;
    const ticket = await this.passenger.book(flight);
    this.passenger.reset();
    this.flights.clearSelection();
    return ticket;
  }
}
