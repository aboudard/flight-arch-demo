import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FlightCard } from '../../ui-flight/flight-card';
import { FlightStore } from '../flight-store';

/** Composant « smart » (suffixe « -search ») : connaît le cas d'usage. */
@Component({
  selector: 'app-flight-search',
  imports: [FlightCard, RouterLink],
  template: `
    <h2>Rechercher un vol</h2>
    <form (submit)="$event.preventDefault(); store.load()">
      <label>De <input [value]="store.from()" (input)="onFrom($event)" /></label>
      <label>À <input [value]="store.to()" (input)="onTo($event)" /></label>
      <button type="submit">Rechercher</button>
    </form>

    @if (store.loading()) {
      <p>Chargement…</p>
    }
    @for (flight of store.flights(); track flight.id) {
      <app-flight-card
        [item]="flight"
        [selectable]="true"
        [selected]="store.selectedIds().includes(flight.id)"
        (selectedChange)="store.toggleSelected(flight.id)"
      />
    } @empty {
      <p>Aucun vol chargé.</p>
    }
    <p>
      {{ store.selectedFlights().length }} vol(s) sélectionné(s) ·
      <a routerLink="/booking-summary">Voir le récapitulatif</a>
    </p>
  `,
  styles: `label { margin-right: 12px; }`,
})
export class FlightSearch {
  protected readonly store = inject(FlightStore);

  protected onFrom(event: Event): void {
    this.store.updateCriteria((event.target as HTMLInputElement).value, this.store.to());
  }

  protected onTo(event: Event): void {
    this.store.updateCriteria(this.store.from(), (event.target as HTMLInputElement).value);
  }
}
