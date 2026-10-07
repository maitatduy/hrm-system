package com.company.hrm.auth.service.impl;

import com.company.hrm.auth.client.EmployeeServiceClient;
import com.company.hrm.auth.client.dto.EmployeeSummaryDto;
import com.company.hrm.auth.dto.response.AccountResponse;
import com.company.hrm.auth.dto.response.PageResponse;
import com.company.hrm.auth.entity.User;
import com.company.hrm.auth.enums.Role;
import com.company.hrm.auth.enums.UserStatus;
import com.company.hrm.auth.mapper.UserMapper;
import com.company.hrm.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AccountServiceImplListTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserMapper userMapper;
    @Mock
    private EmployeeServiceClient employeeServiceClient;

    @InjectMocks
    private AccountServiceImpl accountService;

    @BeforeEach
    void setUp() {
        when(userMapper.toAccountResponse(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            return AccountResponse.builder().id(user.getId()).employeeId(user.getEmployeeId()).build();
        });
        when(employeeServiceClient.getEmployeeSummaries(anyList())).thenAnswer(invocation ->
                invocation.<List<UUID>>getArgument(0).stream()
                        .map(id -> EmployeeSummaryDto.builder().id(id).fullName("Tên " + id).departmentName("Kỹ thuật").build())
                        .toList());
    }

    private static User user(UUID employeeId) {
        return User.builder().id(UUID.randomUUID()).email(UUID.randomUUID() + "@hrm.vn")
                .role(Role.EMPLOYEE).status(UserStatus.ACTIVE).employeeId(employeeId).build();
    }

    private PageResponse<AccountResponse> listPage(List<User> users) {
        Pageable pageable = PageRequest.of(0, Math.max(users.size(), 1));
        when(userRepository.searchUsers(null, null, null, pageable)).thenReturn(new PageImpl<>(users, pageable, users.size()));
        return accountService.getAccounts(null, null, null, pageable);
    }

    @Test
    void fetchesEmployeeInfoForTheWholePageInOneCall() {
        UUID shared = UUID.randomUUID();
        List<User> users = List.of(user(UUID.randomUUID()), user(shared), user(shared), user(null));

        PageResponse<AccountResponse> page = listPage(users);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<UUID>> ids = ArgumentCaptor.forClass(List.class);
        verify(employeeServiceClient, times(1)).getEmployeeSummaries(ids.capture());
        // Bỏ dòng không gắn nhân viên và gộp nhân viên trùng
        assertThat(ids.getValue()).containsExactlyInAnyOrder(users.get(0).getEmployeeId(), shared);
        verify(employeeServiceClient, never()).getEmployeeSummary(any());

        assertThat(page.getContent()).extracting(AccountResponse::getEmployeeName)
                .containsExactly("Tên " + users.get(0).getEmployeeId(), "Tên " + shared, "Tên " + shared, null);
    }

    @Test
    void splitsLargePagesIntoBatchesOfAtMostOneHundred() {
        List<User> users = new ArrayList<>();
        IntStream.range(0, 150).forEach(i -> users.add(user(UUID.randomUUID())));

        listPage(users);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<UUID>> ids = ArgumentCaptor.forClass(List.class);
        verify(employeeServiceClient, times(2)).getEmployeeSummaries(ids.capture());
        assertThat(ids.getAllValues()).extracting(List::size).containsExactly(100, 50);
    }

    @Test
    void stillListsAccountsWhenEmployeeServiceFails() {
        when(employeeServiceClient.getEmployeeSummaries(anyList())).thenThrow(new IllegalStateException("employee-service lỗi"));

        PageResponse<AccountResponse> page = listPage(List.of(user(UUID.randomUUID()), user(UUID.randomUUID())));

        assertThat(page.getContent()).hasSize(2).extracting(AccountResponse::getEmployeeName).containsOnlyNulls();
    }

    @Test
    void skipsTheRemoteCallWhenNoAccountIsLinkedToAnEmployee() {
        listPage(List.of(user(null)));

        verify(employeeServiceClient, never()).getEmployeeSummaries(anyList());
    }
}
