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

export interface ForgotPasswordFormData {
    email: string;
}

export interface ForgotPasswordRequest {
    readonly email: string;
}

export interface ForgotPasswordResponse {
    readonly success: boolean;
    readonly message: string;
}

export interface FormFeedbackState {
    readonly type: "success" | "error" | "info";
    readonly message: string;
}

export interface FormFeedbackBannerProps {
    readonly type: "success" | "error" | "info";
    readonly message: string | null;
    readonly onClose?: () => void;
    readonly className?: string;
}

export interface ForgotPasswordFormProps {
    readonly register: UseFormRegister<ForgotPasswordFormData>;
    readonly errors: FieldErrors<ForgotPasswordFormData>;
    readonly feedback: FormFeedbackState | null;
    readonly isSubmitting: boolean;
    readonly onSubmit: () => void;
    readonly onClearFeedback?: () => void;
}

export interface BackToLoginLinkProps {
    readonly to?: string;
    readonly label?: string;
    readonly disabled?: boolean;
    readonly className?: string;
}

export interface VerifyOtpRequest {
    readonly email: string;
    readonly otp: string;
}

export interface VerifyOtpResponse {
    readonly success: boolean;
    readonly message: string;
    readonly resetToken?: string;
}

export interface ResendOtpRequest {
    readonly email: string;
}

export interface ResendOtpResponse {
    readonly success: boolean;
    readonly message: string;
}

export interface OtpFeedbackState {
    readonly type: "success" | "error" | "info";
    readonly message: string;
}

export interface MaskedEmailNoticeProps {
    readonly email: string;
    readonly className?: string;
}

export interface OtpSlotInputProps {
    readonly index: number;
    readonly value: string;
    readonly disabled?: boolean;
    readonly isError?: boolean;
    readonly isFocused?: boolean;
    readonly onChange: (index: number, char: string) => void;
    readonly onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
    readonly onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
    readonly onFocus: (index: number) => void;
    readonly inputRef?: (el: HTMLInputElement | null) => void;
}

export interface OtpInputGroupProps {
    readonly value: string[];
    readonly disabled?: boolean;
    readonly isError?: boolean;
    readonly activeIndex: number;
    readonly onChange: (index: number, char: string) => void;
    readonly onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
    readonly onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
    readonly onFocus: (index: number) => void;
    readonly registerInputRef: (index: number, el: HTMLInputElement | null) => void;
    readonly className?: string;
}

export interface OtpResendSectionProps {
    readonly cooldown: number;
    readonly isResending: boolean;
    readonly onResend: () => void;
    readonly className?: string;
}

export interface OtpVerificationFormProps {
    readonly otpDigits: string[];
    readonly activeSlotIndex: number;
    readonly feedback: OtpFeedbackState | null;
    readonly isSubmitting: boolean;
    readonly isResending: boolean;
    readonly cooldown: number;
    readonly onOtpChange: (index: number, char: string) => void;
    readonly onOtpKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
    readonly onOtpPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
    readonly onOtpFocus: (index: number) => void;
    readonly registerInputRef: (index: number, el: HTMLInputElement | null) => void;
    readonly onSubmit: () => void;
    readonly onResend: () => void;
    readonly onClearFeedback?: () => void;
}

