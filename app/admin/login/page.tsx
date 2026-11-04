"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Lock,
  User,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  FileText,
  X,
  Heart,
  Truck,
  Check,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  // Tabs: "login" (credenciales admin/cliente) o "register" (acceso rápido clientes)
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Formulario Iniciar Sesión
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTermsLogin, setAcceptTermsLogin] = useState(true);

  // Formulario Registro Rápido Cliente
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [acceptTermsRegister, setAcceptTermsRegister] = useState(true);

  // Modal de Términos y Condiciones
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Estados de carga y retroalimentación
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!identifier.trim() || !password) {
      setErrorMsg("Por favor ingresa tu correo o usuario y tu contraseña.");
      return;
    }

    if (!acceptTermsLogin) {
      setErrorMsg("Debes aceptar los Términos y la Política de Protección de Datos para continuar.");
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
        setErrorMsg("Credenciales incorrectas o acceso no autorizado.");
      } else {
        setSuccessMsg("¡Acceso autorizado! Redirigiendo al panel administrativo...");
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

  const handleQuickRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!clientName.trim() || !clientEmail.trim()) {
      setErrorMsg("Por favor ingresa tu nombre y correo electrónico.");
      return;
    }

    if (!acceptTermsRegister) {
      setErrorMsg("Debes aceptar los Términos y la Política de Protección de Datos para continuar.");
      return;
    }

    setLoading(true);

    // Guardar información del cliente localmente para autocompletar checkout y pedidos
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("dulce_client_name", clientName.trim());
        localStorage.setItem("dulce_client_email", clientEmail.trim());
        if (clientPhone.trim()) {
          localStorage.setItem("dulce_client_phone", clientPhone.trim());
        }
      }
      setSuccessMsg("¡Bienvenida a Dulce Cosmetics! Tu perfil ha sido registrado con éxito.");
      setTimeout(() => {
        router.push("/tienda");
      }, 700);
    } catch (err) {
      setErrorMsg("No se pudo completar el registro local.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Selector de Pestañas (Tabs) con Micro-Animaciones */}
      <div className="flex p-1 bg-[#FAF9F6] rounded-2xl border border-[#d4c2c2]/50 mb-6 shadow-inner">
        <button
          type="button"
          onClick={() => {
            setActiveTab("login");
            setErrorMsg("");
            setSuccessMsg("");
          }}
          className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "login"
              ? "bg-[#7b5455] text-white shadow-md shadow-[#7b5455]/20 scale-[1.01]"
              : "text-gray-600 hover:text-[#7b5455] hover:bg-white/60"
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Iniciar Sesión</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("register");
            setErrorMsg("");
            setSuccessMsg("");
          }}
          className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "register"
              ? "bg-[#7b5455] text-white shadow-md shadow-[#7b5455]/20 scale-[1.01]"
              : "text-gray-600 hover:text-[#7b5455] hover:bg-white/60"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Acceso Rápido Cliente</span>
        </button>
      </div>

      <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-2xl shadow-[#7b5455]/10 rounded-3xl border border-[#ebdcdc] relative">
        {/* Alertas de Error o Éxito */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Atención:</span>
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

        {/* 1. TAB: INICIAR SESIÓN (ADMINISTRACIÓN Y CLIENTES REGISTRADOS) */}
        {activeTab === "login" && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Correo Electrónico o Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
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
                  placeholder="Ingresa tu correo o usuario"
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

            {/* Checkbox de Términos y Condiciones */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600 select-none">
                <input
                  type="checkbox"
                  checked={acceptTermsLogin}
                  onChange={(e) => setAcceptTermsLogin(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#7b5455] accent-[#7b5455] cursor-pointer shrink-0"
                />
                <span className="leading-tight">
                  Acepto los{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTermsModal(true);
                    }}
                    className="font-semibold text-[#7b5455] underline hover:text-[#583334]"
                  >
                    Términos del Servicio
                  </button>{" "}
                  y la{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTermsModal(true);
                    }}
                    className="font-semibold text-[#7b5455] underline hover:text-[#583334]"
                  >
                    Política de Protección de Datos
                  </button>
                  .
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !acceptTermsLogin}
              className="w-full mt-3 py-3.5 px-4 bg-[#7b5455] hover:bg-[#634243] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-[#7b5455]/25 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verificando credenciales...</span>
                </div>
              ) : (
                <>
                  <span>Ingresar a la Plataforma</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 2. TAB: REGISTRO RÁPIDO CLIENTE */}
        {activeTab === "register" && (
          <form onSubmit={handleQuickRegisterSubmit} className="space-y-4 animate-fade-in">
            <div className="p-3 bg-[#f4c2c2]/15 rounded-xl border border-[#ebdcdc] text-xs text-[#7b5455]">
              <span className="font-bold block mb-0.5">¿Eres cliente de Dulce Cosmetics?</span>
              <p className="text-[11px] text-gray-600">
                Registra tus datos una sola vez para agilizar tus compras, recibir asesoría directa con Natalia y acceder a promociones en Neiva.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Nombre Completo *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Tu nombre y apellido"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7b5455] focus:bg-white focus:ring-2 focus:ring-[#7b5455]/20 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Correo Electrónico *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7b5455] focus:bg-white focus:ring-2 focus:ring-[#7b5455]/20 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                WhatsApp / Teléfono de Contacto (Opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="317 000 0000"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7b5455] focus:bg-white focus:ring-2 focus:ring-[#7b5455]/20 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Checkbox de Términos y Condiciones */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600 select-none">
                <input
                  type="checkbox"
                  checked={acceptTermsRegister}
                  onChange={(e) => setAcceptTermsRegister(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#7b5455] accent-[#7b5455] cursor-pointer shrink-0"
                />
                <span className="leading-tight">
                  Acepto los{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTermsModal(true);
                    }}
                    className="font-semibold text-[#7b5455] underline hover:text-[#583334]"
                  >
                    Términos del Servicio
                  </button>{" "}
                  y el tratamiento confidencial de mis datos (Ley 1581 de 2012).
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !acceptTermsRegister}
              className="w-full mt-3 py-3.5 px-4 bg-[#7b5455] hover:bg-[#634243] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-[#7b5455]/25 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Guardando perfil...</span>
                </div>
              ) : (
                <>
                  <span>Registrarme y Explorar Tienda</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Seguridad y Privacidad */}
        <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-1.5 font-medium text-gray-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Cifrado SSL de 256 bits</span>
          </div>
          <button
            type="button"
            onClick={() => setShowTermsModal(true)}
            className="text-[#7b5455] hover:underline flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ver Términos</span>
          </button>
        </div>
      </div>

      {/* MODAL DE TÉRMINOS Y CONDICIONES / PROTECCIÓN DE DATOS */}
      {showTermsModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-[#d4c2c2]/50 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#7b5455]" />
                <h3 className="font-serif text-lg font-bold text-gray-900">
                  Términos y Protección de Datos
                </h3>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#ebdcdc]">
                <strong className="text-gray-900 block mb-1">1. Titularidad del Emprendimiento</strong>
                <span>
                  <strong>Dulce Cosmetics</strong> es un emprendimiento comercial independiente de propiedad de <strong>Natalia Narváez</strong> con sede en Neiva, Huila (Carrera 7 #38-16 B/ Las Granjas). Todos los derechos de marca, catálogo fotográfico e inventario pertenecen exclusivamente a su titular.
                </span>
              </div>

              <div>
                <strong className="text-gray-900 block mb-1">2. Política de Pagos y Despachos</strong>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    <strong>En Neiva:</strong> Se encuentra disponible la opción de pago contraentrega en efectivo o transferencia electrónica (Nequi o Daviplata) al recibir el producto. Domicilio gratis en Las Granjas por compras desde $15.000 COP.
                  </li>
                  <li>
                    <strong>Envíos Fuera de Neiva (Nacional / Regional):</strong> Requiere el <strong>pago completo (100% anticipado)</strong> de los cosméticos antes del despacho. El flete de transporte se cancela contraentrega a la transportadora.
                  </li>
                </ul>
              </div>

              <div>
                <strong className="text-gray-900 block mb-1">3. Protección de Datos (Ley 1581 de 2012)</strong>
                <span>
                  Los datos personales suministrados (nombre, correo, teléfono y dirección) son estrictamente confidenciales y se emplearán únicamente para la coordinación de pedidos, facturación y asesoría de belleza personalizada. No se compartirán ni venderán a terceros bajo ninguna circunstancia.
                </span>
              </div>

              <div>
                <strong className="text-gray-900 block mb-1">4. Prohibición de Extracción y Clonación</strong>
                <span>
                  Queda estrictamente prohibida la copia parcial o total, extracción masiva automatizada (*scraping*) de fotografías o suplantación de la identidad comercial de Dulce Cosmetics.
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="px-6 py-2.5 bg-[#7b5455] hover:bg-[#623c3d] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
              >
                Entendido y Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-[#f4c2c2] selection:text-[#734e4e]">
      {/* Elementos decorativos de fondo con los tonos Luxe Editorial */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#f4c2c2]/35 to-[#e1e1c9]/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-[#ffe088]/20 to-[#f4c2c2]/35 blur-3xl pointer-events-none" />

      {/* Botón superior para volver a la tienda */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7b5455] hover:text-[#523536] bg-white/85 backdrop-blur-sm px-4 py-2 rounded-full border border-[#ebdcdc] shadow-xs hover:shadow transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a la Tienda</span>
        </Link>
      </div>

      <div className="max-w-6xl w-full mx-auto relative z-10 pt-10 sm:pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* COLUMNA IZQUIERDA: HERO VISUAL EN MOVIMIENTO & ESTÉTICA DE ALTA GAMA */}
          <div className="lg:col-span-6 relative overflow-hidden rounded-3xl shadow-2xl border border-[#d4c2c2]/50 aspect-[4/3] lg:aspect-[4/5] bg-neutral-900 group">
            {/* Video en movimiento estético / Loop de textura cosmética */}
            <video
              autoPlay
              loop
              muted
              playsInline
              poster="/images/products/paleta-de-sombras.jpg"
              className="absolute inset-0 w-full h-full object-cover opacity-75 scale-105 group-hover:scale-100 transition-transform duration-1000"
            >
              <source
                src="https://assets.mixkit.co/videos/preview/mixkit-applying-pink-lipstick-to-a-model-41527-large.mp4"
                type="video/mp4"
              />
            </video>

            {/* Gradiente cinemático superpuesto */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

            {/* Contenido Editorial sobre el Video */}
            <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between text-white z-10">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                  <Sparkles className="w-3.5 h-3.5 text-[#f1ca50]" />
                  <span className="text-[10px] uppercase tracking-widest font-semibold">
                    Editorial Luxe • Neiva
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/60 shadow-lg">
                  <Image
                    src="/logo.png"
                    alt="Dulce Cosmetics"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                  Realza tu <br />
                  <span className="italic font-normal text-[#f4c2c2]">resplandor natural.</span>
                </h2>

                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed max-w-md">
                  Fórmulas exclusivas resistentes al clima cálido de Neiva. Cosméticos, cuidado facial y asesoría de belleza directa con <strong>Natalia Narváez</strong>.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-gray-300">
                  <span className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                    <Truck className="w-3 h-3 text-[#f1ca50]" />
                    Contraentrega en Neiva
                  </span>
                  <span className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                    <Heart className="w-3 h-3 text-[#f4c2c2]" />
                    Sede Las Granjas
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: FORMULARIO INTERACTIVO (LOGIN O REGISTRO RÁPIDO) */}
          <div className="lg:col-span-6">
            <div className="text-center mb-6">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#735c00] font-bold block mb-1">
                Portal de Acceso • Dulce Cosmetics
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
                Bienvenida a tu Espacio
              </h1>
            </div>

            <Suspense
              fallback={
                <div className="p-8 text-center text-xs text-gray-500 animate-pulse bg-white rounded-3xl border border-gray-200">
                  Cargando portal de acceso seguro...
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
