import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { restoreSession } from "./features/auth/session";

// Access token chỉ nằm trong bộ nhớ nên phải khôi phục phiên bằng cookie refresh ngay khi tải trang
void restoreSession();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
