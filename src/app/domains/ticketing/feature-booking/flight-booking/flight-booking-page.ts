import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PageHeader } from '../../../shared/ui-design/page-header';
import { FlightCard } from '../../ui-flight/flight-card';
import { BookingCoordinator } from './booking-coordinator';

/** Écran 2 — composant « smart » (suffixe « -page ») : réserver UN vol pour UN passager. */
@Component({
  selector: 'app-flight-booking-page',
  imports: [FlightCard, PageHeader, RouterLink],
  template: `
    <app-page-header
      step="Étape 2 sur 3"
      heading="Réserver le vol"
      description="Indiquez le passager et le nombre de bagages en soute, puis confirmez : un billet est créé pour ce vol."
      domain="ticketing"
      feature="feature-booking"
    />

    @if (coordinator.flight(); as flight) {
      <app-flight-card [item]="flight" />

      <form class="booking" (submit)="$event.preventDefault(); confirm()">
        <label>
          Nom du passager
          <input
            [value]="coordinator.passengerName()"
            (input)="onName($event)"
            placeholder="ex. Alan Turing"
          />
        </label>
        <label>
          Bagages en soute
          <select [value]="coordinator.bags()" (change)="onBags($event)">
            <option [value]="0">Aucun</option>
            <option [value]="1">1 bagage</option>
            <option [value]="2">2 bagages</option>
          </select>
        </label>
        <button type="submit" [disabled]="!coordinator.canConfirm()">
          {{ coordinator.saving() ? 'Enregistrement…' : 'Confirmer la réservation' }}
        </button>
      </form>
    } @else {
      <p>Aucun vol choisi. <a routerLink="/flight-search">Rechercher un vol</a> d'abord.</p>
    }
  `,
  styles: `
    .booking { display: flex; gap: 12px; align-items: end; flex-wrap: wrap; margin-top: 12px; }
    label { display: flex; flex-direction: column; gap: 4px; }
  `,
})
export class FlightBookingPage {
  protected readonly coordinator = inject(BookingCoordinator);
  private readonly router = inject(Router);

  protected onName(event: Event): void {
    this.coordinator.setPassengerName((event.target as HTMLInputElement).value);
  }

  protected onBags(event: Event): void {
    this.coordinator.setBags(Number((event.target as HTMLSelectElement).value));
  }

  protected async confirm(): Promise<void> {
    const ticket = await this.coordinator.confirm();
    if (ticket) {
      this.router.navigate(['/my-tickets'], { queryParams: { confirmed: ticket.id } });
    }
  }
}
