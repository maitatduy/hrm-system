const FALLBACK_INITIALS = "NA";

export const getInitialsFromEmail = (email?: string): string => {
    if (!email) return FALLBACK_INITIALS;
    return email.split("@")[0].slice(0, 2).toUpperCase();
};

/** Chữ đầu của từ đầu và từ cuối, ví dụ "Nguyễn Văn An" thành "NA". */
export const getInitialsFromName = (name: string): string => {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return FALLBACK_INITIALS;
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};
