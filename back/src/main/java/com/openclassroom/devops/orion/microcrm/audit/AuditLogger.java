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
