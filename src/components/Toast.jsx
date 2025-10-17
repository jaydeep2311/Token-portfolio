import React, { createContext, useState, useCallback } from "react";

export const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const add = useCallback(
    (message, { duration = 3500, type = "info" } = {}) => {
      const id = Date.now() + Math.random();
      setToasts((s) => [...s, { id, message, type }]);
      setTimeout(
        () => setToasts((s) => s.filter((t) => t.id !== id)),
        duration
      );
    },
    []
  );

  const remove = useCallback(
    (id) => setToasts((s) => s.filter((t) => t.id !== id)),
    []
  );

  return (
    <ToastContext.Provider value={{ add, remove }}>
      {children}
      <div style={containerStyle}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              ...toastStyle,
              ...(t.type === "success" ? successStyle : {}),
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const containerStyle = {
  position: "fixed",
  right: 16,
  top: 16,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  zIndex: 99999,
};

const toastStyle = {
  background: "rgba(0,0,0,0.8)",
  color: "#fff",
  padding: "8px 12px",
  borderRadius: 8,
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  fontSize: 13,
};

const successStyle = {
  background: "#0f766e",
};

export default ToastProvider;
