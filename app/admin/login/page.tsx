"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldAlert,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Estados de carga y error
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!identifier.trim() || !password) {
      setErrorMsg("Por favor ingresa tu usuario o correo y tu contraseña.");
      return;
    }

    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        identifier: identifier.trim(),
        password: password,
      });

      if (res?.error) {
        setErrorMsg(res.error || "Credenciales incorrectas o acceso no autorizado.");
      } else {
        setSuccessMsg("¡Credenciales verificadas! Accediendo al panel administrativo...");
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 600);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Ocurrió un error inesperado al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl shadow-[#7b5455]/10 rounded-2xl border border-[#ebdcdc] relative">
      {/* Mensajes de Alerta */}
      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Acceso no autorizado:</span>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Formulario de Autenticación Segura */}
      <form onSubmit={handleCredentialsSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Usuario o Correo Registrado
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              autoComplete="username"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              placeholder="Ej. Natalia o admin@dulcecosmetics.com"
              className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7b5455] focus:bg-white focus:ring-2 focus:ring-[#7b5455]/20 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Contraseña de Seguridad
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7b5455] focus:bg-white focus:ring-2 focus:ring-[#7b5455]/20 transition-all placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#7b5455]" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-3 py-3 px-4 bg-[#7b5455] hover:bg-[#634243] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-[#7b5455]/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verificando credenciales...</span>
            </div>
          ) : (
            <>
              <span>Acceder al Panel de Control</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer de Seguridad y Protección */}
      <div className="mt-8 pt-6 border-t border-gray-100 space-y-2 text-[11px] text-gray-500">
        <div className="flex items-center justify-center gap-1.5 text-gray-600 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Autenticación Cifrada • Protección contra ataques de fuerza bruta</span>
        </div>
        <p className="text-center text-[10px] text-gray-400">
          Acceso estrictamente reservado para la administración de Dulce Cosmetics Neiva.
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-[#f4c2c2] selection:text-[#734e4e]">
      {/* Elementos decorativos de fondo con los tonos de Dulce Cosmetics */}
      <div className="absolute top-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-[#f4c2c2]/40 to-[#e1e1c9]/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#ffe088]/20 to-[#f4c2c2]/30 blur-3xl pointer-events-none" />

      {/* Botón superior para volver */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7b5455] hover:text-[#523536] bg-white/80 backdrop-blur-sm px-3.5 py-2 rounded-full border border-[#ebdcdc] shadow-sm transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a la Tienda
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Cabecera de la Marca con Logo Oficial */}
        <div className="text-center space-y-2">
          <div className="inline-block relative mb-1">
            <img
              src="/logo.png"
              alt="Dulce Cosmetics"
              className="w-20 h-20 rounded-full object-cover shadow-xl ring-4 ring-[#f4c2c2]/70 mx-auto"
            />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1a1c1c]">
            Dulce Cosmetics
          </h1>
          <p className="text-xs uppercase tracking-[0.25em] text-[#735c00] font-bold">
            Portal Administrativo • Neiva
          </p>
        </div>

        {/* Tarjeta de Autenticación con Suspense para searchParams */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Suspense fallback={
            <div className="bg-white/95 p-8 rounded-2xl text-center text-xs text-gray-500">
              Cargando portal seguro...
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

