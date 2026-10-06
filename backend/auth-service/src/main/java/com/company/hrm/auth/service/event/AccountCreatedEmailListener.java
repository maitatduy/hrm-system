package com.company.hrm.auth.service.event;

import com.company.hrm.auth.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/** Chỉ gửi email khi tài khoản đã thực sự được lưu, transaction rollback thì không gửi gì. */
@Component
@RequiredArgsConstructor
public class AccountCreatedEmailListener {

    private final EmailService emailService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onAccountCreated(AccountCreatedEvent event) {
        emailService.sendAccountCreatedEmailAsync(event.email(), event.temporaryPassword());
    }
}
