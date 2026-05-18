import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./Context/Authcontext";
import "./responsive.css";

// 🔴 BLOCK any socket.io usage globally
window.io = () => {
  console.error("🚨 Socket.IO is blocked");
  return { on: () => {}, emit: () => {} };
};
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
