import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { Toaster } from "react-hot-toast";
import { AdminAuthProvider } from "./context/AdminAuthContext.tsx";
import { ToastContainer } from "./components/ToastContainer.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AppWrapper>
        <AdminAuthProvider>
          <ToastContainer>
            <App />
          </ToastContainer>
        </AdminAuthProvider>
      </AppWrapper>
    </ThemeProvider>
    <Toaster position="top-right" />
  </React.StrictMode>
);
