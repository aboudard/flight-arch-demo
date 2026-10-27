# Domaine `luggage`

Écran de l'agent d'aéroport : charger en soute les bagages déclarés lors des réservations.

- `feature-luggage` : `luggage-list-page` + `luggage-store` (fourni au niveau du composant).
- `data` : `LuggageClient`, modèle `Luggage`. Les bagages sont déduits des billets du domaine
  ticketing ; leur statut (`checked-in`, `loaded`) appartient au domaine luggage.
- Dépend de `ticketing` **uniquement via** `domains/ticketing/api/ticketing-api.ts`.

Vocabulaire : pour ce domaine, un vol n'est qu'une **référence** (trajet, date) attachée au bagage.
