import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'flight-search' },
  {
    path: 'flight-search',
    loadComponent: () =>
      import('./domains/ticketing/feature-booking/flight-search/flight-search').then(
        (m) => m.FlightSearch,
      ),
  },
  {
    path: 'booking',
    loadComponent: () =>
      import('./domains/ticketing/feature-booking/flight-booking/flight-booking-page').then(
        (m) => m.FlightBookingPage,
      ),
  },
  {
    path: 'my-tickets',
    loadComponent: () =>
      import('./domains/ticketing/feature-my-tickets/my-tickets-page').then((m) => m.MyTicketsPage),
  },
  {
    path: 'luggage',
    loadComponent: () =>
      import('./domains/luggage/feature-luggage/luggage-list-page').then((m) => m.LuggageListPage),
  },
];
