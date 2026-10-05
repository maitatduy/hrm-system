package com.company.hrm.auth.service;

public interface RateLimitService {

    void checkLoginAllowed(String email);

    void recordLoginFailure(String email);

    void resetLoginFailures(String email);

    void acquireOtpRequestSlot(String email);
}
