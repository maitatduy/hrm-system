import { SettingsCard } from "@/components/SettingsCard";
import { ChangePasswordContainer } from "@/features/auth/components/ChangePasswordContainer";

export const SettingsPage = () => (
    <div className="flex flex-col gap-6 max-w-4xl">
        <title>Cài đặt - HRM System</title>
        <h1 className="text-xl font-bold text-ink">Cài đặt hệ thống & Bảo mật tài khoản</h1>
        <SettingsCard
            title="Đổi mật khẩu tài khoản"
            description="Cập nhật mật khẩu định kỳ giúp tăng cường an toàn dữ liệu nhân sự và thông tin cá nhân. Sau khi đổi, bạn sẽ cần đăng nhập lại."
        >
            <ChangePasswordContainer />
        </SettingsCard>
    </div>
);
