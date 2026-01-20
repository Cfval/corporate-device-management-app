import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../assets/icons/digitalcitizen.svg";

const Landing2Page: React.FC = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    document.activeElement instanceof HTMLElement &&
      document.activeElement.blur();
    navigate("/login");
  };

  return (
    <main className="relative min-h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* GRID BACKGROUND (visible, editorial) */}
      <div
        aria-hidden
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[linear-gradient(to_right,rgba(15,23,42,0.08)_1px,transparent_1px),
              linear-gradient(to_bottom,rgba(15,23,42,0.08)_1px,transparent_1px)]
          bg-[size:64px_64px]
        "
      />

      {/* HERO */}
      <section className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-16 px-6 py-24 lg:grid-cols-2 lg:items-center">
        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col justify-between gap-12"
        >
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="Digital Citizen" className="h-9 w-9" />
            <span className="text-sm font-medium tracking-wide text-slate-600">
              DIGITAL CITIZEN
            </span>
          </div>

          {/* Editorial copy */}
          <div className="max-w-md space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Plataforma empresarial
            </p>

            <p className="text-lg leading-relaxed text-slate-700">
              Una solución web diseñada para organizaciones que necesitan
              control, trazabilidad y una visión clara sobre su ecosistema de
              movilidad corporativa.
            </p>
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={goToLogin}
            className="w-fit rounded-full bg-slate-900 px-8 py-3 text-sm font-medium text-slate-50 transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Acceder
          </motion.button>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
          className="relative"
        >
          {/* Accent line */}
          <div className="absolute -left-6 top-0 h-full w-px bg-slate-400/80" />

          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Gestión integral
            <span className="block text-slate-500">
              de movilidad corporativa
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-base text-slate-600">
            Centraliza la administración de clientes, usuarios, dispositivos
            móviles y líneas corporativas desde una única plataforma diseñada
            para entornos empresariales modernos.
          </p>
        </motion.div>
      </section>

      {/* VALUE */}
      <section className="relative mx-auto max-w-7xl px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid gap-16 border-t border-slate-300 pt-20 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div>
            <span className="text-xs font-semibold text-slate-400">01</span>
            <h3 className="mt-4 text-lg font-semibold">
              Gestión de clientes
            </h3>
            <p className="mt-3 text-slate-600">
              Organización clara de clientes, usuarios y roles.
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400">02</span>
            <h3 className="mt-4 text-lg font-semibold">
              Dispositivos y líneas
            </h3>
            <p className="mt-3 text-slate-600">
              Control completo del ciclo de vida y optimización de costes.
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400">03</span>
            <h3 className="mt-4 text-lg font-semibold">
              Visión global
            </h3>
            <p className="mt-3 text-slate-600">
              KPIs, alertas y trazabilidad en tiempo real.
            </p>
          </div>
        </motion.div>
      </section>

      {/* FOOTER (solid, grid hidden) */}
      <footer className="relative bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <p className="text-xs text-slate-300">
            © 2025 Digital Citizen · Proyecto TFG DAW
          </p>
          <span className="text-xs text-slate-400">
            Plataforma de gestión corporativa
          </span>
        </div>
      </footer>
    </main>
  );
};

export default Landing2Page;



