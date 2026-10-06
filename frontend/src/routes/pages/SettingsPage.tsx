import { SettingsCard } from "@/components/SettingsCard";
import { ChangePasswordContainer } from "@/features/auth/components/ChangePasswordContainer";

export const SettingsPage = () => (
    <div className="max-w-xl">
        <title>Cài đặt - HRM System</title>
        <SettingsCard title="Đổi mật khẩu">
            <ChangePasswordContainer />
        </SettingsCard>
    </div>
);
