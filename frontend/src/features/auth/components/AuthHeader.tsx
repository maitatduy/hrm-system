import { AuthTitle } from "./AuthTitle";

export interface AuthHeaderProps {
    readonly title?: string;
    readonly className?: string;
}

export const AuthHeader = ({ title = "Đăng nhập", className = "" }: AuthHeaderProps) => {
    return (
        <div className={`flex flex-col items-center text-center ${className}`}>
            <AuthTitle>{title}</AuthTitle>
        </div>
    );
};
