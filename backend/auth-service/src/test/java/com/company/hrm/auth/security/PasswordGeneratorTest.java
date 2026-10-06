package com.company.hrm.auth.security;

import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class PasswordGeneratorTest {

    @RepeatedTest(50)
    void alwaysContainsEveryCharacterClass() {
        String password = PasswordGenerator.generate();

        assertThat(password).hasSize(PasswordGenerator.LENGTH);
        assertThat(password).containsPattern("[A-Z]");
        assertThat(password).containsPattern("[a-z]");
        assertThat(password).containsPattern("[0-9]");
        assertThat(password).containsPattern("[^A-Za-z0-9]");
    }

    @Test
    void producesDifferentPasswords() {
        Set<String> passwords = new HashSet<>();
        for (int i = 0; i < 1000; i++) {
            passwords.add(PasswordGenerator.generate());
        }

        assertThat(passwords).hasSize(1000);
    }
}
