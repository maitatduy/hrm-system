import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AppRoutes } from "./routes/AppRoutes";

export const App = () => (
    <QueryClientProvider client={queryClient}>
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    </QueryClientProvider>
);
