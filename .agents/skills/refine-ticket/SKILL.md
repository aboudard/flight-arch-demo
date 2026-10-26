---
name: refine-ticket
description: Affiner un ticket du dossier tickets/ avant son implémentation autonome (AFK) en posant des questions jusqu'à compréhension partagée, puis consigner les décisions dans le ticket. À utiliser quand l'utilisateur dit « refine ticket NNN » ou demande de préparer un ticket pour la boucle Sandcastle.
---

# Affiner un ticket (inspiré du skill « grill me » de Matt Pocock)

Objectif : qu'aucune question ne reste ouverte quand l'agent travaillera seul.

1. Lis le ticket `tickets/NNN-*.md` (story, scope, critères d'acceptation).
2. Lis `AGENTS.md`, puis les documents d'architecture pertinents qu'il référence.
3. Vérifie la faisabilité au regard des règles :
   - si le ticket viole une règle d'architecture → explique pourquoi, propose une alternative
     conforme, et NE modifie PAS le code ;
   - si plusieurs options conformes existent (ex. API de domaine vs `shared`) → pose la question.
4. Pose tes questions une par une, avec ta recommandation, jusqu'à ce qu'il n'y ait plus d'ambiguïté.
5. Écris les réponses dans la section `## Décisions` du ticket et passe `status: ready`.

Ne commence jamais l'implémentation dans ce skill.
