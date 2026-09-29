---
name: frontend-coding
description: Chuyển bản vẽ Stitch và design brief thành code React thật cho một màn hình hoặc component cụ thể, tuân thủ đúng Frontend Plan, quét thư viện shared UI trước khi tạo component mới, và tuân thủ đúng ràng buộc React 19 kèm Vite của project.
triggers:
  - "/frontend-coding"
  - "code giao diện màn hình"
---

# Nhiệm vụ: thi công code frontend từ plan và design brief

Phần văn bản người dùng gõ ngay sau lệnh /frontend-coding trong cùng tin nhắn này gồm hai phần theo đúng thứ tự, tên dự án Stitch trước, tên màn hình hoặc component cần code sau. Ví dụ /frontend-coding HRM System/màn hình đăng nhập, nghĩa là dự án Stitch là HRM System, màn hình cần code là màn hình đăng nhập.

Nếu không tách được rõ hai phần này từ tin nhắn, hoặc người dùng chỉ gõ một phần, hỏi lại người dùng phần còn thiếu trước khi làm tiếp, không tự đoán tên dự án hoặc tên màn hình.

Khi cần đọc bản vẽ từ Stitch qua MCP Server, chỉ làm việc với đúng dự án đã xác định ở trên. Nếu MCP trả về nhiều bản vẽ trùng tên trong cùng dự án đó, hoặc không tìm thấy dự án đúng tên đã cho, dừng lại và hỏi rõ người dùng thay vì tự chọn đại.

Thực hiện tuần tự các bước sau một cách im lặng, chỉ báo cáo kết quả cuối cùng.

## Bước 1: nạp ngữ cảnh và quy hoạch

- Mở .docs/ideas/[tên]-idea.md để hiểu mục đích và trải nghiệm mong muốn.
- Mở .docs/frontend-plans/[tên]-plan.md để lấy đúng cây component, cách phân tầng state, và các interface TypeScript đã định nghĩa sẵn.
- Mở .docs/design-briefs/[tên]-brief.md nếu có, để lấy đúng cấu trúc layout, spacing, box style và dữ liệu mẫu.
- Mở .docs/DESIGN.md để lấy đúng mã màu, thang bo góc và thang typography, không tự bịa giá trị mới.
- Đối chiếu thêm .agent/rules/frontend-standards.md để tuân đúng quy ước thư viện và tổ chức thư mục.

## Bước 2: quét thư viện và tái sử dụng, luật thép

- Quét thư mục frontend/src/components trước, đây là thư viện UI dùng chung của project.
- Nếu bản vẽ hoặc design brief có chứa nút bấm, input, card, badge, hoặc bất kỳ thành phần nào nghe quen thuộc, tìm xem component đó đã tồn tại chưa trước khi viết mới.
- Nếu đã có, tuyệt đối không code lại, bắt buộc import component đó vào để dùng.
- Chỉ tạo file component mới cho những cấu trúc đặc thù của riêng màn hình đó, chưa từng xuất hiện ở nơi khác.
- Nếu component trong file plan được đánh dấu là shared UI nhưng chưa tồn tại trong frontend/src/components, tạo mới tại đó thay vì tạo trong thư mục feature, để các feature khác dùng lại được sau này.

## Bước 3: đọc bản vẽ và ánh xạ style

- Đọc bản vẽ Stitch hoặc design brief người dùng cung cấp.
- Ánh xạ thuộc tính đồ họa sang class Tailwind CSS, không dùng CSS thuần.
- Với màu sắc, dùng đúng mã hex đã quy định trong DESIGN.md, dưới dạng class Tailwind giá trị tuỳ chỉnh, ví dụ bg-[#0075de], tuyệt đối không tự chế mã hex lạ và không thay bằng màu Tailwind mặc định gần giống, ví dụ bg-blue-600.
- Với bo góc, dùng đúng thang đã quy định, rounded-xs cho input, rounded-full cho nút chính và badge dạng pill, không trộn lẫn tuỳ ý.

## Bước 4: sinh code theo đúng ràng buộc của project

Ràng buộc framework, React 19 kèm Vite, không phải Next.js:

- Đây là single page application thuần bằng Vite, không có khái niệm Server Component hay Client Component, không cần và không được thêm directive 'use client' vào bất kỳ file nào.
- Component viết dạng arrow function, khai báo props bằng interface TypeScript, destructuring props ngay tại tham số đầu vào, không dùng kiểu any.
- Dùng thẻ Link từ react-router-dom cho điều hướng nội bộ, không dùng thẻ a thường cho link trong app.
- Dùng thẻ img tiêu chuẩn cho hình ảnh, kèm thuộc tính loading lazy cho ảnh không nằm trong màn hình đầu tiên, project chưa dùng thư viện tối ưu ảnh riêng.
- State cục bộ dùng useState, state server dùng custom hook TanStack Query đặt trong file hooks riêng của feature, state toàn cục thực sự cần chia sẻ mới dùng Zustand, đúng theo cách file plan đã phân tầng.
- Thao tác tạo, sửa, xóa dữ liệu dùng mutation của TanStack Query gọi qua axios instance trỏ tới api-gateway, project không dùng Server Actions vì đây không phải Next.js.
- Sử dụng TailwindCSS v4 đúng cú pháp chuẩn, sử dụng font chữ Be Vietnam Pro.

Phân loại component đúng theo nhãn trong file plan:

- Component đánh dấu SMART chịu trách nhiệm gọi hook TanStack Query hoặc Zustand, xử lý logic, truyền dữ liệu xuống qua props cho các component DUMB bên dưới.
- Component đánh dấu DUMB chỉ nhận props, không tự gọi API, không tự đọc store toàn cục.
- Copy nguyên các interface TypeScript đã viết sẵn trong file plan, không viết lại từ đầu.

## Bước 5: kiểm tra phân quyền nếu có

- Nếu màn hình có phần chỉ dành riêng cho một số role, ẩn hoặc chặn đúng theo vai trò đã ghi trong idea hoặc trong AGENTS.md, không hiển thị nhầm cho role không được phép.

## Bước 6: báo cáo kết quả

- In ra danh sách các file đã tạo hoặc chỉnh sửa.
- Hỏi người dùng có cần điều chỉnh padding, margin, hoặc chi tiết nào trước khi lưu tiến độ không.

## Không được làm

- Không thêm 'use client' hoặc bất kỳ khái niệm Next.js nào vào code, project không dùng Next.js.
- Không tự sáng tạo thêm layout hoặc thành phần không có trong file plan hoặc design brief, nếu thấy thiếu thì hỏi lại người dùng thay vì tự đoán.
- Không tự đặt màu hoặc bo góc mới ngoài .docs/DESIGN.md.
- Không gộp logic gọi API vào component đã được đánh dấu DUMB trong file plan.
- Không tạo lại component đã tồn tại sẵn trong frontend/src/components.
