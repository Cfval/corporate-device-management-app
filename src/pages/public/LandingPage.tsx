import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import digitalCitizenLogo from "../../assets/icons/digitalcitizen.svg";
import { motion } from "framer-motion";
import { AnimatedWave } from "../../components/ui/AnimatedWave";

// HeroIcons
import {
  DevicePhoneMobileIcon,
  SignalIcon,
  Cog8ToothIcon,
} from "@heroicons/react/24/outline";

const translations = {
  es: {
    badge: "Digital Citizen · Plataforma corporativa",
    headline: "Gestión inteligente de dispositivos y líneas corporativas.",
    subheadline:
      "Centraliza la administración de smartphones, líneas móviles y usuarios en una única plataforma. Diseñada para IT, RRHH y responsables de negocio que necesitan control, trazabilidad y una visión global en tiempo real.",
    cta: "Empezar ahora",
    tagline: "Spring Boot · React · PostgreSQL · Arquitectura hexagonal",
    access: "Acceder",
    mockupTitle: "Dashboard Cliente",
    stat1Label: "Dispositivos",
    stat1Sub: "86% asignados",
    stat2Label: "Líneas activas",
    stat2Sub: "4 en revisión",
    alertsLabel: "Alertas",
    alert1: "Límite de datos alcanzado",
    alert2: "Renovación de terminales",
    alert3: "2 líneas inactivas",
    actionsLabel: "Próximas acciones",
    actionsSub: "Optimización de costes en curso…",
    valueTagline: "Por qué usar nuestra plataforma",
    valueTitle: "Control total de tu parque móvil en una sola vista.",
    valueBody:
      "Desde el panel de administración podrás gestionar dispositivos, líneas y usuarios sin perder de vista el contexto: estados, alertas, costes y seguridad.",
    card1Title: "Gestión de dispositivos",
    card1Body:
      "Controla el ciclo de vida completo: altas, cambios, reparaciones y bajas de terminales, con trazabilidad por usuario.",
    card2Title: "Control de líneas",
    card2Body:
      "Visualiza el estado de cada línea, su operador, tarifas y asignación. Detecta líneas inactivas y optimiza costes.",
    card3Title: "Panel de administrador",
    card3Body:
      "Define roles, clientes y políticas. Consulta KPIs y reportes globales desde un único dashboard técnico y funcional.",
    footer: "© 2025 Digital Citizen",
  },
  en: {
    badge: "Digital Citizen · Corporate Platform",
    headline: "Smart management of corporate devices and mobile lines.",
    subheadline:
      "Centralise smartphone, mobile line and user management in a single platform. Built for IT, HR and business managers who need control, traceability and a real-time global view.",
    cta: "Get started",
    tagline: "Spring Boot · React · PostgreSQL · Hexagonal architecture",
    access: "Sign in",
    mockupTitle: "Client Dashboard",
    stat1Label: "Devices",
    stat1Sub: "86% assigned",
    stat2Label: "Active lines",
    stat2Sub: "4 under review",
    alertsLabel: "Alerts",
    alert1: "Data limit reached",
    alert2: "Device renewal pending",
    alert3: "2 inactive lines",
    actionsLabel: "Upcoming actions",
    actionsSub: "Cost optimisation in progress…",
    valueTagline: "Why use our platform",
    valueTitle: "Total control of your mobile fleet in one view.",
    valueBody:
      "From the admin panel you can manage devices, lines and users without losing context: statuses, alerts, costs and security.",
    card1Title: "Device management",
    card1Body:
      "Control the full device lifecycle: onboarding, changes, repairs and decommissions, with per-user traceability.",
    card2Title: "Line control",
    card2Body:
      "Visualise the status of each line, its operator, tariffs and assignment. Detect inactive lines and optimise costs.",
    card3Title: "Admin panel",
    card3Body:
      "Define roles, clients and policies. Consult KPIs and global reports from a single technical and functional dashboard.",
    footer: "© 2025 Digital Citizen",
  },
} as const;

