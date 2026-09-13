package com.openclassroom.devops.orion.microcrm.listener;

import jakarta.persistence.PostPersist;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PostUpdate;
import com.openclassroom.devops.orion.microcrm.Person;
import com.openclassroom.devops.orion.microcrm.audit.AuditLogger;

public class PersonAuditListener {

  @PostPersist
  public void onPersonCreate(Person person) {
    AuditLogger.logCreate("Person", person.getId(), "Person record created");
  }

  @PostUpdate
  public void onPersonUpdate(Person person) {
    AuditLogger.logUpdate("Person", person.getId(), "Person record updated");
  }

  @PostRemove
  public void onPersonDelete(Person person) {
    AuditLogger.logDelete("Person", person.getId(), "Person record deleted");
  }
}
