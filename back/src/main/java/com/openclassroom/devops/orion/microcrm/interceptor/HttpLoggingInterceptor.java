package com.openclassroom.devops.orion.microcrm.interceptor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class HttpLoggingInterceptor implements HandlerInterceptor {

  private static final Logger logger = LoggerFactory.getLogger(HttpLoggingInterceptor.class);

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
      throws Exception {
    request.setAttribute("startTime", System.currentTimeMillis());
    return true;
  }

  @Override
  public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
      Exception ex) throws Exception {
    long startTime = (Long) request.getAttribute("startTime");
    long duration = System.currentTimeMillis() - startTime;

    String method = request.getMethod();
    String path = request.getRequestURI();
    int status = response.getStatus();

    logger.info("HTTP request processed: method={}, path={}, status={}, duration_ms={}", method, path, status,
        duration);

    if (ex != null) {
      logger.error("Request error: method={}, path={}, status={}, exception={}", method, path, status,
          ex.getMessage(), ex);
    }
  }
}
