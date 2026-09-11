# Logging JSON pour Elasticsearch - Plan d'Implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implémenter un système de logging JSON structuré qui envoie automatiquement les logs du backend Spring Boot vers Elasticsearch via Logstash, pour visualiser erreurs, tendances et performances dans Kibana.

**Architecture:** Le backend génère des logs SLF4J structurés en JSON via Logback. Logback envoie les logs via TCP à Logstash (port 5044), qui parse et enrichit les données avant de les indexer dans Elasticsearch. Kibana récupère les logs pour créer des dashboards. Trois niveaux de logging : HTTP (interceptor), Exceptions (handler global), Événements métier (AuditLogger).

**Tech Stack:** 
- Spring Boot 3.2.5, Java 17
- SLF4J + Logback (déjà inclus)
- logstash-logback-encoder 7.4 (JSON encoding)
- Logstash 8.11.0 (TCP 5044)
- Elasticsearch 8.11.0
- Kibana 8.11.0

## Global Constraints

- Java 17+ minimum
- Spring Boot 3.2.5+
- Logstash 8.11.0+
- Format JSON structuré pour tous les logs
- Pas de logs sensibles (mots de passe, tokens)
- TCP port 5044 pour Logstash (ne pas modifier)

---

## File Structure

```
back/
├── build.gradle                                    (MODIFY: add dependency)
├── src/main/
│   ├── resources/
│   │   └── logback-spring.xml                      (CREATE: Logback config)
│   └── java/com/openclassroom/devops/orion/microcrm/
│       ├── MicroCRMApplication.java                (MODIFY: register interceptor)
│       ├── PersonRepository.java                   (MODIFY: add audit logging)
│       ├── OrganizationRepository.java             (MODIFY: add audit logging)
│       ├── interceptor/
│       │   └── HttpLoggingInterceptor.java         (CREATE: HTTP logging)
│       ├── exception/
│       │   └── GlobalExceptionHandler.java         (CREATE: Exception logging)
│       ├── config/
│       │   └── WebMvcConfig.java                   (CREATE: Interceptor registration)
│       ├── audit/
│       │   └── AuditLogger.java                    (CREATE: Audit events)
│       └── listener/
│           ├── PersonAuditListener.java            (CREATE: Person audit)
│           └── OrganizationAuditListener.java      (CREATE: Organization audit)
misc/docker/
└── logstash.conf                                   (MODIFY: add enrichment)
```

---

## Task 1: Ajouter dépendance logstash-logback-encoder

**Files:**
- Modify: `back/build.gradle:20-28`

**Interfaces:**
- Produces: `net.logstash.logback:logstash-logback-encoder` available in classpath

- [ ] **Step 1: Ouvrir build.gradle et chercher la section dependencies**

Localise la section `dependencies` (ligne 20-28).

- [ ] **Step 2: Ajouter la dépendance logstash-logback-encoder**

```gradle
dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
	implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
	implementation 'org.springframework.boot:spring-boot-starter-data-rest'
	implementation 'ro.polak:spring-boot-data-fixtures:0.2.0'
	implementation 'net.logstash.logback:logstash-logback-encoder:7.4'
	testImplementation 'org.springframework.boot:spring-boot-starter-test'
	runtimeOnly 'org.hsqldb:hsqldb'
	testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}
```

- [ ] **Step 3: Vérifier que Gradle reconnaît la dépendance**

```bash
cd back
./gradlew dependencies | grep logstash
```

Expected: `net.logstash.logback:logstash-logback-encoder:7.4`

- [ ] **Step 4: Commit**

