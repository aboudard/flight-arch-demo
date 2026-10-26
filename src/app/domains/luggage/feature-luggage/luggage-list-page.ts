import { Component, inject } from '@angular/core';
import { BadgeTone, StatusBadge } from '../../shared/ui-design/status-badge';
// ✅ Accès autorisé à un autre domaine : uniquement via son API publique.
import { formatRoute } from '../../ticketing/api/ticketing-api';
import { LuggageStatus } from '../data/luggage';
import { LuggageStore } from './luggage-store';

const TONES: Record<LuggageStatus, BadgeTone> = {
  'checked-in': 'neutral',
  loaded: 'success',
  lost: 'warning',
};

@Component({
  selector: 'app-luggage-list-page',
  imports: [StatusBadge],
  providers: [LuggageStore],
  template: `
    <h2>Bagages</h2>
    @if (store.loading()) {
      <p>Chargement…</p>
    }
    <ul>
      @for (item of store.items(); track item.id) {
        <li>
          {{ item.passenger }} · {{ item.weightKg }} kg ·
          {{ route(item.flight.from, item.flight.to) }}
          <app-status-badge [label]="item.status" [tone]="tones[item.status]" />
        </li>
      }
    </ul>
  `,
})
export class LuggageListPage {
  protected readonly store = inject(LuggageStore);
  protected readonly tones = TONES;
  protected readonly route = formatRoute;
}