/**
 * LandingPage
 * -----------
 * Página pública de presentación de la plataforma.
 * - TailwindCSS para el estilo
 * - Framer Motion para animaciones suaves
 */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<"es" | "en">("es");
  const t = translations[lang];

  const handleGoToLogin = () => {
    document.activeElement instanceof HTMLElement &&
      document.activeElement.blur();
    navigate("/login");
  };

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-50 overflow-hidden flex flex-col">
      {/* Fondo principal con degradado + blobs */}
      <div className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute -top-40 -left-10 h-72 w-72 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="absolute top-20 -right-16 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
      </div>

      {/* Ondas animadas SVG */}
      <AnimatedWave />

      {/* Botones superiores (fijo / absoluto arriba derecha) */}
      <div className="fixed md:absolute top-4 right-4 z-20 flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97, y: 0 }}
          onClick={() => setLang(lang === "es" ? "en" : "es")}
          className="rounded-full bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 shadow-lg transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
        >
          {lang === "es" ? "EN" : "ES"}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97, y: 0 }}
          onClick={handleGoToLogin}
          className="rounded-full bg-sky-500 px-5 py-2.5 text-sm font-medium text-slate-950 shadow-lg shadow-sky-500/30 transition-colors hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
        >
          {t.access}
        </motion.button>
      </div>

      {/* HERO */}
      <section className="relative flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-24 sm:px-8 lg:px-16">
        {/* Contenedor ancho */}
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 lg:flex-row lg:items-center">
          {/* Columna izquierda: logo + texto */}
          <motion.div
            className="flex-1 space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Logo placeholder */}
            <div className="mb-3 inline-flex items-center gap-3 rounded-full bg-slate-900/70 px-3 py-1 text-xs font-medium text-sky-300 ring-1 ring-sky-500/30 backdrop-blur">
              <img src={digitalCitizenLogo} alt="Digital Citizen" className="h-7 w-7 rounded-full" />
              <span>{t.badge}</span>
            </div>

            <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
              Digital Citizen
              <span className="block text-sky-400">{t.headline}</span>
            </h1>

            <p className="max-w-xl text-balance text-sm sm:text-base text-slate-300">
              {t.subheadline}
            </p>

            {/* CTA secundaria */}
            <div className="flex flex-wrap items-center gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03, x: 1 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleGoToLogin}
                className="rounded-full bg-sky-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition-colors hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              >
                {t.cta}
              </motion.button>

              <p className="text-xs sm:text-sm text-slate-400">{t.tagline}</p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* BLOQUE DE VALOR */}
      <section className="relative bg-slate-950/80 px-4 py-16 sm:px-8 lg:px-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">
              {t.valueTagline}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
              {t.valueTitle}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300">
              {t.valueBody}
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1 */}
            <motion.div
              className="group flex flex-col rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/40 backdrop-blur-sm"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              whileHover={{ y: -4, scale: 1.03 }}
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
                <DevicePhoneMobileIcon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-50">
                {t.card1Title}
              </h3>
              <p className="mt-2 text-sm text-slate-300">{t.card1Body}</p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              className="group flex flex-col rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/40 backdrop-blur-sm"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
              whileHover={{ y: -4, scale: 1.03 }}
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                <SignalIcon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-50">
                {t.card2Title}
              </h3>
              <p className="mt-2 text-sm text-slate-300">{t.card2Body}</p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              className="group flex flex-col rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/40 backdrop-blur-sm"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: 0.16 }}
              whileHover={{ y: -4, scale: 1.03 }}
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                <Cog8ToothIcon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-50">
                {t.card3Title}
              </h3>
              <p className="mt-2 text-sm text-slate-300">{t.card3Body}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-slate-900/95 border-t border-slate-800/80">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-4 sm:px-8">
          <p className="text-center text-xs sm:text-sm text-slate-400">
            Carlos Francés Valdés ·
          </p>
          <p className="text-center text-xs sm:text-sm text-slate-400">
            {t.footer}
          </p>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
