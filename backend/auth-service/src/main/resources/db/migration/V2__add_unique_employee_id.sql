-- Mỗi nhân viên chỉ có một tài khoản. employee_id được phép NULL (ADMIN ban đầu không gắn nhân viên),
-- MySQL cho phép nhiều giá trị NULL trong cột UNIQUE.
-- Ràng buộc unique tự tạo index nên bỏ index thường cũ để không trùng lặp.
ALTER TABLE users ADD CONSTRAINT uk_users_employee_id UNIQUE (employee_id);
DROP INDEX idx_users_employee_id ON users;
