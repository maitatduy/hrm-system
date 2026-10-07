package com.company.hrm.auth.exception;

import com.company.hrm.auth.dto.response.ApiResponse;
import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;
import java.util.List;

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
    void handleMethodNotSupported_returnsMethodNotAllowedWithAllowHeader() {
        ResponseEntity<ApiResponse<Void>> response = handler.handleMethodNotSupported(
                new HttpRequestMethodNotSupportedException("GET", List.of("POST")));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.METHOD_NOT_ALLOWED);
        assertThat(response.getHeaders().getAllow()).containsExactly(HttpMethod.POST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isEqualTo(405);
        assertThat(response.getBody().getMessage())
                .isEqualTo("Phương thức GET không được hỗ trợ cho đường dẫn này");
    }

    @Test
    void duplicateKeyViolationReturnsConflict() {
        DataIntegrityViolationException ex = new DataIntegrityViolationException("could not execute statement",
                new SQLIntegrityConstraintViolationException("Duplicate entry 'a@hrm.vn' for key 'uk_users_email'", "23000", 1062));

        ResponseEntity<ApiResponse<Void>> response = handler.handleDataIntegrityViolation(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody().getMessage()).isEqualTo("Dữ liệu bị trùng với bản ghi đã có");
    }

    @Test
    void standardUniqueViolationStateReturnsConflict() {
        // H2 và PostgreSQL báo trùng khóa bằng SQLState chuẩn 23505, không có mã 1062 của MySQL
        DataIntegrityViolationException ex = new DataIntegrityViolationException("could not execute statement",
                new SQLException("Unique index or primary key violation", "23505", 23505));

        assertThat(handler.handleDataIntegrityViolation(ex).getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void hibernateUniqueKindReturnsConflictWhateverTheDatabaseCode() {
        DataIntegrityViolationException ex = new DataIntegrityViolationException("could not execute statement",
                new ConstraintViolationException("duplicate", new SQLException("duplicate", "23000", 0), "insert",
                        ConstraintViolationException.ConstraintKind.UNIQUE, "uk_users_email"));

        assertThat(handler.handleDataIntegrityViolation(ex).getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void hibernateOtherKindIsAServerError() {
        DataIntegrityViolationException ex = new DataIntegrityViolationException("could not execute statement",
                new ConstraintViolationException("null", new SQLException("null", "23502", 0), "insert",
                        ConstraintViolationException.ConstraintKind.OTHER, null));

        assertThat(handler.handleDataIntegrityViolation(ex).getStatusCode())
                .isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Test
    void otherConstraintViolationsAreServerErrorsNotConflicts() {
        // NOT NULL hoặc quá độ dài cột là lỗi của code, không phải người dùng gửi dữ liệu trùng
        DataIntegrityViolationException ex = new DataIntegrityViolationException("could not execute statement",
                new SQLIntegrityConstraintViolationException("Column 'email' cannot be null", "23000", 1048));

        ResponseEntity<ApiResponse<Void>> response = handler.handleDataIntegrityViolation(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Test
    void handleGeneralException_returnsInternalServerError() {
        ResponseEntity<ApiResponse<Void>> response = handler.handleGeneralException(
                new IllegalStateException("boom"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
