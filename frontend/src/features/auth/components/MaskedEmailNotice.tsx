import type { MaskedEmailNoticeProps } from "../types";

export const maskEmail = (email: string): string => {
    if (!email || !email.includes("@")) return email;

    const [user, domain] = email.split("@");
    if (user.length <= 3) {
        return `${user.slice(0, 1)}***@${domain}`;
    }
    return `${user.slice(0, 2)}***${user.slice(-1)}@${domain}`;
};

export const MaskedEmailNotice = ({ email, className = "" }: MaskedEmailNoticeProps) => {
    const masked = maskEmail(email);

    return (
        <p
            className={`text-[16px] font-medium text-[#615d59] text-center leading-relaxed font-normal ${className}`}
        >
            Mã xác thực 6 chữ số đã được gửi tới hòm thư{" "}
            <strong className="font-semibold text-[#000000]">{masked}</strong>
        </p>
    );
};