```bash
git add back/build.gradle
git commit -m "feat: add logstash-logback-encoder dependency

- Enables JSON encoding of logs via Logback
- Required for sending logs to Logstash

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Créer configuration Logback (logback-spring.xml)

**Files:**
- Create: `back/src/main/resources/logback-spring.xml`

**Interfaces:**
- Consumes: Logstash TCP on localhost:5044
- Produces: Configured Logback appenders (CONSOLE, LOGSTASH)

- [ ] **Step 1: Créer le fichier logback-spring.xml**

```bash
touch back/src/main/resources/logback-spring.xml
```

- [ ] **Step 2: Écrire la configuration Logback**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <!-- Console Appender for local development -->
  <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
      <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
    </encoder>
  </appender>

  <!-- Logstash TCP Appender for Elasticsearch -->
  <appender name="LOGSTASH" class="net.logstash.logback.appender.LogstashTcpSocketAppender">
    <destination>localhost:5044</destination>
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
      <customFields>{"app":"microcrm","environment":"local"}</customFields>
    </encoder>
  </appender>

  <!-- Root Logger -->
  <root level="INFO">
    <appender-ref ref="CONSOLE" />
    <appender-ref ref="LOGSTASH" />
  </root>

  <!-- Spring Framework: less verbose -->
  <logger name="org.springframework" level="WARN" />
  <logger name="org.springframework.web" level="INFO" />
  <logger name="org.hibernate" level="WARN" />

  <!-- Application: verbose -->
  <logger name="com.openclassroom.devops.orion.microcrm" level="INFO" />
</configuration>
```

- [ ] **Step 3: Vérifier que le fichier est au bon endroit**

```bash
ls -la back/src/main/resources/logback-spring.xml
```

Expected: File exists

- [ ] **Step 4: Commit**

```bash
git add back/src/main/resources/logback-spring.xml
git commit -m "feat: add Logback configuration with JSON and TCP appenders

- Console appender for local debugging
- Logstash TCP appender (localhost:5044) for JSON logging
- Custom fields: app=microcrm, environment=local
- Log level: INFO for application, WARN for frameworks

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Créer HttpLoggingInterceptor

**Files:**
- Create: `back/src/main/java/com/openclassroom/devops/orion/microcrm/interceptor/HttpLoggingInterceptor.java`

**Interfaces:**
- Consumes: Spring `HandlerInterceptor`, `HttpServletRequest`, `HttpServletResponse`
- Produces: HTTP request logs with method, path, status, duration

- [ ] **Step 1: Créer le répertoire interceptor**

```bash
mkdir -p back/src/main/java/com/openclassroom/devops/orion/microcrm/interceptor
```

- [ ] **Step 2: Créer la classe HttpLoggingInterceptor**

```bash
touch back/src/main/java/com/openclassroom/devops/orion/microcrm/interceptor/HttpLoggingInterceptor.java
```

- [ ] **Step 3: Implémenter l'interceptor**

```java
package com.openclassroom.devops.orion.microcrm.interceptor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class HttpLoggingInterceptor implements HandlerInterceptor {

  private static final Logger logger = LoggerFactory.getLogger(HttpLoggingInterceptor.class);

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
      throws Exception {
    request.setAttribute("startTime", System.currentTimeMillis());
    return true;
  }

  @Override
  public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
      Exception ex) throws Exception {
    long startTime = (Long) request.getAttribute("startTime");
    long duration = System.currentTimeMillis() - startTime;

    String method = request.getMethod();
    String path = request.getRequestURI();
    int status = response.getStatus();

    logger.info("HTTP request processed: method={}, path={}, status={}, duration_ms={}", method, path, status,
        duration);

    if (ex != null) {
      logger.error("Request error: method={}, path={}, status={}, exception={}", method, path, status,
          ex.getMessage(), ex);
    }
  }
}
```

- [ ] **Step 4: Vérifier que la classe compile**

```bash
cd back
./gradlew compileJava
```

Expected: BUILD SUCCESSFUL

- [ ] **Step 5: Commit**

```bash
git add back/src/main/java/com/openclassroom/devops/orion/microcrm/interceptor/HttpLoggingInterceptor.java
git commit -m "feat: add HTTP logging interceptor

