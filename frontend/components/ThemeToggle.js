"use client";

import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button onClick={toggle} style={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 14px",
      borderRadius: "20px",
      border: "1px solid #e5e7eb",
      backgroundColor: dark ? "#1f2937" : "#f9fafb",
      color: dark ? "#f9fafb" : "#374151",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "500",
      transition: "all 0.2s",
    }}>
      {dark ? "☀️ Claro" : "🌙 Escuro"}
    </button>
  );
}