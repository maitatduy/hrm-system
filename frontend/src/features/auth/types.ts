import type { ReactNode } from "react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";

export type UserRole = "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE";

export interface LoginFormData {
    email: string;
    password: string;
    rememberMe: boolean;
}

export interface LoginRequest {
    readonly email: string;
    readonly password: string;
    readonly rememberMe: boolean;
}

export interface AuthUserSession {
    readonly id: string;
    readonly employeeId: string;
    readonly fullName: string;
    readonly email: string;
    readonly roles: readonly UserRole[];
}

export interface LoginResponse {
    readonly accessToken: string;
    readonly refreshToken?: string;
    readonly tokenType: "Bearer";
    readonly expiresIn: number;
    readonly user: AuthUserSession;
}

export interface AuthLayoutProps {
    readonly children: ReactNode;
    readonly className?: string;
}

export interface AuthCardProps {
    readonly children: ReactNode;
    readonly className?: string;
}

export interface FormErrorMessageBannerProps {
    readonly message: string | null;
    readonly onClose?: () => void;
}

export interface TextInputProps {
    readonly id: string;
    readonly label: string;
    readonly type?: "text" | "email";
    readonly placeholder?: string;
    readonly error?: string;
    readonly disabled?: boolean;
    readonly registration: ReturnType<UseFormRegister<LoginFormData>>;
}

export interface PasswordInputProps {
    readonly id: string;
    readonly label: string;
    readonly placeholder?: string;
    readonly error?: string;
    readonly disabled?: boolean;
    readonly registration: ReturnType<UseFormRegister<LoginFormData>>;
}

export interface RememberMeCheckboxProps {
    readonly id: string;
    readonly label: string;
    readonly disabled?: boolean;
    readonly registration: ReturnType<UseFormRegister<LoginFormData>>;
}

export interface SubmitButtonProps {
    readonly children: ReactNode;
    readonly isLoading: boolean;
    readonly disabled?: boolean;
    readonly className?: string;
    readonly onClick?: () => void;
}

export interface LoginFormProps {
    readonly register: UseFormRegister<LoginFormData>;
    readonly errors: FieldErrors<LoginFormData>;
    readonly serverError: string | null;
    readonly isSubmitting: boolean;
    readonly onSubmit: () => void;
}

export interface AuthState {
    readonly accessToken: string | null;
    readonly isAuthenticated: boolean;
    readonly sessionUser: AuthUserSession | null;
    readonly setAuth: (payload: { accessToken: string; user: AuthUserSession }) => void;
    readonly clearAuth: () => void;
}

export interface LogoutRequest {
    readonly refreshToken?: string;
}

export interface LogoutResponse {
    readonly success: boolean;
    readonly message: string;
}

export interface ConfirmDialogProps {
    readonly isOpen: boolean;
    readonly title: string;
    readonly description: string;
    readonly confirmLabel?: string;
    readonly cancelLabel?: string;
    readonly isLoading?: boolean;
    readonly variant?: "danger" | "primary";
    readonly onConfirm: () => void;
    readonly onCancel: () => void;
    readonly children?: ReactNode;
}

export interface DangerButtonProps {
    readonly children: ReactNode;
    readonly onClick?: () => void;
    readonly isLoading?: boolean;
    readonly disabled?: boolean;
    readonly className?: string;
    readonly type?: "button" | "submit" | "reset";
}

export interface SecondaryButtonProps {
    readonly children: ReactNode;
    readonly onClick: () => void;
    readonly disabled?: boolean;
    readonly className?: string;
    readonly type?: "button" | "submit" | "reset";
}

export interface DangerAlertIconBadgeProps {
    readonly className?: string;
}

