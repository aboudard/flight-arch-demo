# Domaine `luggage`

Suivi des bagages enregistrés.

- `feature-luggage` : `luggage-list-page` + `luggage-store` (fourni au niveau du composant).
- `data` : `LuggageClient`, modèle `Luggage`.
- Dépend de `ticketing` **uniquement via** `domains/ticketing/api/ticketing-api.ts`.

Vocabulaire : pour ce domaine, un vol n'est qu'une **référence** (trajet, date) attachée au bagage.
