package com.openclassroom.devops.orion.microcrm.listener;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.openclassroom.devops.orion.microcrm.Person;
import com.openclassroom.devops.orion.microcrm.audit.AuditLogger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PersonAuditListenerTest {

  private ListAppender<ILoggingEvent> appender;
  private Logger logger;
  private final PersonAuditListener listener = new PersonAuditListener();

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
  void onPersonCreateLogsWithoutLeakingPersonalData() {
    Person person = new Person("Jane", "Doe", "jane.doe@example.com");

    listener.onPersonCreate(person);

    String message = appender.list.get(0).getFormattedMessage();
    assertTrue(message.contains("AUDIT CREATE"));
    assertTrue(message.contains("entity_type=Person"));
    assertFalse(message.contains("jane.doe@example.com"));
    assertFalse(message.contains("Jane"));
  }

  @Test
  void onPersonUpdateLogsWithoutLeakingPersonalData() {
    Person person = new Person("Jane", "Doe", "jane.doe@example.com");

    listener.onPersonUpdate(person);

    String message = appender.list.get(0).getFormattedMessage();
    assertTrue(message.contains("AUDIT UPDATE"));
    assertFalse(message.contains("Doe"));
  }

  @Test
  void onPersonDeleteLogsWithoutLeakingPersonalData() {
    Person person = new Person("Jane", "Doe", "jane.doe@example.com");

    listener.onPersonDelete(person);

    String message = appender.list.get(0).getFormattedMessage();
    assertTrue(message.contains("AUDIT DELETE"));
    assertFalse(message.contains("jane.doe@example.com"));
  }
}
