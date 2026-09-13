package com.openclassroom.devops.orion.microcrm.listener;

import jakarta.persistence.PostPersist;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PostUpdate;
import com.openclassroom.devops.orion.microcrm.Organization;
import com.openclassroom.devops.orion.microcrm.audit.AuditLogger;

public class OrganizationAuditListener {

  @PostPersist
  public void onOrganizationCreate(Organization org) {
    AuditLogger.logCreate("Organization", org.getId(), "Organization record created");
  }

  @PostUpdate
  public void onOrganizationUpdate(Organization org) {
    AuditLogger.logUpdate("Organization", org.getId(), "Organization record updated");
  }

  @PostRemove
  public void onOrganizationDelete(Organization org) {
    AuditLogger.logDelete("Organization", org.getId(), "Organization record deleted");
  }
}
