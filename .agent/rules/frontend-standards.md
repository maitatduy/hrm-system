---
trigger: glob
globs: frontend/**/*.ts, frontend/**/*.tsx
---

---

trigger: glob
globs: ["frontend/**/*.ts", "frontend/**/*.tsx"]

---

# Frontend standards - HRM System

## Thư viện bắt buộc

- Data fetching và cache dùng TanStack Query.
- State toàn cục dùng Zustand.
- Form dùng React Hook Form kết hợp Zod.
- UI dùng TailwindCSS v4 kết hợp shadcn/ui.
- Gọi API qua một axios instance duy nhất, trỏ tới api-gateway.

## Conventions

- Tổ chức theo feature, ví dụ features/employee, features/leave.
- Gọi API qua custom hook dùng TanStack Query, mọi request đều đi qua gateway.
- Tên component viết theo PascalCase, tên hook bắt đầu bằng use.
- Không dùng kiểu any, nếu chưa rõ kiểu thì dùng unknown rồi narrow lại sau.

## Không được làm

- Không gọi thẳng từ frontend xuống một service lẻ, bỏ qua gateway.
- Không hardcode base URL của gateway rải rác nhiều nơi, chỉ khai báo một chỗ trong lib/axios.