- Logs method, path, status, duration for every request
- Captures exceptions in request lifecycle
- Integrates with SLF4J for JSON encoding

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Enregistrer HttpLoggingInterceptor dans Spring

**Files:**
- Create: `back/src/main/java/com/openclassroom/devops/orion/microcrm/config/WebMvcConfig.java`

**Interfaces:**
- Consumes: `HttpLoggingInterceptor` from Task 3
- Produces: Interceptor registered with Spring's `WebMvcConfigurer`

- [ ] **Step 1: Créer une classe de configuration WebMvc**

```bash
mkdir -p back/src/main/java/com/openclassroom/devops/orion/microcrm/config
touch back/src/main/java/com/openclassroom/devops/orion/microcrm/config/WebMvcConfig.java
```

- [ ] **Step 2: Implémenter la configuration**

```java
package com.openclassroom.devops.orion.microcrm.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import com.openclassroom.devops.orion.microcrm.interceptor.HttpLoggingInterceptor;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(new HttpLoggingInterceptor());
  }
}
```

- [ ] **Step 3: Vérifier que la classe compile**

```bash
cd back
./gradlew compileJava
```

Expected: BUILD SUCCESSFUL

- [ ] **Step 4: Commit**

```bash
git add back/src/main/java/com/openclassroom/devops/orion/microcrm/config/WebMvcConfig.java
git commit -m "feat: register HTTP logging interceptor with Spring

- WebMvcConfig registers HttpLoggingInterceptor globally
- All HTTP requests now pass through the interceptor

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Créer GlobalExceptionHandler

**Files:**
- Create: `back/src/main/java/com/openclassroom/devops/orion/microcrm/exception/GlobalExceptionHandler.java`

**Interfaces:**
- Consumes: Spring `@ControllerAdvice`, exception types
- Produces: Error logs and JSON error responses

- [ ] **Step 1: Créer le répertoire exception**

```bash
mkdir -p back/src/main/java/com/openclassroom/devops/orion/microcrm/exception
```

- [ ] **Step 2: Créer la classe GlobalExceptionHandler**

```bash
touch back/src/main/java/com/openclassroom/devops/orion/microcrm/exception/GlobalExceptionHandler.java
```

- [ ] **Step 3: Implémenter le handler**

```java
package com.openclassroom.devops.orion.microcrm.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.NoHandlerFoundException;
import jakarta.persistence.EntityNotFoundException;

@ControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(EntityNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleEntityNotFound(EntityNotFoundException ex) {
    logger.error("Entity not found: {}", ex.getMessage());
    ErrorResponse error = new ErrorResponse(404, "Not Found", ex.getMessage());
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
  }

  @ExceptionHandler(NoHandlerFoundException.class)
  public ResponseEntity<ErrorResponse> handleNoHandlerFound(NoHandlerFoundException ex) {
    logger.error("Handler not found: {}", ex.getRequestURL());
    ErrorResponse error = new ErrorResponse(404, "Not Found", "Endpoint not found");
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
    logger.error("Illegal argument: {}", ex.getMessage());
    ErrorResponse error = new ErrorResponse(400, "Bad Request", ex.getMessage());
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
    logger.error("Unexpected error: {}", ex.getMessage(), ex);
    ErrorResponse error = new ErrorResponse(500, "Internal Server Error", "An unexpected error occurred");
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
  }

  public static class ErrorResponse {
    public int status;
    public String error;
    public String message;

    public ErrorResponse(int status, String error, String message) {
      this.status = status;
      this.error = error;
      this.message = message;
    }

    public int getStatus() {
      return status;
    }

    public String getError() {
      return error;
    }

    public String getMessage() {
      return message;
    }
  }
}
```

- [ ] **Step 4: Vérifier que la classe compile**

```bash
cd back
./gradlew compileJava
```

Expected: BUILD SUCCESSFUL

- [ ] **Step 5: Commit**

```bash
git add back/src/main/java/com/openclassroom/devops/orion/microcrm/exception/GlobalExceptionHandler.java
git commit -m "feat: add global exception handler for error logging

