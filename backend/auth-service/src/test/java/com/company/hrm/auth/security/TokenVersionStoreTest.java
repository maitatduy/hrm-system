package com.company.hrm.auth.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TokenVersionStoreTest {

    private static final String USER_ID = "user-1";
    private static final String KEY = "auth:token-version:user-1";

    @Mock
    private StringRedisTemplate redisTemplate;
    @Mock
    private ValueOperations<String, String> valueOperations;

    private TokenVersionStore store;

    @BeforeEach
    void setUp() {
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        store = new TokenVersionStore(redisTemplate);
    }

    @AfterEach
    void clearSynchronization() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void userWithoutRevocationIsAtVersionZero() {
        when(valueOperations.get(KEY)).thenReturn(null);

        assertThat(store.current(USER_ID)).isZero();
        assertThat(store.matches(USER_ID, null)).isTrue();
        assertThat(store.matches(USER_ID, 0)).isTrue();
    }

    @Test
    void tokenFromBeforeTheLastRevocationNoLongerMatches() {
        when(valueOperations.get(KEY)).thenReturn("2");

        assertThat(store.matches(USER_ID, 1)).isFalse();
        assertThat(store.matches(USER_ID, null)).isFalse();
        assertThat(store.matches(USER_ID, 2L)).isTrue();
    }

    @Test
    void bumpOutsideTransactionIncrementsOnce() {
        store.bump(USER_ID);

        verify(valueOperations, times(1)).increment(KEY);
    }

    @Test
    void bumpInsideTransactionIncrementsAgainAfterCommit() {
        TransactionSynchronizationManager.initSynchronization();

        store.bump(USER_ID);
        verify(valueOperations, times(1)).increment(KEY);

        TransactionSynchronizationManager.getSynchronizations().forEach(TransactionSynchronization::afterCommit);
        verify(valueOperations, times(2)).increment(KEY);
    }
}
