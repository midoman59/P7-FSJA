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