- Handles EntityNotFoundException (404)
- Handles NoHandlerFoundException (404)
- Handles IllegalArgumentException (400)
- Generic fallback for unexpected errors (500)
- Logs all exceptions with context for analysis

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Créer AuditLogger pour événements métier

**Files:**
- Create: `back/src/main/java/com/openclassroom/devops/orion/microcrm/audit/AuditLogger.java`

**Interfaces:**
- Produces: Audit logs for CREATE, UPDATE, DELETE operations
- Consumed by: PersonRepository, OrganizationRepository (Tasks 7-8)

- [ ] **Step 1: Créer le répertoire audit**

```bash
mkdir -p back/src/main/java/com/openclassroom/devops/orion/microcrm/audit
```

- [ ] **Step 2: Créer la classe AuditLogger**

```bash
touch back/src/main/java/com/openclassroom/devops/orion/microcrm/audit/AuditLogger.java
```

- [ ] **Step 3: Implémenter AuditLogger**

```java
package com.openclassroom.devops.orion.microcrm.audit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AuditLogger {

  private static final Logger logger = LoggerFactory.getLogger(AuditLogger.class);

  public static void logCreate(String entityType, long entityId, String details) {
    logger.info("AUDIT CREATE: entity_type={}, entity_id={}, details={}", entityType, entityId, details);
  }

  public static void logUpdate(String entityType, long entityId, String details) {
    logger.info("AUDIT UPDATE: entity_type={}, entity_id={}, details={}", entityType, entityId, details);
  }

  public static void logDelete(String entityType, long entityId, String details) {
    logger.info("AUDIT DELETE: entity_type={}, entity_id={}, details={}", entityType, entityId, details);
  }
}
```

- [ ] **Step 4: Vérifier que la classe compile**

```bash
cd back
./gradlew compileJava
```

Expected: BUILD SUCCESSFUL

- [ ] **Step 5: Commit**

```bash
git add back/src/main/java/com/openclassroom/devops/orion/microcrm/audit/AuditLogger.java
git commit -m "feat: add audit logger for business events

- logCreate: logs entity creation
- logUpdate: logs entity updates
- logDelete: logs entity deletion
- Static methods for easy invocation in repositories

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Intégrer AuditLogger dans PersonRepository

**Files:**
- Create: `back/src/main/java/com/openclassroom/devops/orion/microcrm/listener/PersonAuditListener.java`
- Modify: `back/src/main/java/com/openclassroom/devops/orion/microcrm/Person.java`

**Interfaces:**
- Consumes: `AuditLogger` from Task 6
- Produces: Audit logs for Person CRUD operations

- [ ] **Step 1: Créer le répertoire listener**

```bash
mkdir -p back/src/main/java/com/openclassroom/devops/orion/microcrm/listener
```

- [ ] **Step 2: Créer le listener pour Person**

```bash
touch back/src/main/java/com/openclassroom/devops/orion/microcrm/listener/PersonAuditListener.java
```

- [ ] **Step 3: Implémenter PersonAuditListener**

```java
package com.openclassroom.devops.orion.microcrm.listener;

import jakarta.persistence.PostPersist;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PostUpdate;
import com.openclassroom.devops.orion.microcrm.Person;
import com.openclassroom.devops.orion.microcrm.audit.AuditLogger;

public class PersonAuditListener {

  @PostPersist
  public void onPersonCreate(Person person) {
    AuditLogger.logCreate("Person", person.getId(),
        String.format("First: %s, Last: %s, Email: %s", person.getFirstName(), person.getLastName(),
            person.getEmail()));
  }

  @PostUpdate
  public void onPersonUpdate(Person person) {
    AuditLogger.logUpdate("Person", person.getId(),
        String.format("Updated: %s %s", person.getFirstName(), person.getLastName()));
  }

