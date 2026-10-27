import { Component, inject } from '@angular/core';
import { PageHeader } from '../../shared/ui-design/page-header';
import { BadgeTone, StatusBadge } from '../../shared/ui-design/status-badge';
// ❌ Démo Sheriff : contourne l'API publique du domaine ticketing (dossier interne type:util).
// Version conforme : import { formatRoute } from '../../ticketing/api/ticketing-api';
import { formatRoute } from '../../ticketing/util-format/format-route';
import { LuggageStatus } from '../data/luggage';
import { LuggageStore } from './luggage-store';

const STATUS: Record<LuggageStatus, { label: string; tone: BadgeTone }> = {
  'checked-in': { label: 'Enregistré', tone: 'warning' },
  loaded: { label: 'Chargé en soute', tone: 'success' },
};

/** Écran agent d'aéroport — un autre domaine métier, alimenté par les réservations. */
@Component({
  selector: 'app-luggage-list-page',
  imports: [PageHeader, StatusBadge],
  providers: [LuggageStore],
  template: `
    <app-page-header
      heading="Bagages (agent d'aéroport)"
      description="Un autre métier, un autre domaine : l'agent charge en soute les bagages déclarés lors des réservations. Le domaine luggage lit ces réservations via l'API publique du domaine ticketing."
      domain="luggage"
      feature="feature-luggage"
    />

    @if (store.loading()) {
      <p>Chargement…</p>
    }
    <table>
      <thead>
        <tr><th>Passager</th><th>Vol</th><th>Bagage</th><th>Statut</th><th></th></tr>
      </thead>
      <tbody>
        @for (item of store.items(); track item.id) {
          <tr>
            <td>{{ item.passenger }}</td>
            <td>{{ route(item.flight.from, item.flight.to) }}</td>
            <td>{{ item.label }}</td>
            <td><app-status-badge [label]="status[item.status].label" [tone]="status[item.status].tone" /></td>
            <td>
              @if (item.status === 'checked-in') {
                <button type="button" (click)="store.markLoaded(item.id)">Charger en soute</button>
              }
            </td>
          </tr>
        } @empty {
          <tr><td colspan="5">Aucun bagage. Réservez un vol avec au moins un bagage en soute.</td></tr>
        }
      </tbody>
    </table>
  `,
  styles: `
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
  `,
})
export class LuggageListPage {
  protected readonly store = inject(LuggageStore);
  protected readonly status = STATUS;
  protected readonly route = formatRoute;
}
