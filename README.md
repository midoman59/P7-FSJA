<p align="center">
   <img src="./front/src/favicon.png" width="192px" />
</p>

# MicroCRM (P7 - Développeur Full-Stack - Java et Angular - Mettez en œuvre l'intégration et le déploiement continu d'une application Full-Stack)

MicroCRM est une application de démonstration basique ayant pour être objectif de servir de socle pour le module "P7 - Développeur Full-Stack".

L'application MicroCRM est une implémentation simplifiée d'un ["CRM" (Customer Relationship Management)](https://fr.wikipedia.org/wiki/Gestion_de_la_relation_client). Les fonctionnalités sont limitées à la création, édition et la visualisations des individus liés à des organisations.

![Page d'accueil](./misc/screenshots/screenshot_1.png)
![Édition de la fiche d'un individu](./misc/screenshots/screenshot_2.png)

## Versions et Configuration

| Composant | Version | Notes |
|-----------|---------|-------|
| **Backend** | Spring Boot 3.2.5 | Java 17 (build), JRE 21 (runtime) |
| **Frontend** | Angular 17.3.0 | TypeScript 5.4.2 |
| **Node.js** | 20.x+ (recommandé) | npm 10.x+ |
| **Docker** | 20.x+ | Alpine 3.19, Caddy, Supervisor |
| **Gradle** | 8.7 (wrapper) | Wrapper inclus, pas d'install global nécessaire |

### Ports d'Application

- **Frontend** (développement) : http://localhost:4200
- **Frontend** (production Docker) : https://localhost
- **Backend API** : http://localhost:8080/api/

## Code source

### Organisation

Ce [monorepo](https://en.wikipedia.org/wiki/Monorepo) contient les 2 composantes du projet "MicroCRM":

- La partie serveur (ou "backend"), en Java SpringBoot 3;
- La partie cliente (ou "frontend"), en Angular 17.

### Démarrer avec les sources

#### Serveur

##### Dépendances

- [OpenJDK >= 17](https://openjdk.org/)

##### Procédure

1. Se positionner dans le répertoire `back` avec une invite de commande:

   ```shell
   cd back
   ```

2. Construire le JAR:

   ```shell
   # Sur Linux
   ./gradlew build

   # Sur Windows
   ./gradlew.bat build
   ```

3. Démarrer le service:

   ```shell
   java -jar build/libs/microcrm-0.0.1-SNAPSHOT.jar
   ```

Puis ouvrir l'URL http://localhost:8080 dans votre navigateur.

#### Client

##### Dépendances

- [NPM >= 10.2.4](https://www.npmjs.com/)

##### Procédure

1. Se positionner dans le répertoire `front` avec une invite de commande:

   ```shell
   cd front
   ```

2. (La première fois seulement) Installer les dépendances NodeJS:

   ```shell
   npm install
   ```

3. Démarrer le service de développement:

   ```shell
   npx @angular/cli serve
   ```

Puis ouvrir l'URL http://localhost:4200 dans votre navigateur.

### Exécution des tests

#### Client

**Dépendances**

- Google Chrome ou Chromium

Dans votre terminal:

```shell
cd front
$env:CHROME_BIN="C:\Program Files\Google\Chrome\Application\chrome.exe"
npm test
```

#### Serveur

Dans votre terminal:

```shell
cd back
./gradlew test
```

### Images Docker

#### Client

##### Construire l'image

```shell
docker build --target front -t orion-microcrm-front:latest .
```

##### Exécuter l'image

```shell
docker run -it --rm -p 80:80 -p 443:443 orion-microcrm-front:latest
```

L'application sera disponible sur https://localhost.

#### Serveur

##### Construire l'image

```shell
docker build --target back -t orion-microcrm-back:latest .
```

##### Exécuter l'image

```shell
docker run -it --rm -p 8080:8080 orion-microcrm-back:latest
```

L'API sera disponible sur http://localhost:8080.

#### Tout en un

```shell
docker build --target standalone -t orion-microcrm-standalone:latest .
```

##### Exécuter l'image

```shell
docker run -it --rm -p 8080:8080 -p 80:80 -p 443:443 orion-microcrm-standalone:latest
```

L'application sera disponible sur https://localhost et l'API sur http://localhost:8080.

### Docker Compose

Pour orchestrer les services frontend et backend ensemble localement :

#### Prérequis

- Docker 20.x+
- docker-compose 1.x+
- 2 GB RAM libre
- Ports 80, 443, 8080 disponibles

#### Démarrer les services

```shell
# Construire les images
docker-compose build

# Lancer les services
docker-compose up -d

# Vérifier le statut
docker-compose ps
```

#### Accéder à l'application

- **Frontend (HTTP)** : http://localhost (redirige automatiquement vers HTTPS)
- **Frontend (HTTPS)** : https://localhost (certificat auto-signé)
- **Backend API** : http://localhost:8080
- **API Endpoints** :
  - `/` : Racine avec HATEOAS links
  - `/persons` : Liste des personnes
  - `/organizations` : Liste des organisations
  - `/profile` : Profil API

#### Consulter les logs

```shell
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
```

#### Arrêter les services

```shell
docker-compose down
```

---

## CI/CD et Qualité

Cette application bénéficie d'une chaîne d'intégration et déploiement continu :

### GitHub Actions

Workflow automatisé à chaque push et pull request :

- **Build Backend** : `./gradlew build`
- **Test Backend** : JUnit 5 tests
- **Build Frontend** : `npm run build`
- **Test Frontend** : Karma/Jasmine tests (Chrome headless)
- **SonarQube Analysis** : Analyse de code et sécurité
- **Status Check** : Validation finale

📊 **Résultats** : https://github.com/midoman59/P7-FSJA/actions

### SonarQube Cloud

Analyse continue de qualité et sécurité du code :

- **Langage** : Java (backend), TypeScript (frontend)
- **Règles** : OWASP Top 10, Security Hotspots
- **Coverage** : Rapports de couverture de code
- **Grade** : A/B/C/D/E basé sur la qualité

📊 **Dashboard** : https://sonarcloud.io/projects/midoman59_P7-FSJA

### Secrets et Sécurité

- Tokens SonarQube : Stockés dans GitHub Secrets (masqués)
- Aucune fuite d'information sensible dans les logs
- Accès contrôlé via authentification GitHub

---

## 📊 Monitoring et Métriques (Partie 2)

### Stack ELK (Elasticsearch, Logstash, Kibana)

Monitoring local des logs et performances en temps réel :

#### Prérequis

- Docker 20.x+
- docker-compose 1.x+
- 4 GB RAM libre (Elasticsearch peut être gourmand)

#### Démarrer ELK Stack

```shell
# Lancer les services de monitoring
docker-compose -f docker-compose-elk.yml up -d

# Vérifier le statut
docker-compose -f docker-compose-elk.yml ps
```

#### Accéder à Kibana

- **URL** : http://localhost:5601
- **Prérequis** : Elasticsearch doit être prêt (attendre ~30-60 secondes au démarrage)
- **Data View** : `microcrm-logs` (créée automatiquement)

#### Consulter les Logs

1. Ouvrir http://localhost:5601 dans le navigateur
2. Aller à **Discover** → Sélectionner `microcrm-logs`
3. Voir les logs en temps réel avec filtre par niveau (INFO, WARN, ERROR)

#### Arrêter ELK Stack

```shell
docker-compose -f docker-compose-elk.yml down
```

### 📊 Métriques DORA - Calcul et Interprétation

L'application suit les **4 Métriques DORA** (industry standard DevOps) avec calcul et interprétation :

| Métrique | Comment Calculer | Exemple de Résultat | Interprétation |
|----------|------------------|--------------------|----|
| **Lead Time for Changes** | Timestamp commit → Timestamp workflow success (GitHub Actions) | < 5 min | Excellent : feedback très rapide |
| **Deployment Frequency** | Nombre de pushes/merges vers main par jour | À compter | À évaluer selon volumétrie |
| **Mean Time to Restore (MTTR)** | Temps PR bug creation → merge | À mesurer | Excellen < 1h, Bon 1-4h |
| **Change Failure Rate** | (Workflow failed / Workflow total) × 100% | **0%** ✅ | Excellent : aucun déploiement échoué |

**Infrastructure de Mesure** :
- GitHub Actions logs → Lead Time, CFR
- GitHub Issues/PR → MTTR (lors d'un bug)
- Naming/tagging → Deployment Frequency

### KPI Métier - Calcul et Interprétation

| KPI | Comment Mesurer | Valeur Actuelle | Cible | Interprétation |
|-----|-----------------|-----------------|-------|---|
| **SonarQube Grade** | Dashboard SonarQube Cloud | **A** ✅ | A/B | Très bonne qualité de code (Security Hotspots) |
| **Bugs Critique** | SonarQube dashboard | **0** ✅ | 0 | Excellent - aucun bug détecté |
| **Vulnérabilités CRITICAL/HIGH** | SonarQube dashboard | **0** ✅ | 0 | Excellent - zéro risque critique |
| **Vulnérabilités LOW** | SonarQube dashboard | **1** | À traiter | 1 Low only - à corriger (intégrité CDN) |
| **Code Coverage** | Rapports JaCoCo (backend) + Istanbul (frontend) | **0%** (à configurer) | > 60% | À mesurer et améliorer Partie 2 |
| **Build Success Rate** | GitHub Actions workflow success | **100%** ✅ | 100% | Excellent - tous les builds réussissent |

### Axes d'Amélioration Identifiés

| Point Critique | Détecté via | Action Proposée |
|---|---|---|
| **Couverture de tests faible** | SonarQube (0%) | Configurer JaCoCo + Istanbul en Partie 2 |
| **Accessibilité frontend** | SonarQube Code Smells | Fixer les labels HTML (WCAG) |
| **Vulnérabilité Low (CDN)** | SonarQube | Ajouter integrity check sur les ressources externes |

---

## 🚀 Démarrage Rapide (Complet)

### Option 1 : Développement Local (séparé)

```bash
# Terminal 1 - Backend
cd back
./gradlew.bat build
java -jar build/libs/microcrm-0.0.1-SNAPSHOT.jar

# Terminal 2 - Frontend
cd front
npm install
npx @angular/cli serve
```

### Option 2 : Docker Compose (Complet)

```bash
# Lancer application + monitoring
docker-compose up -d                      # Application (frontend + backend)
docker-compose -f docker-compose-elk.yml up -d  # Monitoring (ELK Stack)

# Accéder à l'application
# Frontend : https://localhost
# Backend API : http://localhost:8080
# Kibana : http://localhost:5601

# Arrêter
docker-compose down
docker-compose -f docker-compose-elk.yml down
```

### Option 3 : Tout en Une Seule Commande

```bash
# Démarrer application (construit + lance)
docker-compose up -d

# Vérifier les services
docker-compose ps

# Afficher les logs
docker-compose logs -f
```

---

## ✅ Vérification de Santé

```bash
# Health checks
curl https://localhost          # Frontend (accepte certificat auto-signé)
curl http://localhost:8080      # Backend API
curl http://localhost:8080/persons  # Données API

# Logs en temps réel
docker-compose logs -f backend
docker-compose logs -f frontend

# Monitoring (via ELK)
# Ouvrir http://localhost:5601 et aller à Discover
```

---

## 🔐 Sécurité

**Analyse continue** :
- SonarQube Cloud scanne chaque commit
- Zéro vulnérabilité critique/haute
- Grade B - Bonne sécurité
- Secrets GitHub : tokens masqués, jamais en clair

**Conformité** :
- OWASP Top 10 mapping
- 6/10 risques mitigés
- Roadmap d'amélioration pour les 4 restants