  @PostRemove
  public void onPersonDelete(Person person) {
    AuditLogger.logDelete("Person", person.getId(),
        String.format("Deleted: %s %s", person.getFirstName(), person.getLastName()));
  }
}
```

- [ ] **Step 4: Modifier Person.java pour ajouter le listener**

Ajoute l'import et l'annotation à la classe Person:

```java
import jakarta.persistence.EntityListeners;
import com.openclassroom.devops.orion.microcrm.listener.PersonAuditListener;

@Entity
@EntityListeners(PersonAuditListener.class)
public class Person {
  // ... rest unchanged
}
```

- [ ] **Step 5: Vérifier que le code compile**

```bash
cd back
./gradlew compileJava
```

Expected: BUILD SUCCESSFUL

- [ ] **Step 6: Commit**

```bash
git add back/src/main/java/com/openclassroom/devops/orion/microcrm/listener/PersonAuditListener.java
git add back/src/main/java/com/openclassroom/devops/orion/microcrm/Person.java
git commit -m "feat: add audit logging to Person entity

- PersonAuditListener captures create/update/delete events
- Logs entity ID and details for audit trail
- Integrated via @EntityListeners annotation

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Intégrer AuditLogger dans OrganizationRepository

**Files:**
- Create: `back/src/main/java/com/openclassroom/devops/orion/microcrm/listener/OrganizationAuditListener.java`
- Modify: `back/src/main/java/com/openclassroom/devops/orion/microcrm/Organization.java`

**Interfaces:**
- Consumes: `AuditLogger` from Task 6
- Produces: Audit logs for Organization CRUD operations

- [ ] **Step 1: Créer le listener pour Organization**

```bash
touch back/src/main/java/com/openclassroom/devops/orion/microcrm/listener/OrganizationAuditListener.java
```

- [ ] **Step 2: Implémenter OrganizationAuditListener**

```java
package com.openclassroom.devops.orion.microcrm.listener;

import jakarta.persistence.PostPersist;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PostUpdate;
import com.openclassroom.devops.orion.microcrm.Organization;
import com.openclassroom.devops.orion.microcrm.audit.AuditLogger;

public class OrganizationAuditListener {

  @PostPersist
  public void onOrganizationCreate(Organization org) {
    AuditLogger.logCreate("Organization", org.getId(), String.format("Name: %s", org.getName()));
  }

  @PostUpdate
  public void onOrganizationUpdate(Organization org) {
    AuditLogger.logUpdate("Organization", org.getId(), String.format("Updated: %s", org.getName()));
  }

  @PostRemove
  public void onOrganizationDelete(Organization org) {
    AuditLogger.logDelete("Organization", org.getId(), String.format("Deleted: %s", org.getName()));
  }
}
```

- [ ] **Step 3: Modifier Organization.java pour ajouter le listener**

Ajoute l'import et l'annotation à la classe Organization:

```java
import jakarta.persistence.EntityListeners;
import com.openclassroom.devops.orion.microcrm.listener.OrganizationAuditListener;

@Entity
@EntityListeners(OrganizationAuditListener.class)
public class Organization {
  // ... rest unchanged
}
```

- [ ] **Step 4: Vérifier que le code compile**

```bash
cd back
./gradlew compileJava
```

Expected: BUILD SUCCESSFUL

- [ ] **Step 5: Commit**

