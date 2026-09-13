package com.openclassroom.devops.orion.microcrm.audit;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AuditLoggerTest {

  private ListAppender<ILoggingEvent> appender;
  private Logger logger;

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

  @Test
  void logCreateWritesExpectedMessage() {
    AuditLogger.logCreate("Person", 1L, "Person record created");

    assertEquals(1, appender.list.size());
    String message = appender.list.get(0).getFormattedMessage();
    assertTrue(message.contains("AUDIT CREATE"));
    assertTrue(message.contains("entity_type=Person"));
    assertTrue(message.contains("entity_id=1"));
  }

  @Test
  void logUpdateWritesExpectedMessage() {
    AuditLogger.logUpdate("Organization", 2L, "Organization record updated");

    String message = appender.list.get(0).getFormattedMessage();
    assertTrue(message.contains("AUDIT UPDATE"));
    assertTrue(message.contains("entity_type=Organization"));
  }

  @Test
  void logDeleteWritesExpectedMessage() {
    AuditLogger.logDelete("Person", 3L, "Person record deleted");

    String message = appender.list.get(0).getFormattedMessage();
    assertTrue(message.contains("AUDIT DELETE"));
    assertTrue(message.contains("entity_id=3"));
  }
}
