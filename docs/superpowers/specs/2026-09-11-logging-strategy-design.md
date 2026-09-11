# Design Document: Stratégie de Logging JSON pour Elasticsearch

**Date:** 2026-09-11  
**Projet:** MicroCRM - Partie 2 (Monitoring & KPI)  
**Auteur:** Claude Haiku 4.5  
**Statut:** Design Phase

---

## 1. Vue d'ensemble

### Objectif
Implémenter un système de logging structuré en JSON pour centraliser les logs du backend Spring Boot dans Elasticsearch via Logstash, afin de visualiser les erreurs, tendances et performances de l'application dans Kibana.

### Scope
- Logs du backend Spring Boot (Java 17, Spring Boot 3.2.5)
- Format JSON structuré
- Transmission via TCP à Logstash (port 5044)
- Indexation dans Elasticsearch
- Visualisation dans Kibana
- **Ne pas inclure** : logs frontend (hors scope pour cette phase)

### Critères de Succès
1. Les logs du backend remontent en JSON dans Elasticsearch
2. Au moins 3 types d'événements loggés : HTTP, Exceptions, Événements métier
3. Dashboard Kibana affichant erreurs, volume, fréquence, tendances
4. Données disponibles pour calculer les KPI et métriques DORA

---

## 2. Architecture

### 2.1 Flux de données

```
Backend (SLF4J)
    ↓
Logback (JSON via logstash-logback-encoder)
    ↓
TCP Socket (port 5044)
    ↓
Logstash (parse & enrich)
    ↓
Elasticsearch (indexation avec date)
    ↓
Kibana (visualization)
```

### 2.2 Composants à créer

| Composant | Rôle | Localisation |
|-----------|------|---|
| **logback-spring.xml** | Configuration Logback avec encodeur JSON | `back/src/main/resources/` |
| **HttpLoggingInterceptor.java** | Intercepte chaque requête HTTP | `back/src/main/java/.../interceptor/` |
| **GlobalExceptionHandler.java** | Intercepte les exceptions globales | `back/src/main/java/.../exception/` |
| **AuditLogger.java** | Logger pour événements métier (CRUD) | `back/src/main/java/.../audit/` |
| **build.gradle** | Ajouter dépendance logstash-logback-encoder | `back/` |

### 2.3 Dépendances à ajouter

```gradle
implementation 'net.logstash.logback:logstash-logback-encoder:7.4'
```

(Logback est déjà inclus via Spring Boot)

---

## 3. Format des logs

### 3.1 Structure JSON commune

Chaque log envoyé à Logstash aura cette structure minimale :

```json
{
  "@timestamp": "2026-09-11T17:30:45.123Z",
  "level": "INFO",
  "logger": "com.openclassroom.devops.orion.microcrm.HttpLoggingInterceptor",
  "message": "HTTP request processed",
  "app": "microcrm",
  "environment": "local",
  "event_type": "http_request"
}
```

### 3.2 Types d'événements et champs

#### **Type 1 : HTTP Request** (`event_type: "http_request"`)
```json
{
  "event_type": "http_request",
  "http": {
    "method": "POST",
    "path": "/organizations",
    "status": 201,
    "duration_ms": 145,
    "request_size": 256,
    "response_size": 512
  }
}
```

#### **Type 2 : Exception** (`event_type: "error"`)
```json
{
  "event_type": "error",
  "level": "ERROR",
  "exception": {
    "type": "NullPointerException",
    "message": "Cannot invoke method on null",
    "stacktrace": "..."
  },
  "http": {
    "method": "GET",
    "path": "/persons/999",
    "status": 500
  }
}
```

#### **Type 3 : Événement métier** (`event_type: "audit"`)
```json
{
  "event_type": "audit",
  "audit": {
    "action": "CREATE",
    "entity_type": "Person",
    "entity_id": 42,
    "details": "Created person: John Doe (john@example.com)"
  }
}
```

---

## 4. Implémentation détaillée

### 4.1 HttpLoggingInterceptor

**Rôle :** Intercepter chaque requête HTTP et logger automatiquement.

**Implémentation :**
- Impl. `HandlerInterceptor` de Spring
- Hook `preHandle()` : capture method, path, timestamp
- Hook `afterCompletion()` : capture status, duration, response size
- Encode en JSON via Logback

**Logs générés :** 1 log par requête HTTP

**Exemple :**
```
POST /organizations → 201 Created (125ms)
GET /persons/1 → 200 OK (45ms)
DELETE /organizations/2 → 204 No Content (30ms)
GET /persons/999 → 404 Not Found (10ms)
```

---

### 4.2 GlobalExceptionHandler

**Rôle :** Centraliser la gestion des erreurs et logger chaque exception.

**Implémentation :**
- Classe annotée `@ControllerAdvice`
- Méthodes `@ExceptionHandler` pour les types d'exception communs
- Chaque handler log l'erreur avec stacktrace (niveau ERROR)

**Exceptions gérées :**
- `EntityNotFoundException` (404)
- `DataIntegrityViolationException` (DB constraint)
- `MethodArgumentNotValidException` (validation)
- `Exception` (catchall)

**Logs générés :** 1 log par erreur levée

---

### 4.3 AuditLogger

**Rôle :** Logger les événements métier critiques (CRUD operations).

**Implémentation :**
- Classe utilitaire avec méthodes statiques
- Appelée manuellement dans les services ou repositories
- Logs create, update, delete d'entities

**Points d'injection :**
- **PersonRepository** : après save/delete
- **OrganizationRepository** : après save/delete
- **Ou** via AOP sur les méthodes du repository

**Logs générés :** 1 log par opération métier critique

**Exemple :**
```
CREATE Person id=42: John Doe (john@example.com)
DELETE Person id=42
UPDATE Organization id=5: Added 3 persons
```