```bash
git add back/src/main/java/com/openclassroom/devops/orion/microcrm/listener/OrganizationAuditListener.java
git add back/src/main/java/com/openclassroom/devops/orion/microcrm/Organization.java
git commit -m "feat: add audit logging to Organization entity

- OrganizationAuditListener captures create/update/delete events
- Logs entity ID and name for audit trail
- Integrated via @EntityListeners annotation

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Enrichir la configuration Logstash

**Files:**
- Modify: `misc/docker/logstash.conf`

**Interfaces:**
- Consumes: JSON logs from backend (port 5044)
- Produces: Enriched logs to Elasticsearch

- [ ] **Step 1: Modifier la section filter dans logstash.conf**

Remplace la section `filter` par:

```conf
filter {
  if [type] == "backend" {
    # Parser les logs JSON du backend
    if [message] {
      json {
        source => "message"
        skip_on_invalid_json => true
      }
    }

    # Extraire le niveau de log
    if [level] {
      mutate {
        add_field => { "log_level" => "%{level}" }
      }
    }

    # Ajouter les champs enrichis
    mutate {
      add_field => { 
        "app" => "microcrm"
        "environment" => "local"
        "pipeline_version" => "1.0"
      }
    }

    # Ajouter un timestamp si absent
    if ![timestamp] {
      mutate {
        add_field => { "timestamp" => "%{@timestamp}" }
      }
    }

    # Parser les logs AUDIT
    if [message] =~ /AUDIT/ {
      mutate {
        add_field => { "event_type" => "audit" }
      }
      grok {
        match => { "message" => "AUDIT %{WORD:audit_action}: entity_type=%{WORD:entity_type}, entity_id=%{NUMBER:entity_id}, details=%{GREEDYDATA:audit_details}" }
      }
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add misc/docker/logstash.conf
git commit -m "feat: enrich Logstash configuration for backend logs

- Add custom fields: app, environment, pipeline_version
- Parse AUDIT logs and extract action/entity details
- Support JSON parsing from Spring Boot backend

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Tester et valider les logs

**Files:**
- None (testing only)

**Interfaces:**
- Consumes: Running backend, Logstash, Elasticsearch, Kibana
- Produces: Verified logs in Elasticsearch

- [ ] **Step 1: Générer quelques requêtes HTTP**

```bash
# Test GET health
curl -s http://localhost:8080/api/health

# Test GET stats
curl -s http://localhost:8080/api/stats

# Test POST Person
curl -X POST http://localhost:8080/persons \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com"}'

# Test GET list
curl -s http://localhost:8080/persons

# Test 404 error
curl -s http://localhost:8080/persons/9999
```

- [ ] **Step 2: Vérifier les logs dans Elasticsearch**

```bash
curl -s http://localhost:9200/microcrm-logs-*/_search?pretty | head -100
```

Expected: Au moins 5-10 documents JSON

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "test: validate logging integration with ELK stack

- HTTP requests logged successfully
- Audit events captured for CRUD operations
- Error handling working correctly

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Créer Dashboard Kibana (manuel)

**Files:**
- None (manual UI)

**Interfaces:**
- Consumes: Logs from Elasticsearch (index: microcrm-logs-*)
- Produces: Dashboard with 5 visualizations

- [ ] **Step 1: Ouvrir Kibana et créer index pattern**

1. http://localhost:5601
2. Management → Index Patterns
3. Pattern: `microcrm-logs-*`, timestamp: `@timestamp`

- [ ] **Step 2: Créer 5 visualisations**

1. Errors by Type (bar chart, filter: level=ERROR, x-axis: exception.type)
2. Requests by Endpoint (bar chart, filter: event_type=http_request, x-axis: http.path)
3. Errors Over Time (line chart, filter: level=ERROR, x-axis: @timestamp)
4. Average Response Time (bar chart, filter: event_type=http_request, x-axis: http.path, y-axis: avg(http.duration_ms))
5. HTTP Status Distribution (pie chart, filter: event_type=http_request, slice: http.status)

- [ ] **Step 3: Créer dashboard**

1. Dashboards → Create new
2. Add the 5 visualizations
3. Title: "MicroCRM Application Monitoring"
4. Save

---

## Task 12: Valider les données pour KPI/DORA

**Files:**
- None (documentation only)

**Interfaces:**
- Consumes: Dashboard data from Kibana
- Produces: KPI summary for Elasticsearch data

Documentation à créer après validation dans Kibana.

---

**Plan total: 12 tasks**

All tasks ready to execute with Subagent-Driven Development!