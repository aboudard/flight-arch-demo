import { Component, computed, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'success' | 'warning';

/** Composant « dumb » réutilisable : aucune connaissance du cas d'usage. */
@Component({
  selector: 'app-status-badge',
  template: `<span class="badge" [class]="toneClass()">{{ label() }}</span>`,
  styles: `
    .badge { padding: 2px 8px; border-radius: 999px; font-size: 0.8rem; }
    .neutral { background: #e5e7eb; color: #111827; }
    .success { background: #d1fae5; color: #065f46; }
    .warning { background: #fef3c7; color: #92400e; }
  `,
})
export class StatusBadge {
  readonly label = input.required<string>();
  readonly tone = input<BadgeTone>('neutral');
  protected readonly toneClass = computed(() => `badge ${this.tone()}`);
}
