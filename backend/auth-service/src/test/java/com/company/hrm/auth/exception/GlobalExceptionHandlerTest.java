package com.company.hrm.auth.exception;

import com.company.hrm.auth.dto.response.ApiResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleNoResourceFound_returnsNotFound() {
        ResponseEntity<ApiResponse<Void>> response = handler.handleNoResourceFound(
                new NoResourceFoundException(HttpMethod.GET, "actuator/health"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(404);
        assertThat(response.getBody().getMessage()).isEqualTo("Không tìm thấy đường dẫn yêu cầu");
    }

    @Test
    void handleGeneralException_returnsInternalServerError() {
        ResponseEntity<ApiResponse<Void>> response = handler.handleGeneralException(
                new IllegalStateException("boom"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