---

### 4.4 Configuration Logback (logback-spring.xml)

**Stratégie :**
1. Appender **Console** pour debug local (format lisible)
2. Appender **Logstash** pour production (JSON via TCP)
3. Root logger : niveau INFO

**Configuration :**
```xml
<configuration>
  <!-- Console appender (local dev) -->
  <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
      <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
    </encoder>
  </appender>

  <!-- Logstash appender (TCP to Logstash) -->
  <appender name="LOGSTASH" class="net.logstash.logback.appender.LogstashTcpSocketAppender">
    <destination>localhost:5044</destination>
    <encoder class="net.logstash.logback.encoder.LogstashEncoder" />
  </appender>

  <!-- Root logger -->
  <root level="INFO">
    <appender-ref ref="CONSOLE" />
    <appender-ref ref="LOGSTASH" />
  </root>
</configuration>
```

---

### 4.5 Ajustements Logstash (logstash.conf)

**Modification mineure :**
- Parser JSON du backend (déjà en place)
- Ajouter champs enrichis : `app: "microcrm"`, `environment: "local"`

```conf
filter {
  if [type] == "backend" {
    mutate {
      add_field => { 
        "app" => "microcrm"
        "environment" => "local"
      }
    }
  }
}
```

---

## 5. Dashboard Kibana

### 5.1 Visualisations requises

1. **Comptage des erreurs** (par type, par endpoint)
   - Filtre : `level: ERROR`
   - Affichage : bar chart par `exception.type`

2. **Volume de requêtes** (par endpoint)
   - Filtre : `event_type: "http_request"`
   - Affichage : bar chart par `http.path`

3. **Fréquence des événements** (au fil du temps)
   - Timeseries : nombre de logs par minute/heure

4. **Durée moyenne des requêtes** (par endpoint)
   - Stat : avg(`http.duration_ms`) groupé par `http.path`

5. **Taux d'erreur HTTP** (par statut)
   - Pie chart : distribution des status codes (200, 201, 404, 500, etc.)

### 5.2 Index pattern
- Pattern : `microcrm-logs-*`
- Field : `@timestamp`

---

## 6. KPI et Métriques DORA

### 6.1 Utilisation des logs pour les KPI

| Métrique | Source dans les logs | Calcul |
|----------|----------------------|--------|
| **Lead Time for Changes** | `http.duration_ms` | Durée moyenne des requêtes POST/PUT/DELETE |
| **Deployment Frequency** | Volume de logs avant/après déploiement | Comptage requêtes par période |
| **Change Failure Rate** | `level: ERROR` ou `http.status: 5xx` | % d'erreurs / total requêtes |
| **MTTR** | Timestamp du premier ERROR jusqu'à résolution | Temps entre première erreur et recovery |

### 6.2 KPI supplémentaires
- Requêtes par endpoint
- Temps de réponse par endpoint
- Erreurs par type
- Fréquence des événements métier (create/update/delete)

---

## 7. Cas d'usage et scénarios testés

### Scénario 1 : Requête HTTP normale
- Frontend appelle `POST /persons`
- Backend reçoit, traite, répond 201
- Log généré : HTTP request (durée, taille, status)

### Scénario 2 : Erreur métier (validation)
- Frontend appelle `POST /persons` avec email invalide
- Backend lève `MethodArgumentNotValidException`
- Log généré : HTTP + Exception (500, type validation)

### Scénario 3 : Entité non trouvée
- Frontend appelle `GET /persons/999`
- Backend lève `EntityNotFoundException`
- Log généré : HTTP (404) + Exception

### Scénario 4 : Création d'entité (audit)
- Frontend crée une Person via `POST /persons`
- AuditLogger enregistre : `CREATE Person id=42`
- Log généré : Audit event

---

## 8. Points de vigilance

### ⚠️ Sécurité
- Ne pas logger les mots de passe, tokens, données sensibles
- Données personnelles (email, phone) : à considérer selon RGPD

### ⚠️ Performance
- Logstash: vérifier queue size (ne pas surcharger TCP)
- Elasticsearch: vérifier l'espace disque (retention policy)
- Logback: async appender si performance critique

### ⚠️ Maintenance
- Monitorer la connexion TCP Logstash (peut être interrompue)
- Logs locaux en fallback si Logstash indisponible

---

## 9. Dépendances et prérequis

### Versions
- Spring Boot: 3.2.5 ✅ (déjà en place)
- Java: 17+ ✅ (déjà en place)
- Logstash: 8.11.0 ✅ (déjà en place)
- Elasticsearch: 8.11.0 ✅ (déjà en place)
- Kibana: 8.11.0 ✅ (déjà en place)

### Nouveaux outils
- logstash-logback-encoder: 7.4

---

## 10. Plan d'implémentation (ordre)

1. Ajouter dépendance `logstash-logback-encoder` au build.gradle
2. Créer `logback-spring.xml` avec appenders
3. Créer `HttpLoggingInterceptor.java`
4. Créer `GlobalExceptionHandler.java`
5. Créer `AuditLogger.java`
6. Ajouter AuditLogger aux repositories (Person, Organization)
7. Tester localement (vérifier logs dans Kibana)
8. Créer dashboard Kibana avec 5 visualisations
9. Valider les données pour KPI/DORA

---

## 11. Résultat attendu

✅ Backend génère logs JSON structurés  
✅ Logs remontent automatiquement dans Elasticsearch  
✅ Dashboard Kibana affiche erreurs, volume, tendances  
✅ Données disponibles pour KPI et métriques DORA  
✅ Évaluation mission : Étape 1 validée ✓

---

**Prochaines étapes :** Invoquer skill `writing-plans` pour plan d'implémentation détaillé.
