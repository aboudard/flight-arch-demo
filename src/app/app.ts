import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header>
      <h1>Flight Arch Demo</h1>
      <nav>
        <span class="group">Voyageur (domaine ticketing) :</span>
        <a routerLink="/flight-search" routerLinkActive="active">1. Rechercher</a>
        <a routerLink="/booking" routerLinkActive="active">2. Réserver</a>
        <a routerLink="/my-tickets" routerLinkActive="active">3. Mes billets</a>
        <span class="group">Aéroport (domaine luggage) :</span>
        <a routerLink="/luggage" routerLinkActive="active">Bagages</a>
      </nav>
    </header>
    <main><router-outlet /></main>
  `,
  styles: `
    :host { display: block; font-family: system-ui, sans-serif; max-width: 820px; margin: 0 auto; padding: 16px; }
    h1 { margin-bottom: 8px; }
    nav { display: flex; flex-wrap: wrap; gap: 12px; align-items: baseline;
          padding-bottom: 12px; margin-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
    .group { font-size: 0.8rem; color: #6b7280; margin-left: 8px; }
    .group:first-child { margin-left: 0; }
    .active { font-weight: 700; }
  `,
})
export class App {}
