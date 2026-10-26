import { Component, inject, signal } from '@angular/core';
import { FlightCard } from '../../ui-flight/flight-card';
import { BookingSummaryCoordinator } from './booking-summary-coordinator';

/** Composant « smart » (suffixe « -page »). */
@Component({
  selector: 'app-booking-summary-page',
  imports: [FlightCard],
  template: `
    <h2>Récapitulatif</h2>
    <label>
      Passager
      <input [value]="coordinator.passengerName()" (input)="onName($event)" />
    </label>
    @for (flight of coordinator.selectedFlights(); track flight.id) {
      <app-flight-card [item]="flight" />
    } @empty {
      <p>Aucun vol sélectionné.</p>
    }
    <button type="button" [disabled]="!coordinator.canConfirm()" (click)="confirm()">
      Confirmer
    </button>
    @if (message()) {
      <p role="status">{{ message() }}</p>
    }
  `,
})
export class BookingSummaryPage {
  protected readonly coordinator = inject(BookingSummaryCoordinator);
  protected readonly message = signal('');

  protected onName(event: Event): void {
    this.coordinator.setPassengerName((event.target as HTMLInputElement).value);
  }

  protected confirm(): void {
    this.message.set(this.coordinator.confirm());
  }
}
