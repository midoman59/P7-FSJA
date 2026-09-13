package com.openclassroom.devops.orion.microcrm.interceptor;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertTrue;

class HttpLoggingInterceptorTest {

  private final HttpLoggingInterceptor interceptor = new HttpLoggingInterceptor();
  private ListAppender<ILoggingEvent> appender;
  private Logger logger;

  @BeforeEach
  void setUp() {
    logger = (Logger) LoggerFactory.getLogger(HttpLoggingInterceptor.class);
    appender = new ListAppender<>();
    appender.start();
    logger.addAppender(appender);
  }

  @AfterEach
  void tearDown() {
    logger.detachAppender(appender);
  }

  @Test
  void logsSuccessfulRequestWithMethodPathStatusAndDuration() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/persons");
    MockHttpServletResponse response = new MockHttpServletResponse();
    response.setStatus(200);

    interceptor.preHandle(request, response, new Object());
    interceptor.afterCompletion(request, response, new Object(), null);

    String message = appender.list.get(0).getFormattedMessage();
    assertTrue(message.contains("method=GET"));
    assertTrue(message.contains("path=/persons"));
    assertTrue(message.contains("status=200"));
  }

  @Test
  void logsErrorWhenExceptionOccurs() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest("POST", "/persons");
    MockHttpServletResponse response = new MockHttpServletResponse();
    response.setStatus(500);

    interceptor.preHandle(request, response, new Object());
    interceptor.afterCompletion(request, response, new Object(), new RuntimeException("failure"));

    boolean hasErrorLog = appender.list.stream()
        .anyMatch(e -> e.getFormattedMessage().contains("Request error"));
    assertTrue(hasErrorLog);
  }
}
