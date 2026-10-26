# Domaine `ticketing`

Recherche de vols, réservation, billets du passager.

- `feature-booking` : recherche (`flight-search`), sélection (`flight-store`), passager
  (`passenger-store`), récapitulatif (`booking-summary-page` + `booking-summary-coordinator`).
- `feature-my-tickets` : liste des billets (`ticket-store`, fourni au niveau du composant).
- `data` : `FlightClient` et le modèle `Flight` — partagés par les deux features.
- `ui-flight` : `FlightCard` (dumb).
- `api` : expose `Flight` (type), `FlightCard`, `formatRoute` aux autres domaines.

Vocabulaire : un **Flight** ici = une offre réservable (date, trajet, retard).
