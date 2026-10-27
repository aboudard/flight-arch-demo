import { Component, input } from '@angular/core';

/**
 * En-tête d'écran réutilisable (composant « dumb ») : titre, explication et
 * emplacement dans l'architecture, pour rendre la démo lisible à l'écran.
 */
@Component({
  selector: 'app-page-header',
  template: `
    <header class="page-header">
      <p class="context">
        @if (step()) {
          <span class="step">{{ step() }}</span>
        }
        Domaine <code>{{ domain() }}</code> · <code>{{ feature() }}</code>
      </p>
      <h2>{{ heading() }}</h2>
      <p class="lead">{{ description() }}</p>
    </header>
  `,
  styles: `
    .page-header { margin-bottom: 16px; }
    .context { margin: 0; font-size: 0.8rem; color: #4b5563; }
    .step { font-weight: 700; color: #1d4ed8; margin-right: 8px; }
    h2 { margin: 4px 0; }
    .lead { margin: 0; color: #374151; }
    code { background: #f3f4f6; padding: 0 4px; border-radius: 4px; }
  `,
})
export class PageHeader {
  readonly heading = input.required<string>();
  readonly description = input.required<string>();
  readonly domain = input.required<string>();
  readonly feature = input.required<string>();
  readonly step = input<string>();
}
