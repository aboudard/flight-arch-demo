# Domaine `ticketing`

Parcours du voyageur : rechercher un vol, le réserver pour un passager, consulter ses billets.

- `feature-booking` :
  - écran 1, recherche : `flight-search` + `flight-store` + `flight-client` (catalogue de vols,
    utilisé par cette seule feature, donc local) ;
  - écran 2, réservation d'un vol : `flight-booking-page` + `booking-coordinator`, qui orchestre
    `flight-store` (vol choisi) et `passenger-store` (passager, bagages, enregistrement).
- `feature-my-tickets` : écran 3, liste des billets (`my-tickets-page` + `ticket-store`, fourni au
  niveau du composant).
- `data` : `TicketClient` et les modèles `Flight`, `Ticket`, partagés par les deux features.
- `ui-flight` : `FlightCard` (dumb), utilisé par les trois écrans.
- `api` : expose `Flight`, `Ticket` (types), `TicketClient` et `formatRoute` au domaine luggage.

Vocabulaire : un **Flight** ici = une offre réservable (date, trajet, retard) ; un **Ticket** = un
vol réservé pour un passager, avec un nombre de bagages en soute.
