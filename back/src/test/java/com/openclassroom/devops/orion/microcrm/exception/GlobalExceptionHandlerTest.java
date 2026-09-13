package com.openclassroom.devops.orion.microcrm.exception;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.NoHandlerFoundException;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

  private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

  @Test
  void handlesEntityNotFound() {
    ResponseEntity<GlobalExceptionHandler.ErrorResponse> response =
        handler.handleEntityNotFound(new EntityNotFoundException("Person 42 not found"));

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertEquals(404, response.getBody().getStatus());
    assertEquals("Person 42 not found", response.getBody().getMessage());
  }

  @Test
  void handlesNoHandlerFound() {
    NoHandlerFoundException ex = new NoHandlerFoundException("GET", "/unknown", new HttpHeaders());

    ResponseEntity<GlobalExceptionHandler.ErrorResponse> response = handler.handleNoHandlerFound(ex);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertEquals("Endpoint not found", response.getBody().getMessage());
  }

  @Test
  void handlesIllegalArgument() {
    ResponseEntity<GlobalExceptionHandler.ErrorResponse> response =
        handler.handleIllegalArgument(new IllegalArgumentException("bad input"));

    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    assertEquals("Bad Request", response.getBody().getError());
  }

  @Test
  void handlesGenericException() {
    ResponseEntity<GlobalExceptionHandler.ErrorResponse> response =
        handler.handleGenericException(new RuntimeException("boom"));

    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    assertEquals("An unexpected error occurred", response.getBody().getMessage());
  }
}
