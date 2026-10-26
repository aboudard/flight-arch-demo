import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header>
      <h1>Flight Arch Demo</h1>
      <nav>
        <a routerLink="/flight-search" routerLinkActive="active">Recherche</a>
        <a routerLink="/booking-summary" routerLinkActive="active">Récapitulatif</a>
        <a routerLink="/my-tickets" routerLinkActive="active">Mes billets</a>
        <a routerLink="/luggage" routerLinkActive="active">Bagages</a>
      </nav>
    </header>
    <main><router-outlet /></main>
  `,
  styles: `
    :host { display: block; font-family: system-ui, sans-serif; max-width: 760px; margin: 0 auto; padding: 16px; }
    nav a { margin-right: 12px; }
    .active { font-weight: 700; }
  `,
})
export class App {}
