---
name: commit-to-github
description: Tự động soạn commit message theo chuẩn Conventional Commits, commit các file đã thay đổi và đẩy lên GitHub. Dùng khi người dùng yêu cầu commit code, lưu code lên git, đẩy code lên github, hoặc push thay đổi lên remote.
triggers:
  - "/commit"
  - "commit lên github"
  - "đẩy code lên github"
---

# Nhiệm vụ: commit và đẩy code lên GitHub

Khi được gọi, thực hiện tuần tự các bước sau.

## Bước 1: kiểm tra thay đổi

- Chạy git status để xem danh sách file đã thay đổi, mới tạo, hoặc bị xóa.
- Nếu không có thay đổi nào, báo lại cho người dùng và dừng, không cần làm tiếp các bước sau.

## Bước 2: kiểm tra an toàn trước khi add

- Đối chiếu danh sách file thay đổi với các pattern nhạy cảm, .env, application-secret.yml, application-prod.yml, mọi file khoá hoặc chứng chỉ.
- Nếu phát hiện file nhạy cảm nằm trong danh sách thay đổi, dừng lại, cảnh báo rõ cho người dùng, không tự ý add hoặc commit file đó, chờ người dùng xác nhận cách xử lý.

## Bước 3: phân nhóm thay đổi theo đúng câu chuyện

- Nếu các file thay đổi thuộc nhiều nội dung không liên quan nhau, ví dụ vừa sửa code backend vừa sửa tài liệu design không liên quan, đề xuất tách thành nhiều commit riêng, mỗi commit kể một câu chuyện trọn vẹn, không gộp chung một commit duy nhất.
- Nếu các file thay đổi cùng phục vụ một mục đích, gộp chung một commit như bình thường.

## Bước 4: chọn đúng loại commit

Chọn type theo đúng quy ước đã dùng xuyên suốt project, dựa vào loại file và bản chất thay đổi.

- docs, cho thay đổi ở file cấu hình agent hoặc tài liệu, GEMINI.md, AGENTS.md, .agent/rules, .agent/workflows, .agent/skills, .docs, .antigravityignore.
- feat, cho code nghiệp vụ mới ở backend hoặc frontend.
- fix, cho sửa lỗi trong code nghiệp vụ đã có.
- refactor, cho thay đổi cấu trúc code nhưng không đổi hành vi.
- chore, cho thay đổi liên quan tới cấu hình build, dependency, hoặc việc dọn dẹp không thuộc các loại trên.
- test, cho thay đổi chỉ liên quan tới file test.

## Bước 5: soạn commit message

- Dòng tiêu đề theo dạng type, hai chấm, mô tả ngắn gọn bằng tiếng Anh.

## Bước 6: commit

- Add đúng các file thuộc nhóm đang xử lý.
- Commit với message đã soạn ở bước 5.
- Nếu đã tách nhiều commit ở bước 3, lặp lại add và commit cho từng nhóm theo đúng thứ tự hợp lý.

## Bước 7: xác nhận trước khi đẩy lên remote

- Hiển thị lại danh sách commit vừa tạo cho người dùng xem.
- Hỏi người dùng có muốn đẩy lên remote ngay bây giờ không, không tự ý push khi chưa được xác nhận.
- Nếu người dùng xác nhận, chạy git push. Nếu nhánh hiện tại chưa có upstream, dùng git push với tuỳ chọn thiết lập upstream cho nhánh đó.
- Nếu người dùng từ chối hoặc chưa trả lời, dừng lại, không push, nhắc rằng commit vẫn đang nằm ở local.

## Bước 8: báo cáo

- Báo lại ngắn gọn, đã tạo bao nhiêu commit, nội dung từng commit message, và đã push hay chưa.

## Không được làm

- Không commit hoặc add file nằm trong danh sách nhạy cảm đã phát hiện ở bước 2.
- Không tự ý push lên remote khi chưa có xác nhận của người dùng.
- Không gộp nhiều thay đổi không liên quan vào cùng một commit chỉ để nhanh gọn.
- Không tự ý force push, không tự ý rebase hoặc sửa lịch sử commit đã tồn tại trên remote.
