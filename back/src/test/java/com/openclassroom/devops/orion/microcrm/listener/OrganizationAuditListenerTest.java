package com.openclassroom.devops.orion.microcrm.listener;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.openclassroom.devops.orion.microcrm.Organization;
import com.openclassroom.devops.orion.microcrm.audit.AuditLogger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OrganizationAuditListenerTest {

  private ListAppender<ILoggingEvent> appender;
  private Logger logger;
  private final OrganizationAuditListener listener = new OrganizationAuditListener();

  @BeforeEach
  void setUp() {
    logger = (Logger) LoggerFactory.getLogger(AuditLogger.class);
    appender = new ListAppender<>();
    appender.start();
    logger.addAppender(appender);
  }

  @AfterEach
  void tearDown() {
    logger.detachAppender(appender);
  }

  private Organization organizationNamed(String name) {
    Organization org = new Organization();
    org.setName(name);
    return org;
  }

  @Test
  void onOrganizationCreateLogsWithoutLeakingBusinessData() {
    listener.onOrganizationCreate(organizationNamed("Acme Corp"));

    String message = appender.list.get(0).getFormattedMessage();
    assertTrue(message.contains("AUDIT CREATE"));
    assertTrue(message.contains("entity_type=Organization"));
    assertFalse(message.contains("Acme Corp"));
  }

  @Test
  void onOrganizationUpdateLogsWithoutLeakingBusinessData() {
    listener.onOrganizationUpdate(organizationNamed("Acme Corp"));

    String message = appender.list.get(0).getFormattedMessage();
    assertTrue(message.contains("AUDIT UPDATE"));
    assertFalse(message.contains("Acme Corp"));
  }

  @Test
  void onOrganizationDeleteLogsWithoutLeakingBusinessData() {
    listener.onOrganizationDelete(organizationNamed("Acme Corp"));

    String message = appender.list.get(0).getFormattedMessage();
    assertTrue(message.contains("AUDIT DELETE"));
    assertFalse(message.contains("Acme Corp"));
  }
}
