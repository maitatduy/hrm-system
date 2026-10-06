const INTEGER_FORMATTER = new Intl.NumberFormat("vi-VN");

const PERCENT_FORMATTER = new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
});

/** Phân cách hàng nghìn kiểu Việt Nam, ví dụ "1.248". */
export const formatNumber = (value: number): string => INTEGER_FORMATTER.format(value);

/** Giá trị phần trăm 0 đến 100, ví dụ 96.2 thành "96,2%". */
export const formatPercent = (value: number): string => `${PERCENT_FORMATTER.format(value)}%`;
