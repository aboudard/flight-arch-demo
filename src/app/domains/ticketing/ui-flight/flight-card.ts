import { DatePipe } from '@angular/common';
import { Component, input, model } from '@angular/core';
import { Flight } from '../data/flight';
import { formatRoute } from '../util-format/format-route';

/**
 * Composant « dumb » : il affiche un vol, sans savoir s'il est en cours
 * de réservation, réservé ou annulé. Pas de store, pas de client.
 */
@Component({
  selector: 'app-flight-card',
  imports: [DatePipe],
  template: `
    <article class="card" [class.selected]="selected()">
      <h3>{{ route(item()) }}</h3>
      <p>Vol #{{ item().id }} · {{ item().date | date: 'short' }}</p>
      @if (item().delayed) {
        <p class="delayed">Retardé</p>
      }
      @if (selectable()) {
        <label>
          <input type="checkbox" [checked]="selected()" (change)="selected.set(!selected())" />
          Sélectionner
        </label>
      }
    </article>
  `,
  styles: `
    .card { border: 1px solid #d1d5db; border-radius: 8px; padding: 12px; margin: 8px 0; }
    .selected { border-color: #2563eb; background: #eff6ff; }
    .delayed { color: #b45309; font-weight: 600; }
    h3 { margin: 0 0 4px; }
  `,
})
export class FlightCard {
  readonly item = input.required<Flight>();
  readonly selectable = input(false);
  readonly selected = model(false);

  protected route(f: Flight): string {
    return formatRoute(f.from, f.to);
  }
}
