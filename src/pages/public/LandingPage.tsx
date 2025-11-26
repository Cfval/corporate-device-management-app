import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AnimatedWave } from "../../components/ui/AnimatedWave";

// HeroIcons (gratis)
import {
  DevicePhoneMobileIcon,
  SignalIcon,
  Cog8ToothIcon,
} from "@heroicons/react/24/outline";

/**
 * LandingPage
 * -----------
 * Página pública de presentación de la plataforma.
 * - TailwindCSS para el estilo
 * - Framer Motion para animaciones suaves
 * - Sin Material UI
 */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();

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

      {/* Botón Acceder (fijo / absoluto arriba derecha) */}
      <motion.button
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97, y: 0 }}
        onClick={handleGoToLogin}
        className="fixed md:absolute top-4 right-4 z-20 rounded-full bg-sky-500 px-5 py-2.5 text-sm font-medium text-slate-950 shadow-lg shadow-sky-500/30 transition-colors hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
      >
        Acceder
      </motion.button>

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
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/90 text-xs font-semibold text-slate-950">
                DC
              </div>
              <span>Digital Citizen · Plataforma corporativa</span>
            </div>

            <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
              Digital Citizen
              <span className="block text-sky-400">
                Gestión inteligente de dispositivos y líneas corporativas.
              </span>
            </h1>

            <p className="max-w-xl text-balance text-sm sm:text-base text-slate-300">
              Centraliza la administración de smartphones, líneas móviles y
              usuarios en una única plataforma. Diseñada para IT, RRHH y
              responsables de negocio que necesitan control, trazabilidad y una
              visión global en tiempo real.
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
                Empezar ahora
              </motion.button>

              <p className="text-xs sm:text-sm text-slate-400">
                Proyecto TFG DAM / DAW · Arquitectura por microservicios,
                Spring Boot & React.
              </p>
            </div>
          </motion.div>

          {/* Columna derecha: mockup sencillo */}
          <motion.div
            className="mt-4 flex flex-1 items-center justify-center lg:mt-0"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
          >
            <div className="relative h-64 w-full max-w-md">
              {/* Marco del mockup */}
              <motion.div
                className="relative h-full w-full rounded-3xl border border-slate-700/70 bg-slate-900/80 shadow-2xl shadow-sky-900/40 backdrop-blur"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 9,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {/* Top bar */}
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-medium text-slate-200">
                      Dashboard Cliente
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Demo · e2 Mobile
                  </span>
                </div>

                {/* Contenido simulado */}
                <div className="grid h-full grid-cols-2 gap-4 px-4 py-4">
                  <div className="space-y-3">
                    <div className="rounded-2xl bg-sky-500/15 p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Dispositivos
                      </p>
                      <p className="mt-1 text-xl font-semibold text-sky-300">
                        128
                      </p>
                      <p className="text-[11px] text-slate-400">
                        86% asignados
                      </p>
                    </div>
                    <div className="rounded-2xl bg-indigo-500/10 p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Líneas activas
                      </p>
                      <p className="mt-1 text-xl font-semibold text-indigo-300">
                        96
                      </p>
                      <p className="text-[11px] text-slate-400">
                        4 en revisión
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl bg-slate-800/80 p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Alertas
                      </p>
                      <ul className="mt-2 space-y-1 text-[10px] text-slate-300">
                        <li>• Límite de datos alcanzado</li>
                        <li>• Renovación de terminales</li>
                        <li>• 2 líneas inactivas</li>
                      </ul>
                    </div>
                    <div className="rounded-2xl bg-slate-800/80 p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Próximas acciones
                      </p>
                      <div className="mt-2 h-2 w-full rounded-full bg-slate-700">
                        <div className="h-2 w-2/3 rounded-full bg-sky-500" />
                      </div>
                      <p className="mt-1 text-[10px] text-slate-400">
                        Optimización de costes en curso…
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
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
              Por qué usar nuestra plataforma
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
              Control total de tu parque móvil en una sola vista.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300">
              Desde el panel de administración podrás gestionar dispositivos,
              líneas y usuarios sin perder de vista el contexto: estados,
              alertas, costes y seguridad.
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
                Gestión de dispositivos
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Controla el ciclo de vida completo: altas, cambios, reparaciones
                y bajas de terminales, con trazabilidad por usuario.
              </p>
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
                Control de líneas
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Visualiza el estado de cada línea, su operador, tarifas y
                asignación. Detecta líneas inactivas y optimiza costes.
              </p>
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
                Panel de administrador
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Define roles, clientes y políticas. Consulta KPIs y reportes
                globales desde un único dashboard técnico y funcional.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-slate-900/95 border-t border-slate-800/80">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-4 sm:px-8">
          <p className="text-center text-xs sm:text-sm text-slate-400">
            © 2025 Digital Citizen — Proyecto TFG DAM / DAW
          </p>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
