package com.openclassroom.devops.orion.microcrm;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LoggingController {

    private static final Logger logger = LoggerFactory.getLogger(LoggingController.class);

    @Autowired
    private PersonRepository personRepository;

    @GetMapping("/api/health")
    public String health() {
        logger.info("Health check endpoint called");
        return "OK";
    }

    @GetMapping("/api/stats")
    public String stats() {
        long personCount = personRepository.count();
        logger.info("Fetching statistics - Total persons in database: {}", personCount);
        return "Total persons: " + personCount;
    }
}
