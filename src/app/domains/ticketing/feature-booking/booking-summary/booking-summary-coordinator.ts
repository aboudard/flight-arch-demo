import { computed, inject, Service } from '@angular/core';
import { FlightStore } from '../flight-store';
import { PassengerStore } from '../passenger-store';

/**
 * Coordinator (suffixe « -coordinator ») : orchestre plusieurs stores
 * pour un cas d'usage. Un STORE n'a pas le droit d'accéder à un autre store
 * (risque de cycles et d'incohérences) — d'où ce rôle dédié.
 *
 * ⚠️ Démo : renommer ce fichier en « booking-summary-store.ts » fait échouer
 * les tests d'architecture (npm run test:arch).
 */
@Service()
export class BookingSummaryCoordinator {
  private readonly flights = inject(FlightStore);
  private readonly passenger = inject(PassengerStore);

  readonly passengerName = this.passenger.name;
  readonly selectedFlights = this.flights.selectedFlights;
  readonly canConfirm = computed(
    () => this.passengerName().trim().length > 0 && this.selectedFlights().length > 0,
  );

  setPassengerName(name: string): void {
    this.passenger.setName(name);
  }

  confirm(): string {
    const message = `Réservation confirmée pour ${this.passengerName()} (${this.selectedFlights().length} vol(s)).`;
    this.flights.clearSelection();
    this.passenger.reset();
    return message;
  }
}
