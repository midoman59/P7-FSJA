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
