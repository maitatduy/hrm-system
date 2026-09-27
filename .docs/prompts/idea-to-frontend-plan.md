# Prompt: chuyển IDEA.md sang FRONTEND_PLAN.md

Dùng prompt này mỗi khi đã viết xong một file trong .docs/ideas/, để sinh ra bản kế hoạch kỹ thuật tương ứng trong .docs/frontend-plans/.

```
Hãy đóng vai trò Frontend Architect với tư duy tối ưu hóa hệ thống.

Nhiệm vụ của bạn là đọc file .docs/ideas/[TÊN_FILE_IDEA].md, cùng với .docs/DESIGN.md
và .agent/rules/frontend-standards.md để nắm đúng quy ước của project, sau đó phân
tích thành một bản quy hoạch kỹ thuật chi tiết.

Xuất kết quả ra file .docs/frontend-plans/[TÊN_FILE_PLAN].md, bắt buộc tuân thủ
định dạng và 3 yêu cầu cốt lõi sau:

1. Phân rã component
- Phân rã giao diện thành các khối component theo dạng cây cha con.
- Gắn nhãn phân loại cho từng component, [SMART] nếu là container chứa logic,
  gọi API qua custom hook TanStack Query, quản lý state phức tạp. [DUMB] nếu là
  presentational component, chỉ nhận props để in ra UI, không gọi API.
- Ghi chú rõ component nào có tiềm năng là shared UI, dùng chung cho toàn dự án.

2. Quản lý trạng thái
- Liệt kê các state cần thiết để tính năng hoạt động.
- Phân loại theo đúng 3 tầng của project, state cục bộ dùng useState, state
  server đến từ API dùng TanStack Query chứ không lưu vào Zustand, state
  toàn cục thực sự cần chia sẻ giữa nhiều màn hình mới dùng Zustand, state
  nào nên đẩy lên URL query parameter để dễ chia sẻ đường dẫn.

3. Cấu trúc dữ liệu
- Viết mã giả TypeScript, dùng interface, định nghĩa props cho các dumb
  component quan trọng nhất.
- Cấm dùng kiểu any theo đúng frontend-standards.md.

Yêu cầu thực thi, không giải thích dông dài, không chào hỏi, chỉ output duy
nhất nội dung markdown của file.
```
