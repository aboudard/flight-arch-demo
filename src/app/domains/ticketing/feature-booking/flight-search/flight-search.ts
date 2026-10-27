import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageHeader } from '../../../shared/ui-design/page-header';
import { FlightCard } from '../../ui-flight/flight-card';
import { FlightStore } from '../flight-store';

/** Écran 1 — composant « smart » (suffixe « -search ») : connaît le cas d'usage. */
@Component({
  selector: 'app-flight-search',
  imports: [FlightCard, PageHeader],
  template: `
    <app-page-header
      step="Étape 1 sur 3"
      heading="Rechercher un vol"
      description="Choisissez un trajet, puis cliquez sur « Réserver ce vol » pour passer à la réservation."
      domain="ticketing"
      feature="feature-booking"
    />

    <form class="search" (submit)="$event.preventDefault(); store.load()">
      <label>Départ <input [value]="store.from()" (input)="onFrom($event)" /></label>
      <label>Arrivée <input [value]="store.to()" (input)="onTo($event)" /></label>
      <button type="submit">Rechercher</button>
    </form>

    @if (store.loading()) {
      <p>Recherche en cours…</p>
    } @else {
      <p class="count">{{ store.flights().length }} vol(s) trouvé(s)</p>
      @for (flight of store.flights(); track flight.id) {
        <app-flight-card [item]="flight">
          <button type="button" (click)="book(flight.id)">Réserver ce vol</button>
        </app-flight-card>
      } @empty {
        <p>Aucun vol pour ce trajet. Essayez par exemple Paris → Vienne ou Paris → Berlin.</p>
      }
    }
  `,
  styles: `
    .search { display: flex; gap: 12px; align-items: end; flex-wrap: wrap; }
    .count { color: #4b5563; }
  `,
})
export class FlightSearch implements OnInit {
  protected readonly store = inject(FlightStore);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.store.load();
  }

  protected onFrom(event: Event): void {
    this.store.updateCriteria((event.target as HTMLInputElement).value, this.store.to());
  }

  protected onTo(event: Event): void {
    this.store.updateCriteria(this.store.from(), (event.target as HTMLInputElement).value);
  }

  protected book(flightId: number): void {
    this.store.selectFlight(flightId);
    this.router.navigate(['/booking']);
  }
}
