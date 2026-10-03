# Luật thiết kế: HRM System

Tài liệu này dùng thẳng bảng màu Tailwind chuẩn, không dùng mã hex riêng như bản nháp trước đó.

## Bảng màu và phân cấp

- Nền trang dùng bg-gray-50.
- Card và panel dùng nền trắng bg-white, viền border border-gray-200, bo góc rounded-xl, không có shadow mặc định, chỉ hiện hover:shadow-lg khi hover với các card có thể bấm vào.
- Nút hành động chính dùng bg-blue-600, chữ trắng, hover:bg-blue-700.
- Nút phụ dùng viền border border-gray-200, nền trắng, chữ text-gray-700, hover:bg-gray-50.
- Nút hành động nguy hiểm, xóa hoặc từ chối, dùng bg-red-600, hover:bg-red-700, chữ trắng. Icon hành động nguy hiểm dạng nhỏ dùng text-red-600 trên nền bg-red-100, hover:bg-red-200.
- Nút xác nhận thanh toán hoặc hoàn tất dùng bg-green-600, hover:bg-green-700.
- Tính năng AI, ví dụ chấm điểm hồ sơ ứng viên, dùng gradient bg-gradient-to-r from-purple-600 to-blue-600, chỉ dùng riêng cho tính năng AI để tạo điểm nhấn khác biệt, không dùng gradient này cho hành động thường.
- Chữ tiêu đề chính dùng text-gray-900, chữ mô tả phụ dùng text-gray-600, chữ nhãn hoặc chú thích nhỏ dùng text-gray-500, chữ placeholder hoặc giá trị trống dùng text-gray-400.

## Badge trạng thái

Badge luôn dùng dạng pill, class chung inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium, phối màu nền nhạt và chữ đậm cùng tông.

- Trạng thái tích cực, đang làm việc, đúng giờ, đã duyệt, đã thanh toán, đã hoàn thành, dùng bg-green-100 text-green-800.
- Trạng thái đang chờ hoặc cảnh báo nhẹ, nghỉ phép, đi muộn, chờ duyệt, sắp diễn ra, dùng bg-yellow-100 text-yellow-800.
- Trạng thái tiêu cực, nghỉ việc, vắng mặt, từ chối, dùng bg-red-100 text-red-800.
- Trạng thái thông tin trung tính, nghỉ phép trong bảng chấm công, đang diễn ra, dùng bg-blue-100 text-blue-800.
- Trạng thái trung tính đã kết thúc, đã đóng, đã hoàn thành chương trình đào tạo, dùng bg-gray-100 text-gray-800.
- Các bước ứng viên trong tuyển dụng dùng thêm bg-purple-100 text-purple-800 và bg-indigo-100 text-indigo-800 để phân biệt nhiều vòng phỏng vấn liên tiếp.

## Avatar

- Avatar dùng hình tròn, nền gradient bg-gradient-to-br from-blue-500 to-purple-600, chữ trắng đậm là ký tự cuối của tên.
- Avatar lớn ở trang chi tiết dùng bo góc vuông rounded-xl thay vì tròn, kích thước lớn hơn, cùng tông gradient.

## Typography

- Tiêu đề trang dùng text-3xl font-bold text-gray-900, kèm một dòng mô tả phụ text-gray-600 ngay dưới.
- Tiêu đề khối hoặc card dùng font-bold text-gray-900, cỡ text-xl cho khối lớn, mặc định cho khối nhỏ.
- Giá trị số liệu thống kê nổi bật dùng text-3xl font-bold, màu đổi theo ngữ cảnh, xanh dương mặc định, xanh lá cho số liệu tích cực, vàng cho số liệu cảnh báo.

## Bo góc

- Card và panel lớn dùng rounded-xl.
- Nút, input, select dùng rounded-lg.
- Modal dùng rounded-2xl.
- Badge và avatar dùng rounded-full.
- Icon đặt trong khối vuông nhỏ, ví dụ icon thống kê, dùng rounded-lg.

## Modal

Mọi modal trong hệ thống dùng chung một cấu trúc.

- Overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50.
- Khung modal nền trắng, rounded-2xl, shadow-2xl, chiều rộng tối đa tuỳ nội dung, max-w-md cho modal xác nhận, max-w-lg hoặc max-w-2xl cho modal có form dài.
- Phần header có tiêu đề bên trái, nút đóng dạng icon X bên phải, border-b ngăn với phần thân.
- Phần thân padding p-6, các trường trong form cách nhau space-y-4.
- Phần footer border-t, các nút căn phải, nút phụ trước, nút chính sau.

## Bảng dữ liệu

- Header bảng nền bg-gray-50, border-b, chữ text-sm font-medium text-gray-600.
- Các dòng phân cách bằng divide-y divide-gray-100, hover:bg-gray-50 khi rê chuột qua từng dòng.
- Cột số tiền hoặc số liệu quan trọng căn phải, in đậm.
- Thao tác trên từng dòng đặt ở cột cuối, dùng icon button nhỏ thay vì chữ dài.

## Thẻ thống kê

Mỗi trang module đều mở đầu bằng một dãy thẻ thống kê dạng lưới, mỗi thẻ gồm nhãn nhỏ, giá trị lớn, và một icon tròn hoặc vuông bo góc ở góc phải mang màu minh hoạ cho số liệu đó. Có thể kèm thêm một dòng nhỏ so sánh với kỳ trước, dùng icon mũi tên tăng hoặc giảm.

## Không được làm

- Không tự chế thêm tông màu ngoài bảng màu Tailwind đã liệt kê ở trên.
- Không dùng gradient tím xanh cho hành động thường, chỉ dành riêng cho tính năng AI.
- Không tự đổi cấu trúc modal đã quy định, giữ đúng thứ tự header, thân, footer.
- Không trộn nhiều mức bo góc khác nhau trong cùng một nhóm thành phần cùng cấp.