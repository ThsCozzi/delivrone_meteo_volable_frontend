<script setup lang="ts">
const sections = [
  { id: 'principe', label: 'Principe général' },
  { id: 'sites', label: 'Créer un site' },
  { id: 'lignes', label: 'Créer une ligne' },
  { id: 'profil', label: 'Profil de mission (MC/FW)' },
  { id: 'analyse', label: "Lancer une analyse" },
  { id: 'resultats', label: 'Comprendre les résultats' },
  { id: 'causes', label: 'Les causes de non-volabilité' },
  { id: 'drones', label: 'Drones et batteries' },
]
</script>

<template>
  <div>
    <h1 class="h4">Aide</h1>
    <p class="text-muted">
      Comment fonctionne l'outil et comment interpréter les résultats.
    </p>

    <nav class="mb-4">
      <ul class="list-inline">
        <li v-for="s in sections" :key="s.id" class="list-inline-item me-3">
          <a :href="`#${s.id}`" class="small">{{ s.label }}</a>
        </li>
      </ul>
    </nav>

    <div class="card p-3 mb-3" id="principe">
      <h2 class="h6">Principe général</h2>
      <p>
        L'outil détermine, pour une liaison entre deux sites (généralement deux hôpitaux), quelle proportion
        des heures passées auraient été "volables" — c'est-à-dire compatibles avec un vol de mission — en
        comparant la météo historique réelle (source
        <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a>) aux limites
        opérationnelles du drone (vent, pluie, température, givrage) et à l'autonomie batterie disponible pour
        le trajet.
      </p>
      <p class="mb-0">
        Chaque heure de la période choisie est évaluée indépendamment. Le résultat n'est donc pas une
        prévision, mais un indicateur statistique : "sur les 2 dernières années par exemple, cette ligne aurait
        été volable X % du temps".
      </p>
    </div>

    <div class="card p-3 mb-3" id="sites">
      <h2 class="h6">Créer un site</h2>
      <p>Dans l'onglet <strong>Sites</strong>, cliquez sur "+ Nouveau site" et renseignez :</p>
      <ul>
        <li><strong>Nom</strong> — le nom du site (hôpital, clinique...).</li>
        <li><strong>Latitude / Longitude</strong> — coordonnées GPS, en degrés décimaux (ex. <code>48.858370</code>, pas de degrés/minutes/secondes). 6 décimales maximum.</li>
      </ul>
      <p class="mb-0">
        Une fois des coordonnées valides saisies, une vue satellite 1 km × 1 km s'affiche pour confirmer visuellement
        la position. Vous pouvez glisser le point rouge sur la carte pour ajuster précisément l'emplacement — les
        champs latitude/longitude se mettent à jour automatiquement.
      </p>
    </div>

    <div class="card p-3 mb-3" id="lignes">
      <h2 class="h6">Créer une ligne</h2>
      <p>
        Dans l'onglet <strong>Lignes</strong>, cliquez sur "+ Nouvelle ligne", choisissez le site d'origine et le
        site de destination (déjà créés), puis renseignez le profil de mission initial (voir ci-dessous). La
        distance à vol d'oiseau et le cap (aller/retour) sont calculés automatiquement à partir des coordonnées
        GPS des deux sites.
      </p>
      <p class="mb-0">
        Sur le tableau des lignes, cliquer sur une ligne ouvre sa fiche détaillée (profil de mission + analyse).
        Le bouton poubelle supprime la ligne (et son historique d'analyses).
      </p>
    </div>

    <div class="card p-3 mb-3" id="profil">
      <h2 class="h6">Profil de mission (MC/FW)</h2>
      <p>
        Sur la fiche d'une ligne, la carte "Profil de mission" permet de régler comment le drone parcourt
        réellement le trajet — ces réglages s'appliquent à la ligne (pas à une analyse en particulier) et
        servent au calcul de consommation batterie :
      </p>
      <ul>
        <li>
          <strong>MC côté origine / MC côté destination (km)</strong> — la portion du trajet volée en mode
          multicoptère (décollage/atterrissage vertical) à chaque extrémité, avant/après la croisière en
          voilure fixe.
        </li>
        <li>
          <strong>Distance voilure fixe personnalisée</strong> — par défaut, la distance parcourue en voilure
          fixe est calculée automatiquement (distance à vol d'oiseau moins les deux segments multicoptère). Si
          le trajet réel n'est pas direct (contournement d'obstacle, zone interdite, détour imposé...), cochez
          cette case et saisissez la distance réellement parcourue en voilure fixe.
        </li>
      </ul>
      <p class="mb-0">
        N'oubliez pas de cliquer sur <strong>Enregistrer</strong> — ces réglages sont pris en compte
        automatiquement à chaque lancement d'analyse, mais uniquement s'ils ont été sauvegardés.
      </p>
    </div>

    <div class="card p-3 mb-3" id="analyse">
      <h2 class="h6">Lancer une analyse</h2>
      <p>Sur la fiche d'une ligne, choisissez :</p>
      <ul>
        <li>
          <strong>Du / Au</strong> — la période historique à analyser. Par défaut, la date de fin est fixée à
          10 jours avant aujourd'hui (le temps que les données météo historiques soient consolidées) et la date
          de début à 2 ans avant cette date de fin.
        </li>
        <li><strong>Drone</strong> — le modèle de drone utilisé pour l'analyse (spécifications, seuils go/no-go).</li>
        <li>
          <strong>Batterie</strong> — le pack batterie utilisé (Delivrone dispose de packs 22000/25500/32000 mAh) ;
          la liste se met à jour selon le drone choisi.
        </li>
      </ul>
      <p class="mb-0">
        Cliquer sur <strong>Lancer l'analyse</strong> récupère la météo historique des deux sites, calcule le
        go/no-go heure par heure sur toute la période, et enregistre le résultat (l'historique des analyses
        précédentes reste consultable — changer les réglages d'un drone ne modifie pas les analyses déjà faites).
      </p>
    </div>

    <div class="card p-3 mb-3" id="resultats">
      <h2 class="h6">Comprendre les résultats</h2>
      <ul>
        <li><strong>% volable</strong> — proportion des heures de la période où le vol aurait été possible, aller et retour confondus (une heure ne compte "volable" que si les deux sens le sont).</li>
        <li><strong>Heures volables / non volables / analysées</strong> — décompte brut sur la période choisie.</li>
        <li><strong>Créneaux volables (camembert)</strong> — même information que le % global, sous forme visuelle.</li>
        <li><strong>Causes de non-volabilité</strong> — voir section suivante.</li>
        <li>
          <strong>% volable par créneau</strong> — la journée est découpée en 4 tranches de 6h (Fin de nuit 0-6h,
          Matin 6-12h, Après-midi 12-18h, Début de nuit 18-24h), pour repérer les moments de la journée les plus
          favorables.
        </li>
      </ul>
      <p class="mb-0">
        Sur le tableau des lignes, "Pas encore analysée" signifie qu'aucune analyse n'a jamais été lancée pour
        cette ligne.
      </p>
    </div>

    <div class="card p-3 mb-3" id="causes">
      <h2 class="h6">Les causes de non-volabilité</h2>
      <p>Chaque heure non volable peut être due à une ou plusieurs causes, <strong>non exclusives entre elles</strong> (une heure peut cumuler plusieurs causes en même temps, donc la somme des causes peut dépasser le nombre d'heures non volables) :</p>
      <ul>
        <li><strong>Vent</strong> — vitesse du vent au-dessus du seuil maximal du drone.</li>
        <li><strong>Pluie</strong> — précipitations au-dessus du seuil maximal.</li>
        <li><strong>Temp. min / Temp. max</strong> — température extérieure hors de la plage opérationnelle.</li>
        <li><strong>Givrage</strong> — conditions proches de la saturation en air froid (le drone ne détecte pas le givre en vol, donc le vol y est strictement interdit dès que les conditions s'en approchent).</li>
        <li>
          <strong>Batterie</strong> — la consommation estimée pour le trajet (décollage/atterrissage en
          multicoptère + croisière en voilure fixe, vent de face inclus) dépasserait la capacité utilisable de
          la batterie choisie. Cette capacité utilisable tient compte du seuil réglementaire d'atterrissage (le
          drone doit se poser avec un minimum de batterie restante) et d'une réserve d'urgence supplémentaire,
          réglable par drone, pour pouvoir revenir en multicoptère au rallypoint précédent en cas de problème.
        </li>
      </ul>
      <p class="mb-0">
        La batterie est évaluée indépendamment pour l'aller et pour le retour (le drone est supposé pouvoir
        recharger ou échanger sa batterie entre les deux trajets).
      </p>
    </div>

    <div class="card p-3 mb-3" id="drones">
      <h2 class="h6">Drones et batteries</h2>
      <p>
        Dans l'onglet <strong>Drones</strong>, vous pouvez créer/modifier un modèle de drone : poids, vitesses,
        seuils go/no-go (vent, pluie, température, givrage), caractéristiques batterie (tension, courants de
        croisière/multicoptère) et la distance de réserve d'urgence. Chaque drone peut avoir plusieurs packs
        batterie associés (capacité en mAh), l'un d'eux pouvant être marqué "par défaut".
      </p>
      <p class="mb-0">
        Ces réglages sont ceux utilisés par défaut lors d'une analyse, mais peuvent être surchargés
        ponctuellement (drone et batterie) au moment de lancer une analyse sur une ligne.
      </p>
    </div>
  </div>
</template>
