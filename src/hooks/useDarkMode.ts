import { useEffect, useState } from "react";

export const useDarkMode = () => {
  // Leer valor almacenado o detectado automáticamente
  const stored = localStorage.getItem("darkMode");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const [darkMode, setDarkMode] = useState(
    stored === "true" || (!stored && systemPrefersDark)
  );

  // Aplicar el modo al HTML + guardar en localStorage
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((v) => !v);

  return { darkMode, toggleDarkMode };
};
