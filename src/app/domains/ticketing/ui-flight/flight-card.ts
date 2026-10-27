import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { Flight } from '../data/flight';
import { formatRoute } from '../util-format/format-route';

/**
 * Composant « dumb » : il affiche un vol, sans savoir s'il est recherché,
 * en cours de réservation ou déjà réservé. Les actions (boutons, détails du
 * billet…) sont projetées par le composant parent via <ng-content>.
 */
@Component({
  selector: 'app-flight-card',
  imports: [DatePipe],
  template: `
    <article class="card" [class.highlight]="highlight()">
      <div class="info">
        <h3>{{ route(item()) }}</h3>
        <p>
          Vol n°{{ item().id }} · {{ item().date | date: 'EEEE d MMMM, HH:mm' }}
          @if (item().delayed) {
            · <span class="delayed">retardé</span>
          }
        </p>
      </div>
      <div class="extra"><ng-content /></div>
    </article>
  `,
  styles: `
    .card { display: flex; justify-content: space-between; align-items: center; gap: 12px;
            border: 1px solid #d1d5db; border-radius: 8px; padding: 12px; margin: 8px 0; }
    .highlight { border-color: #16a34a; background: #f0fdf4; }
    h3 { margin: 0 0 4px; }
    p { margin: 0; }
    .delayed { color: #b45309; font-weight: 600; }
  `,
})
export class FlightCard {
  readonly item = input.required<Flight>();
  readonly highlight = input(false);

  protected route(f: Flight): string {
    return formatRoute(f.from, f.to);
  }
}
