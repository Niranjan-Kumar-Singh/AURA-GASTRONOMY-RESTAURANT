package com.restaurant.service;

import com.restaurant.entity.AuditLog;
import com.restaurant.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Async
    @Transactional
    public void logAction(String action, String resource, String resourceId, String userEmail, String userRole, String details, String ipAddress, String requestId) {
        AuditLog log = AuditLog.builder()
            .action(action)
            .resource(resource)
            .resourceId(resourceId)
            .userEmail(userEmail != null ? userEmail : "ANONYMOUS")
            .userRole(userRole != null ? userRole : "GUEST")
            .details(details)
            .ipAddress(ipAddress)
            .requestId(requestId)
            .build();
        auditLogRepository.save(log);
    }
}
